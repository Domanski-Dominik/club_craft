"use client";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import { Snackbar, Alert, AlertProps } from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupsIcon from "@mui/icons-material/Groups";
import VerifiedIcon from "@mui/icons-material/Verified";
import EditIcon from "@mui/icons-material/Edit";
import {
	Chip,
	Divider,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Button,
	Avatar,
	Fab,
	Box,
} from "@mui/material";
import { useState } from "react";
import Loading from "./Loading";
import { useQuery } from "@tanstack/react-query";

type Props = {
	id: string;
};
type Info = {
	club: string;
	createdAt: string;
	email: string;
	emailVerified: string;
	name: string;
	surname: string;
	role: string;
};

export const User = ({ id }: Props) => {
	const [snackbar, setSnackbar] = useState<Pick<
		AlertProps,
		"children" | "severity"
	> | null>(null);
	const profile = useQuery({
		queryKey: ["profile"],
		queryFn: () => fetch(`/api/user/profile/${id}`).then((res) => res.json()),
	});
	const handleCloseSnackbar = () => setSnackbar(null);
	const handleVerify = async () => {
		if (profile.data !== undefined) {
			const email = profile.data.email;
			const verify = await fetch("/api/auth/verifyEmail", {
				method: "POST",
				body: JSON.stringify({ email: email }),
			});
			const response = await verify.json();
			if (!response.error) {
				setSnackbar({ children: response.message, severity: "success" });
			} else {
				setSnackbar({ children: response.error, severity: "error" });
			}
		}
	};
	if (profile.isFetching) return <Loading />;
	if (profile.isSuccess)
		return (
			<>
				{profile.data !== undefined && (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							backgroundColor: "white",
							borderRadius: 4,
							width: "100%",
							height: "100%",
							justifyContent: "center",
							alignContent: "center",
							justifyItems: "center",
							alignItems: "center",
							p: 2,
						}}>
						<Avatar
							sx={{ width: 70, height: 70, mb: 2, bgcolor: "primary.main" }}>
							<PersonIcon sx={{ width: 40, height: 40, color: "white" }} />
						</Avatar>

						<List sx={{ width: "100%" }}>
							<Divider component='li'>
								<Chip
									label='Imię i nazwisko'
									size='small'
									color='primary'
									variant='outlined'
								/>
							</Divider>
							<ListItem>
								<ListItemAvatar>
									<PersonIcon color='primary' />
								</ListItemAvatar>
								<ListItemText>
									{profile.data.name} {profile.data.surname}
								</ListItemText>
							</ListItem>
							<Divider component='li'>
								<Chip
									label='Email @'
									size='small'
									color='primary'
									variant='outlined'
								/>
							</Divider>
							<ListItem>
								<ListItemAvatar>
									<EmailIcon color='primary' />
								</ListItemAvatar>
								<ListItemText>{profile.data.email}</ListItemText>
							</ListItem>

							<Divider component='li'>
								<Chip
									label='Klub'
									size='small'
									color='primary'
									variant='outlined'
								/>
							</Divider>
							<ListItem>
								<ListItemAvatar>
									<GroupsIcon color='primary' />
								</ListItemAvatar>
								<ListItemText>{profile.data.club}</ListItemText>
							</ListItem>
							<Divider component='li'>
								<Chip
									label='Uprawnienia'
									size='small'
									color='primary'
									variant='outlined'
								/>
							</Divider>
							<ListItem>
								<ListItemAvatar>
									<SecurityIcon color='primary' />
								</ListItemAvatar>
								<ListItemText>
									{profile.data.role === "owner" ? "Założyciel" : "Trener"}
								</ListItemText>
							</ListItem>
							<Divider component='li'>
								<Chip
									label='Data założenia konta'
									size='small'
									color='primary'
									variant='outlined'
								/>
							</Divider>
							<ListItem>
								<ListItemAvatar>
									<CalendarMonthIcon color='primary' />
								</ListItemAvatar>
								<ListItemText>
									{profile.data.createdAt.substring(0, 10)}
								</ListItemText>
							</ListItem>
							<Divider component='li'>
								<Chip
									label='Zweryfikowany email '
									size='small'
									color='primary'
									variant='outlined'
								/>
							</Divider>
							<ListItem
								secondaryAction={
									profile.data.emailVerified === null && (
										<Button
											onClick={handleVerify}
											color='primary'>
											Zweryfikuj
										</Button>
									)
								}>
								<ListItemAvatar>
									<VerifiedIcon color='primary' />
								</ListItemAvatar>
								<ListItemText>
									{profile.data.emailVerified === null ? "Nie" : "Tak"}
								</ListItemText>
							</ListItem>
						</List>
						{/*<Fab
							variant='extended'
							disabled
							size='small'
							color='primary'>
							<EditIcon sx={{ mr: 1 }} />
							Edytuj Profil
						</Fab>*/}
					</Box>
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
};
