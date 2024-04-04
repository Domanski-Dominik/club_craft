"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import Loading from "@/context/Loading";
import { useQuery, QueryCache } from "@tanstack/react-query";
import {
	useUpdateGroup,
	useDeleteGroup,
	useAddGroup,
} from "@/hooks/scheduleHooks";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import plLocale from "@fullcalendar/core/locales/pl";
import { EventClickArg, EventInput } from "@fullcalendar/core";

import {
	FormControl,
	TextField,
	Button,
	MenuItem,
	InputLabel,
	Select,
	Box,
	useMediaQuery,
	useTheme,
	AlertProps,
	Snackbar,
	Alert,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import SendIcon from "@mui/icons-material/Send";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { plPL } from "@mui/x-date-pickers/locales";

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
	color: string;
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

const colorsOptions = [
	{ value: "#3788d8", label: "Niebieski" },
	{ value: "#228B22", label: "Zielony" },
	{ value: "#9400D3", label: "Fioletowy" },
	{ value: "#DC143C", label: "Czerwony" },
	{ value: "#FFD700", label: "Złoty" },
	{ value: "#FF8C00", label: "Pomarańczowy" },
	{ value: "#00ffc8", label: "Cyjan" },
	{ value: "#f200ff", label: "Różowy" },
];

const CreateGroups = ({ params }: Props) => {
	const locationIdNum = parseInt(params.id, 10);
	const [isClicked, setIsClicked] = useState(false);
	const [club, setClub] = useState("guest");
	const router = useRouter();
	const theme = useTheme();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
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
		color: "#3788d8",
	});
	const schedule = useQuery({
		queryKey: ["schedule", params.id],
		queryFn: () => fetch(`/api/loc/gr/${params.id}`).then((res) => res.json()),
		select: (data) =>
			data.map((group: Group) => ({
				id: `${group.id}`,
				title: group.name,
				daysOfWeek: [group.dayOfWeek],
				startTime: `${group.timeS}:00`,
				endTime: `${group.timeE}:00`,
				allDay: false,
				backgroundColor: group.color,
				borderColor: group.color,
			})),
	});
	const updateGroup = useUpdateGroup();
	const deleteGroup = useDeleteGroup();
	const addGroup = useAddGroup();
	const queryCache = new QueryCache({
		onError: (error) => {
			console.log(error);
		},
		onSuccess: (data) => {
			console.log(data);
		},
		onSettled: (data, error) => {
			console.log(data, error);
		},
	});
	const query = queryCache.findAll();
	console.log(query);
	const [snackbar, setSnackbar] = useState<Pick<
		AlertProps,
		"children" | "severity"
	> | null>(null);
	const handleCloseSnackbar = () => setSnackbar(null);
	const clearGroupForm = () => {
		setNewGroup({
			...newGroup,
			id: null,
			name: "",
			timeS: "16:00",
			timeE: "17:00",
		});
	};
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const message = await addGroup.mutateAsync(newGroup);
		//console.log(message);
		if (!message.error) {
			schedule.refetch();
			setSnackbar({
				children: "Udało się dodać grupę",
				severity: "success",
			});
		} else {
			console.log(message.error);
			setSnackbar({ children: message.error, severity: "error" });
		}
		clearGroupForm();
	};
	const handleDelete = async (e: React.FormEvent) => {
		e.preventDefault();
		//console.log(newGroup);
		const message = await deleteGroup.mutateAsync(newGroup);
		//console.log(message);
		if (!message.error) {
			schedule.refetch();
			setSnackbar({
				children: "Udało się usunąć grupę",
				severity: "success",
			});
		} else {
			console.log(message.error);
			setSnackbar({ children: message.error, severity: "error" });
		}
		clearGroupForm();
		setIsClicked(false);
	};
	const handleEdit = async (e: React.FormEvent) => {
		e.preventDefault();
		//console.log(newGroup);
		const message = await updateGroup.mutateAsync(newGroup);
		//console.log(message);
		if (!message.error) {
			schedule.refetch();
			setSnackbar({
				children: "Udało się zaktualizować grupę",
				severity: "success",
			});
		} else {
			console.log(message.error);
			setSnackbar({ children: message.error, severity: "error" });
		}
		clearGroupForm();
		setIsClicked(false);
	};
	const handleDiscard = async (e: React.FormEvent) => {
		clearGroupForm();
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
		const color = clickInfo.event.backgroundColor;
		//console.log(color);

		setNewGroup({
			id: clickedId,
			name: clickInfo.event.title,
			dayOfWeek: dayName,
			timeS: `${hourS}:${minutesS}`,
			timeE: `${hourE}:${minutesE}`,
			locationId: locationIdNum,
			club: club,
			color: color,
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
			<Grid
				container
				component='form'
				onSubmit={handleSubmit}
				id='formId'
				spacing={2}
				sx={{ marginBottom: 1, width: "100%" }}>
				<Grid
					xs={6}
					sm={6}
					md={3}
					lg={3}>
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
				<Grid
					xs={6}
					sm={6}
					md={2}
					lg={2}>
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
					xs={3}
					sm={3}
					md={2}
					lg={1}>
					<FormControl>
						<LocalizationProvider
							dateAdapter={AdapterDateFns}
							localeText={
								plPL.components.MuiLocalizationProvider.defaultProps.localeText
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
					xs={3}
					sm={3}
					md={2}
					lg={1}>
					<FormControl>
						<LocalizationProvider
							dateAdapter={AdapterDateFns}
							localeText={
								plPL.components.MuiLocalizationProvider.defaultProps.localeText
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
				<Grid
					xs={6}
					sm={6}
					md={3}
					lg={2}>
					<FormControl fullWidth>
						<InputLabel id='color-label'>Kolor grupy</InputLabel>
						<Select
							labelId='color-label'
							id='color'
							value={newGroup.color}
							label='Kolor grupy'
							size='small'
							onChange={(e) =>
								setNewGroup({
									...newGroup,
									color: e.target.value,
								})
							}>
							{colorsOptions.map((option) => (
								<MenuItem
									key={option.label}
									value={option.value}>
									<div
										style={{
											width: "12px",
											height: "12px",
											marginRight: "8px",
											backgroundColor: option.value,
											border: "1px solid #ddd",
											display: "inline-block",
										}}></div>
									{option.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
				<Grid
					xs={4}
					sm={4}
					md={4}
					lg={1}>
					<Button
						fullWidth
						variant='outlined'
						onClick={handleDelete}
						disabled={!isClicked}
						color='error'
						startIcon={<DeleteIcon />}
						type='button'>
						Usuń
					</Button>
				</Grid>
				<Grid
					xs={4}
					sm={4}
					md={4}
					lg={1}>
					<Button
						fullWidth
						variant='contained'
						onClick={handleEdit}
						disabled={!isClicked}
						startIcon={<SaveIcon />}
						type='button'>
						Zapisz
					</Button>
				</Grid>
				<Grid
					xs={4}
					sm={4}
					md={4}
					lg={1}>
					{isClicked ? (
						<Button
							fullWidth
							variant='outlined'
							onClick={handleDiscard}
							endIcon={<CloseIcon />}
							type='button'>
							Anuluj
						</Button>
					) : (
						<Button
							fullWidth
							variant='contained'
							type='submit'
							endIcon={<SendIcon />}
							form='formId'>
							Dodaj
						</Button>
					)}
				</Grid>
			</Grid>
			<Box
				sx={{
					borderWidth: 1,
					width: "100%",
					minWidth: "350px",
					px: 1,
					borderColor: "#ffffff",
					height: isSmallScreen
						? "calc(100vh - 160px - 165px - 50px)"
						: "calc(100vh - 100px - 165px - 80px)",
				}}>
				<FullCalendar
					plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
					initialView='timeGridWeek'
					selectable={false}
					selectMirror={true}
					dayMaxEvents={true}
					slotMinTime={"06:00"}
					headerToolbar={false}
					scrollTime={"16:00"}
					slotDuration={"00:20:00"}
					height={"100%"}
					locale={plLocale}
					allDaySlot={false}
					dayHeaderFormat={{ weekday: "long" }}
					events={schedule.isSuccess ? schedule.data : []}
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
				sx={{ marginTop: 1 }}
				onClick={() => router.push("/home")}>
				Zakończ edycje grup
			</Button>
			{!!snackbar && (
				<Snackbar
					open
					anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
					autoHideDuration={2000}
					sx={{ position: "absolute", bottom: 90, zIndex: 20 }}
					onClose={handleCloseSnackbar}>
					<Alert
						{...snackbar}
						onClose={handleCloseSnackbar}
					/>
				</Snackbar>
			)}
		</>
	);
};

export default CreateGroups;
/*
	const [events, setEvents] = useState<EventInput[]>([]);

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
					backgroundColor: group.color,
					borderColor: group.color,
				}));
				//console.log("Formatted events: ", formattedEvents);

				setEvents(formattedEvents);
			} catch (error) {
				console.error("Błąd podczas pobierania grup: ", error);
			}
		};
		fetchGrups();
	}, []);
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
							backgroundColor: data.color,
							borderColor: data.color,
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

		try {
			const response = await fetch("/api/loc/gr", {
				method: "DELETE",
				body: JSON.stringify(newGroup),
			});
			const data = await response.json();
			//console.log("Grupa usunięta: ", data);
		} catch (error) {
			console.error("Błąd podczas usuwania grupy: ", error);
		}
		const idToDelete = `${newGroup.id}`;
		const updatedEvents = events.filter((event) => event.id !== idToDelete);

		setEvents(updatedEvents);
		//console.log(updatedEvents);

		try {
			const response = await fetch("/api/loc/gr", {
				method: "POST",
				body: JSON.stringify(newGroup),
			});
			const data = await response.json();
			//console.log("Nowa grupa dodana: ", data);
			if (response.ok) {
				const formattedNewGroup: EventInput = {
					id: `${data.id}`,
					title: data.name,
					daysOfWeek: [data.dayOfWeek],
					startTime: `${data.timeS}:00`,
					endTime: `${data.timeE}:00`,
					allDay: false,
					color: data.color,
				};
				setEvents([...events, formattedNewGroup]);
			}
		} catch (error) {
			console.error("Błąd podczas dodawania grupy: ", error);
		}
		//setGroups([...groups, newGroup]);
*/
