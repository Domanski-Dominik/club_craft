"use client";
import { useState, useEffect } from "react";
import React from "react";
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import {
	Snackbar,
	Alert,
	AlertProps,
	Button,
	ListItem,
	Stack,
	Typography,
} from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import PolishDayName from "@/context/PolishDayName";
import Loading from "@/context/Loading";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import DialogDeleteLoc from "@/components/dialogs/DialogDeleteLoc";

type Location = {
	id: number;
	name: string;
	locationschedule: {
		id: number;
		dayOfWeek: number;
		name: string;
		timeE: string;
		timeS: string;
	}[];
};

const GroupList = () => {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [isOwner, setIsOwner] = useState(false);
	const [error, setError] = useState("");
	const [data, setData] = useState<Location[]>([]);
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const [deleteLoc, setDeleteLoc] = useState<Location | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [openDays, setOpenDays] = useState<number[]>([]);
	const [openDaysDetail, setOpenDaysDetail] = useState<{
		[key: number]: { [key: number]: boolean };
	}>({});
	const [snackbar, setSnackbar] = React.useState<Pick<
		AlertProps,
		"children" | "severity"
	> | null>(null);
	const pages = [
		{ id: 1, title: "Klub", path: "/home" },
		{
			id: 2,
			title: "Grupy",
			path: "/home/groups",
		},
	];
	const handleCloseSnackbar = () => setSnackbar(null);
	const handleClick = (index: number) => {
		setOpenDays((prevOpen) => {
			const isOpen = prevOpen.includes(index);
			if (isOpen) {
				return prevOpen.filter((day) => day !== index);
			} else {
				return [...prevOpen, index];
			}
		});
	};

	const handleDetailClick = (locationIndex: number, dayOfWeek: number) => {
		setOpenDaysDetail((prevOpen) => {
			const isOpen =
				prevOpen[locationIndex] && prevOpen[locationIndex][dayOfWeek];
			const newOpen = { ...prevOpen };
			newOpen[locationIndex] = {
				...newOpen[locationIndex],
				[dayOfWeek]: !isOpen,
			};
			return newOpen;
		});
	};
	const collectGroupsByDay = (location: Location) => {
		const groupsByDay: { [key: number]: { name: string; id: string }[] } = {};

		location.locationschedule.forEach((group) => {
			const { dayOfWeek, name, id } = group;

			if (!groupsByDay[dayOfWeek]) {
				groupsByDay[dayOfWeek] = [];
			}

			groupsByDay[dayOfWeek].push({ name: name, id: String(id) });
		});

		return groupsByDay;
	};

	const fetchLoc = async () => {
		if (session?.user || status === "authenticated") {
			if (session.user.role === "owner" || session.user.role === "admin") {
				const response = await fetch(
					`/api/grList/${session.user.role}/${session.user.club}`,
					{
						method: "GET",
					}
				);
				const data = await response.json();
				console.log(data);
				if (Array.isArray(data)) {
					setData(data);
					setLoading(false);
					setError("");
					setIsOwner(true);
				} else {
					setError(data.error);
					setLoading(false);
				}
			}
			if (session.user.role === "coach") {
				const response = await fetch(
					`/api/grList/${session.user.role}/${session.user.club}/${session.user.id}`,
					{
						method: "GET",
					}
				);
				const data = await response.json();
				console.log(data);
				if (Array.isArray(data)) {
					setData(data);
					setLoading(false);
					setError("");
				} else {
					setError(data.error);
					setLoading(false);
				}
			}
		}
	};

	const handleChoice = async (value: string) => {
		console.log(value);
		setDialogOpen(false);
		if (value === "yes" && deleteLoc !== null) {
			try {
				const response = await fetch("/api/loc", {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(deleteLoc), // Przekaż zaktualizowane dane uczestnika
				});
				const message = await response.json();
				if (!message.error) {
					console.log(message);
					setSnackbar({
						children: message.message,
						severity: "success",
					});
					setData(data.filter((loc) => loc.id !== deleteLoc.id));
				} else {
					console.log(message);
					setSnackbar({ children: message.error, severity: "error" });
				}
			} catch (error) {
				setSnackbar({
					children: "Wystąpił bład podczas komunikacją z bazą danych",
					severity: "error",
				});
			}
		} else {
			setDeleteLoc(null);
		}
	};

	useEffect(() => {
		fetchLoc();
	}, [session]);
	if (loading) return <Loading />;
	if (data.length > 0) {
		return (
			<>
				<MobileNavigation pages={pages} />
				<List
					sx={{
						width: "100%",
						bgcolor: "background.paper",
					}}
					aria-labelledby='nested-list-subheader'
					subheader={
						<ListSubheader
							component='div'
							id='nested-list-subheader'>
							Lista lokalizacji
						</ListSubheader>
					}>
					{data.map((location, locationIndex) => (
						<React.Fragment key={location.id}>
							<ListItem
								sx={{ pr: isEdit && isOwner ? 9 : 0 }}
								secondaryAction={
									isOwner &&
									isEdit && (
										<>
											<DeleteIcon
												color='error'
												sx={{ mr: 2 }}
												onClick={() => {
													setDeleteLoc(location);
													setDialogOpen(true);
													console.log("clicked");
												}}
											/>
											<EditIcon
												color='warning'
												sx={{ mr: 2 }}
												onClick={() =>
													router.push(`/locations/edit/${location.id}`)
												}
											/>
											<EditCalendarIcon
												color='secondary'
												onClick={() =>
													router.push(`/locations/new/${location.id}`)
												}
											/>
										</>
									)
								}
								disablePadding>
								<ListItemButton onClick={() => handleClick(locationIndex)}>
									<ListItemIcon>
										<LocationOnIcon color='primary' />
									</ListItemIcon>
									<ListItemText
										primary={location.name}
										primaryTypographyProps={{ color: "primary" }}
									/>
									{openDays.includes(locationIndex) ? (
										<ExpandLess />
									) : (
										<ExpandMore />
									)}
								</ListItemButton>
							</ListItem>
							<Collapse
								in={openDays.includes(locationIndex)}
								timeout='auto'
								unmountOnExit>
								<List
									component='div'
									disablePadding>
									{Object.entries(collectGroupsByDay(location)).map(
										([dayOfWeek, groups], dayIndex) => (
											<React.Fragment key={dayIndex}>
												<ListItemButton
													onClick={() =>
														handleDetailClick(locationIndex, Number(dayOfWeek))
													}
													sx={{ pl: 3, pr: 5 }}>
													<ListItemIcon>
														<CalendarTodayIcon color='secondary' />
													</ListItemIcon>
													<ListItemText
														primary={PolishDayName(Number(dayOfWeek))}
														primaryTypographyProps={{ color: "secondary" }}
													/>
													{groups.length > 0 &&
														(openDaysDetail[locationIndex] &&
														openDaysDetail[locationIndex][Number(dayOfWeek)] ? (
															<ExpandLess />
														) : (
															<ExpandMore />
														))}
												</ListItemButton>
												<Collapse
													in={
														openDaysDetail[locationIndex] &&
														openDaysDetail[locationIndex][Number(dayOfWeek)]
													}
													timeout='auto'
													unmountOnExit>
													<List
														sx={{ pl: 3 }}
														component='div'
														disablePadding>
														{groups.map((group, index) => (
															<ListItem
																secondaryAction={
																	<VisibilityIcon
																		onClick={() =>
																			router.push(`/group/${group.id}`)
																		}
																	/>
																}
																key={index}>
																<ListItemIcon>
																	<GroupIcon />
																</ListItemIcon>
																<ListItemText primary={group.name} />
															</ListItem>
														))}
													</List>
												</Collapse>
											</React.Fragment>
										)
									)}
								</List>
							</Collapse>
						</React.Fragment>
					))}
				</List>
				{isOwner && (
					<Stack
						direction='row'
						spacing={2}
						sx={{ my: 2 }}>
						<Button
							variant='outlined'
							startIcon={<EditIcon />}
							onClick={() => setIsEdit((prev) => !prev)}>
							{isEdit ? "Zakończ Edycje" : "Edytuj"}
						</Button>
						<Button
							variant='contained'
							onClick={() => router.push("/locations/new")}>
							Dodaj Lokalizację
						</Button>
					</Stack>
				)}
				{deleteLoc && (
					<DialogDeleteLoc
						open={dialogOpen}
						name={deleteLoc?.name}
						onClose={handleChoice}
					/>
				)}
				{!!snackbar && (
					<Snackbar
						open
						anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
						autoHideDuration={3000}
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
	} else {
		return (
			<>
				{error !== "" ? (
					<>
						<MobileNavigation pages={pages} />
						<Typography
							variant='h5'
							align='center'
							color='error'>
							{error}
							<br />
						</Typography>
					</>
				) : (
					<>
						<MobileNavigation pages={pages} />
						<Typography
							variant='h3'
							mb={3}
							align='center'>
							Najpier stwórz lokalizacje
						</Typography>
						<Button
							variant='contained'
							size='large'
							onClick={() => router.push("/locations/new")}>
							Dodaj Lokalizacje
						</Button>
					</>
				)}
			</>
		);
	}
};
export default GroupList;
