"use client";
import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import plLocale from "@fullcalendar/core/locales/pl";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { formatISO, addWeeks, parse } from "date-fns";
import { useMediaQuery, useTheme, Box } from "@mui/material";

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
const Calendar = () => {
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const groups = useQuery({
		queryKey: ["groups"],
		enabled: !!session,
		queryFn: () =>
			fetch(
				`/api/groups/calendar/${session?.user.role}/${session?.user.club}/${session?.user.id}`
			).then((res) => res.json()),
		select: (data) =>
			data.flatMap((group: any) =>
				group.terms.flatMap((term: any) => generateRecurringEvents(group, term))
			),
	});
	const theme = useTheme();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
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
				events={groups.isSuccess ? groups.data : []}
				headerToolbar={{
					start: "title",
					center: "",
					end: "timeGridWeek,timeGridDay,listWeek",
				}}
				footerToolbar={{
					start: "",
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
				eventAdd={function () {
					console.log("dodano event");
				}}
				eventChange={function () {}}
				eventRemove={function () {}}

				//eventClick={handleEventClick}
			/>
		</Box>
	);
};

export default Calendar;
