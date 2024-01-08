"use client";
import * as React from "react";
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import { Box, Button, ListItem, Typography } from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import DraftsIcon from "@mui/icons-material/Drafts";
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
	const [loading, setLoading] = React.useState(true);
	const [isOwner, setIsOwner] = React.useState(false);
	const [error, setError] = React.useState("");
	const [data, setData] = React.useState<Location[]>([]);
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const [openDays, setOpenDays] = React.useState<number[]>([]);
	const [openDaysDetail, setOpenDaysDetail] = React.useState<{
		[key: number]: { [key: number]: boolean };
	}>({});
	const pages = [
		{ id: 1, title: "Klub", path: "/home" },
		{
			id: 2,
			title: "Grupy",
			path: "/home/groups",
		},
	];
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
		const groupsByDay: { [key: number]: string[] } = {};

		location.locationschedule.forEach((group) => {
			const { dayOfWeek, name } = group;

			if (!groupsByDay[dayOfWeek]) {
				groupsByDay[dayOfWeek] = [];
			}

			groupsByDay[dayOfWeek].push(name);
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

	React.useEffect(() => {
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
								secondaryAction={
									isOwner && (
										<EditIcon
											color='warning'
											onClick={() =>
												router.push(`/locations/new/${location.id}`)
											}
										/>
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
													sx={{ pl: 4 }}>
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
														sx={{ pl: 6 }}
														component='div'
														disablePadding>
														{groups.map((groupName, groupIndex) => (
															<ListItem key={groupIndex}>
																<ListItemIcon>
																	<GroupIcon />
																</ListItemIcon>
																<ListItemText primary={groupName} />
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
					<Button
						variant='contained'
						sx={{ width: "50vw", my: 2 }}
						onClick={() => router.push("/locations/new")}>
						Dodaj Lokalizację
					</Button>
				)}
			</>
		);
	} else {
		return (
			<>
				<MobileNavigation pages={pages} />
				<Typography
					variant='h5'
					align='center'
					color='error'>
					{error},
					<br />
					sprawdź połączenie z internetem
				</Typography>
			</>
		);
	}
};
export default GroupList;
