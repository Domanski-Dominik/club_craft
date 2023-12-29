"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import plLocale from "@fullcalendar/core/locales/pl";
import React, { useEffect, useState } from "react";
import { EventApi, EventClickArg, EventInput } from "@fullcalendar/core";

import {
	FormControl,
	TextField,
	Grid,
	Button,
	MenuItem,
	InputLabel,
	Select,
	Box,
} from "@mui/material";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { useRouter } from "next/navigation";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { plPL } from "@mui/x-date-pickers/locales";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Loading from "@/context/Loading";

interface Props {
	params: {
		id: string;
	};
}
interface Group {
	id: number | null;
	name: string;
	dayOfWeek: number;
	timeS: string;
	timeE: string;
	locationId: number;
	club: string;
}

const daysOfWeekOptions = [
	{ value: 1, label: "Poniedziałek" },
	{ value: 2, label: "Wtorek" },
	{ value: 3, label: "Środa" },
	{ value: 4, label: "Czwartek" },
	{ value: 5, label: "Piątek" },
	{ value: 6, label: "Sobota" },
	{ value: 0, label: "Niedziela" },
];

const CreateGroups = ({ params }: Props) => {
	const [events, setEvents] = useState<EventInput[]>([]);
	const locationIdNum = parseInt(params.id, 10);
	const [isClicked, setIsClicked] = useState(false);
	const [club, setClub] = useState("guest");
	const router = useRouter();
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const [newGroup, setNewGroup] = useState<Group>({
		id: null,
		name: "",
		dayOfWeek: 1,
		timeS: "16:00",
		timeE: "17:00",
		locationId: locationIdNum,
		club: club,
	});

	useEffect(() => {
		const fetchGrups = async () => {
			try {
				const response = await fetch(`/api/loc/gr/${params.id}`, {
					method: "GET",
				});
				const data = await response.json();
				//console.log(data);
				const formattedEvents: EventInput[] = data.map((group: Group) => ({
					id: `${group.id}`,
					title: group.name,
					daysOfWeek: [group.dayOfWeek],
					startTime: `${group.timeS}:00`,
					endTime: `${group.timeE}:00`,
					allDay: false,
				}));
				//console.log("Formatted events: ", formattedEvents);

				setEvents(formattedEvents);
			} catch (error) {
				console.error("Błąd podczas pobierania grup: ", error);
			}
		};
		fetchGrups();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const response = await fetch("/api/loc/gr", {
				method: "POST",
				body: JSON.stringify(newGroup),
			});
			const data = await response.json();
			console.log("Nowa grupa dodana: ", data);
			if (response.ok) {
				const formattedNewGroup: EventInput = {
					id: `${data.id}`,
					title: data.name,
					daysOfWeek: [data.dayOfWeek],
					startTime: `${data.timeS}:00`,
					endTime: `${data.timeE}:00`,
					allDay: false,
				};
				setEvents([...events, formattedNewGroup]);
			}
		} catch (error) {
			console.error("Błąd podczas dodawania grupy: ", error);
		}
		//setGroups([...groups, newGroup]);

		setNewGroup({
			...newGroup,
			id: null,
			name: "",
			timeS: "16:00",
			timeE: "17:00",
		});
	};
	const handleDelete = async (e: React.FormEvent) => {
		e.preventDefault();
		//console.log(newGroup);
		try {
			const response = await fetch("/api/loc/gr", {
				method: "DELETE",
				body: JSON.stringify(newGroup),
			});
			const data = await response.json();
			console.log("Grupa usunięta: ", data);
		} catch (error) {
			console.error("Błąd podczas usuwania grupy: ", error);
		}
		const idToDelete = `${newGroup.id}`;
		const updatedEvents = events.filter((event) => event.id !== idToDelete);

		setEvents(updatedEvents);
		//console.log(updatedEvents);
		setNewGroup({
			...newGroup,
			id: null,
			name: "",
			dayOfWeek: 1,
			timeS: "16:00",
			timeE: "17:00",
			club: club,
		});
		setIsClicked(false);
	};
	const handleEdit = async (e: React.FormEvent) => {
		//console.log(newGroup);
		try {
			const response = await fetch("/api/loc/gr", {
				method: "PUT",
				body: JSON.stringify(newGroup),
			});
			const data = await response.json();
			//console.log("Grupa edytowana: ", data);
			if (response.ok) {
				const updatedEvents = events.map((event) => {
					if (event.id === `${data.id}`) {
						return {
							...event,
							id: `${data.id}`,
							title: data.name,
							daysOfWeek: [data.dayOfWeek],
							startTime: `${data.timeS}:00`,
							endTime: `${data.timeE}:00`,
							allDay: false,
						};
					}
					return event;
				});
				setEvents(updatedEvents);
				//console.log(updatedEvents);
			}
		} catch (error) {
			console.error("Błąd podczas edytowania grupy: ", error);
		}
		setNewGroup({
			...newGroup,
			id: null,
			name: "",
			dayOfWeek: 1,
			timeS: "16:00",
			timeE: "17:00",
			club: club,
		});
		setIsClicked(false);
	};
	const handleDiscard = async (e: React.FormEvent) => {
		setNewGroup({
			...newGroup,
			id: null,
			name: "",
			dayOfWeek: 1,
			timeS: "16:00",
			timeE: "17:00",
			club: club,
		});
		setIsClicked(false);
	};

	const handleEventClick = (clickInfo: EventClickArg) => {
		//console.log(clickInfo);

		const clickedEventDate = clickInfo.event.startStr;
		const dayOfWeek = new Date(clickedEventDate).getDay();

		let dayName = 1;
		switch (dayOfWeek) {
			case 0:
				dayName = 0;
				break;
			case 1:
				dayName = 1;
				break;
			case 2:
				dayName = 2;
				break;
			case 3:
				dayName = 3;
				break;
			case 4:
				dayName = 4;
				break;
			case 5:
				dayName = 5;
				break;
			case 6:
				dayName = 6;
				break;
			default:
				dayName = 1;
		}
		const dateStringS = clickInfo.event.startStr;
		//console.log(clickInfo.event.startStr);

		const dateS = new Date(dateStringS);
		const hourS = ("0" + dateS.getHours()).slice(-2); // Dodaje zero przed jednocyfrowymi godzinami
		const minutesS = ("0" + dateS.getMinutes()).slice(-2); // Dodaje zero przed jednocyfrowymi minutami

		const dateStringE = clickInfo.event.endStr;

		const dateE = new Date(dateStringE);
		const hourE = ("0" + dateE.getHours()).slice(-2); // Dodaje zero przed jednocyfrowymi godzinami
		const minutesE = ("0" + dateE.getMinutes()).slice(-2); // Dodaje zero przed jednocyfrowymi minutami

		//console.log(clickInfo.event.id);
		const clickedId = parseInt(clickInfo.event.id);

		setNewGroup({
			id: clickedId,
			name: clickInfo.event.title,
			dayOfWeek: dayName,
			timeS: `${hourS}:${minutesS}`,
			timeE: `${hourE}:${minutesE}`,
			locationId: locationIdNum,
			club: club,
		});
		setIsClicked(true);
	};

	useEffect(() => {
		if (session?.user.club !== undefined) {
			setClub(session?.user.club);
			setNewGroup({ ...newGroup, club: session?.user.club });
		} else {
			setClub("guest");
		}
	}, [session]);

	if (status === "loading") return <Loading />;
	return (
		<>
			<form
				onSubmit={handleSubmit}
				id='formId'>
				<Grid
					container
					spacing={2}
					justifyContent='center'
					sx={{ marginBottom: "1rem" }}
					direction={"row"}>
					<Grid
						item
						xs={10}
						md={15}>
						<FormControl fullWidth>
							<TextField
								id={"outlined-basic"}
								type='text'
								value={newGroup.name}
								onChange={(e) =>
									setNewGroup({ ...newGroup, name: e.target.value })
								}
								label='Nazwa Grupy'
								variant='outlined'
								size='small'
								required
							/>
						</FormControl>
					</Grid>
					<Grid item>
						<FormControl fullWidth>
							<InputLabel id='dayOfWeek-label'>Dzień Tygodnia</InputLabel>
							<Select
								labelId='dayOfWeek-label'
								id='dayOfWeek'
								value={newGroup.dayOfWeek}
								label='Dzień Tygodnia'
								size='small'
								onChange={(e) =>
									setNewGroup({
										...newGroup,
										dayOfWeek: parseInt(e.target.value as string),
									})
								}>
								{daysOfWeekOptions.map((option) => (
									<MenuItem
										key={option.value}
										value={option.value}>
										{option.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
					<Grid
						item
						xs={3}>
						<FormControl>
							<LocalizationProvider
								dateAdapter={AdapterDateFns}
								localeText={
									plPL.components.MuiLocalizationProvider.defaultProps
										.localeText
								}>
								<MobileTimePicker
									minTime={new Date("2000-01-01T06:00")}
									label='Początek'
									ampm={false}
									slotProps={{ textField: { size: "small" } }}
									value={new Date(`2000-01-01T${newGroup.timeS}:00`)}
									onChange={(newValue) => {
										if (newValue !== null && newValue !== undefined) {
											const hours = newValue
												.getHours()
												.toString()
												.padStart(2, "0");
											const minutes = newValue
												.getMinutes()
												.toString()
												.padStart(2, "0");
											const newTimeS = `${hours}:${minutes}`;

											setNewGroup((prevGroup) => ({
												...prevGroup,
												timeS: newTimeS,
											}));
										}
									}}
								/>
							</LocalizationProvider>
						</FormControl>
					</Grid>
					<Grid
						item
						xs={3}>
						<FormControl>
							<LocalizationProvider
								dateAdapter={AdapterDateFns}
								localeText={
									plPL.components.MuiLocalizationProvider.defaultProps
										.localeText
								}>
								<MobileTimePicker
									minTime={new Date("2000-01-01T06:00")}
									label='Koniec'
									ampm={false}
									slotProps={{ textField: { size: "small" } }}
									value={new Date(`2000-01-01T${newGroup.timeE}:00`)}
									onChange={(newValue) => {
										if (newValue !== null && newValue !== undefined) {
											const hours = newValue
												.getHours()
												.toString()
												.padStart(2, "0");
											const minutes = newValue
												.getMinutes()
												.toString()
												.padStart(2, "0");
											const newTimeE = `${hours}:${minutes}`;

											setNewGroup((prevGroup) => ({
												...prevGroup,
												timeE: newTimeE,
											}));
										}
									}}
								/>
							</LocalizationProvider>
						</FormControl>
					</Grid>
				</Grid>
				<Grid
					container
					justifyContent={"space-around"}
					sx={{ marginBottom: "1rem" }}>
					<Button
						variant='outlined'
						onClick={handleDelete}
						disabled={!isClicked}
						color='error'
						type='button'>
						Usuń
					</Button>
					<Button
						variant='outlined'
						onClick={handleEdit}
						disabled={!isClicked}
						color='info'
						type='button'>
						Zapisz zmiany
					</Button>
					{isClicked ? (
						<Button
							variant='outlined'
							onClick={handleDiscard}
							color='warning'
							type='button'>
							Anuluj
						</Button>
					) : (
						<Button
							variant='outlined'
							type='submit'
							color='success'
							form='formId'>
							Dodaj
						</Button>
					)}
				</Grid>
			</form>
			<Box
				sx={{
					borderWidth: "0.5px",
					width: "95%",
					minWidth: "350px",
					borderColor: "white",
				}}>
				<FullCalendar
					plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
					initialView='timeGridWeek'
					selectable={true}
					selectMirror={true}
					dayMaxEvents={true}
					slotMinTime={"06:00"}
					headerToolbar={false}
					scrollTime={"16:00"}
					slotDuration={"00:20:00"}
					height={300}
					locale={plLocale}
					allDaySlot={false}
					dayHeaderFormat={{ weekday: "long" }}
					events={events}
					/*events={groups.map((group) => ({
            title: group.name,
            daysOfWeek: [group.dayOfWeek],
            startTime: group.timeS,
            endTime: group.timeE,
          }))}*/

					// called after events are initialized/added/changed/removed
					//you can update a remote database when these fire:
					eventAdd={function () {
						console.log("dodano event");
					}}
					eventChange={function () {}}
					eventRemove={function () {}}
					eventClick={handleEventClick}
				/>
			</Box>
			<Button
				variant='contained'
				fullWidth
				sx={{ marginTop: "1rem" }}
				onClick={() => router.push("/locations")}>
				Zakończ edycje grup
			</Button>
		</>
	);
};

export default CreateGroups;
