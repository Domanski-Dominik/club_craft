"use client";

import { Typography, Card, CardContent, Fab, Avatar, Box } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import GroupsIcon from "@mui/icons-material/Groups";

type GroupCardProps = {
	groups: {
		id: number;
		name: string;
		dayOfWeek: number;
		timeS: string;
		timeE: string;
		club: string;
		participants: number;
		active: number;
	}[];
	handleAddGroupClick: () => void;
	handleClick: (id: string | number) => void;
	owner: boolean;
};

const GrCard = ({
	groups,
	handleClick,
	owner,
	handleAddGroupClick,
}: GroupCardProps) => {
	const handleGroupClick = (id: number | string) => {
		handleClick(id); //Przekazuje ID klikniętej karty do funkcji handleClick
	};
	return (
		<>
			<Grid
				container
				spacing={1}
				paddingTop={3}
				width={"100%"}>
				{groups.map((group) => {
					return (
						<Grid
							key={group.id}
							xs={12}
							sm={6}
							md={6}
							lg={4}
							xl={3}>
							<Card
								variant='outlined'
								onClick={() => handleGroupClick(group.id)}>
								<CardContent sx={{ display: "flex", alignItems: "center" }}>
									<Box>
										<Avatar
											sx={{
												width: 35,
												height: 35,
												backgroundColor: "#3f51b5",
											}}>
											<GroupsIcon style={{ color: "white" }} />
										</Avatar>
									</Box>
									<Box sx={{ ml: 2, width: "100%" }}>
										<Typography
											variant='h5'
											component='div'>
											{group.name}
										</Typography>
										<Box
											sx={{ display: "flex", justifyContent: "space-between" }}>
											<Typography variant='body2'>
												<span style={{ fontWeight: "bold" }}>
													{group.participants}{" "}
												</span>
												uczestników
											</Typography>
											<Typography variant='body2'>
												{" "}
												{group.timeS} {" - "}
												{group.timeE}
											</Typography>
										</Box>
									</Box>
								</CardContent>
							</Card>
						</Grid>
					);
				})}
			</Grid>
			{owner && (
				<Fab
					onClick={handleAddGroupClick}
					sx={{ mt: 2, mb: 1 }}
					color='primary'
					variant='extended'
					size='small'>
					<EditCalendarIcon sx={{ mr: 1 }} />
					Zarządzaj grupami
				</Fab>
			)}
		</>
	);
};

export default GrCard;
