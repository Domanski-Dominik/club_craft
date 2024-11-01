"use client";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import plLocale from "@fullcalendar/core/locales/pl";
import { formatISO, addWeeks, parse } from "date-fns";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import {
	useMediaQuery,
	useTheme,
	Box,
	Drawer,
	FormControl,
	Select,
	InputLabel,
	Typography,
	SwipeableDrawer,
	MenuItem,
} from "@mui/material";
import { CustomButtonInput } from "@fullcalendar/core/index.js";
import { Stack2, TypographyStack } from "@/components/styled/StyledComponents";
import { Location } from "@/types/type";

interface CalendarProps {
	events: any;
	iOS: boolean;
	locs: any;
}
function calculateEventDate(
	date: Date,
	dayOfWeek: number,
	time: string
): string {
	const eventDate = new Date(date);

	// Przesuń datę do odpowiedniego dnia tygodnia
	eventDate.setDate(
		eventDate.getDate() + ((dayOfWeek + 6 - eventDate.getDay()) % 7)
	);

	// Ustaw godzinę
	const [hours, minutes] = time.split(":").map(Number);
	eventDate.setHours(hours, minutes, 0, 0);

	return formatISO(eventDate);
}
function generateRecurringEvents(group: any, term: any): any[] {
	const startDate = parse(group.firstLesson, "dd-MM-yyyy", new Date());
	const endDate = parse(group.lastLesson, "dd-MM-yyyy", new Date());
	const events = [];

	let currentDate = startDate;
	while (currentDate <= endDate) {
		const event = {
			id: `${group.id}-${formatISO(currentDate, {
				representation: "date",
			})}`,
			title: `${group.name} ${term.location.name}`,
			start: calculateEventDate(currentDate, term.dayOfWeek + 1, term.timeS),
			end: calculateEventDate(currentDate, term.dayOfWeek + 1, term.timeE),
			color: group.color,
			groupId: term.locationId,
			url: `/group/${group.id}`,
		};
		events.push(event);
		currentDate = addWeeks(currentDate, 1); // Increment by one week
	}
	return events;
}

const MainCalendar = ({ events, iOS, locs }: CalendarProps) => {
	const theme = useTheme();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
	const [drawer, setDrawer] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState<string>("all");
	const formattedEvents = events.flatMap((group: any) =>
		group.terms.flatMap((term: any) => generateRecurringEvents(group, term))
	);
	const filteredEvents =
		selectedLocation === "all"
			? formattedEvents
			: formattedEvents.filter(
					(event: any) => event.groupId === parseInt(selectedLocation, 10)
			  );
	return (
		<Box
			sx={{
				borderWidth: 1,
				width: "100%",
				minWidth: "350px",
				px: 1,
				borderColor: "#ffffff",
				height: isSmallScreen ? "calc(100vh - 180px)" : "calc(100vh - 180px)",
				minHeight: "500px",
				backgroundColor: "white",
				p: 2,
				borderRadius: 4,
			}}>
			<FullCalendar
				customButtons={{
					filter: {
						text: "Filtruj",
						click: function () {
							setDrawer((prev) => !prev);
						},
					},
				}}
				plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
				aspectRatio={2}
				expandRows={true}
				selectable={false}
				selectMirror={true}
				dayMaxEvents={true}
				stickyHeaderDates={true}
				locale={plLocale}
				allDaySlot={false}
				slotMinTime={"06:00"}
				scrollTime={"16:00"}
				slotDuration={"00:10:00"}
				dayHeaderFormat={{ weekday: "long" }}
				initialView='timeGridDay'
				height={"100%"}
				events={filteredEvents}
				nowIndicator
				eventOrder={["-groupId", "title"]}
				headerToolbar={{
					start: "title",
					center: "",
					end: "timeGridWeek,timeGridDay,listWeek",
				}}
				footerToolbar={{
					start: "filter",
					end: "today prev,next",
				}}
				views={{
					dayGrid: {
						// options apply to dayGridMonth, dayGridWeek, and dayGridDay views
					},
					timeGrid: {
						// options apply to timeGridWeek and timeGridDay views
					},
					week: {
						// options apply to dayGridWeek and timeGridWeek views
					},
					day: {
						// options apply to dayGridDay and timeGridDay views
					},
				}}
				slotLabelFormat={{
					hour: "2-digit",
					minute: "2-digit",
					omitZeroMinute: false,
				}}
				//eventClick={handleEventClick}
			/>
			<SwipeableDrawer
				anchor='bottom'
				open={drawer}
				onClose={() => setDrawer((prev) => !prev)}
				onOpen={() => setDrawer((prev) => !prev)}
				disableBackdropTransition={!iOS}
				disableDiscovery={iOS}>
				<Box height={300}>
					<Typography
						align='center'
						variant='h4'
						color={theme.palette.primary.main}
						sx={{
							mt: 2,
							display: "flex",
							alignContent: "center",
							justifyContent: "center",
						}}>
						Filtruj{" "}
						<FilterAltIcon
							color='primary'
							fontSize='large'
						/>
					</Typography>
					<Box sx={{ width: "100%", px: 5, py: 2 }}>
						<Stack2>
							<TypographyStack variant='h6'>Lokalizacje:</TypographyStack>
							<Box width='50%'>
								<FormControl fullWidth>
									<InputLabel id='location'>Lokalizacja</InputLabel>
									<Select
										defaultValue='all'
										value={selectedLocation}
										onChange={(e) =>
											setSelectedLocation(e.target.value as string | "all")
										}>
										<MenuItem value='all'>Wszystkie</MenuItem>
										{locs.map((l: Location, index: number) => (
											<MenuItem
												key={index}
												value={l.id}>
												{l.name}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>
						</Stack2>
						<Stack2>
							<TypographyStack variant='h6'>Typ zajęć:</TypographyStack>
							<Box width='50%'>
								<FormControl fullWidth>
									<InputLabel id='classType'>Typ zajęć</InputLabel>
									<Select defaultValue='all'>
										<MenuItem value='all'>Wszystkie</MenuItem>
									</Select>
								</FormControl>
							</Box>
						</Stack2>
					</Box>
				</Box>
			</SwipeableDrawer>
		</Box>
	);
};

export default MainCalendar;
