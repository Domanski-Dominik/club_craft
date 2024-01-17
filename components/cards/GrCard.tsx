"use client";

import { Typography, Card, CardContent } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";

type GroupCardProps = {
	groups: {
		id: number;
		name: string;
		dayOfWeek: number;
		timeS: string;
		timeE: string;
		club: string;
		participants: number;
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
		<Grid
			container
			spacing={1}
			paddingTop={3}
			width={"100%"}>
			{groups.map((group) => {
				return (
					<Grid
						key={group.timeS}
						xs={12}
						sm={6}
						md={6}
						lg={4}
						xl={3}>
						<Card
							variant='outlined'
							onClick={() => handleGroupClick(group.id)}>
							<CardContent>
								<Typography
									variant='h5'
									component='div'
									sx={{ marginBottom: 1, textAlign: "center" }}>
									{group.name}
								</Typography>

								<Typography variant='body2'>
									{" "}
									<span style={{ fontWeight: "bold" }}>
										{group.participants}{" "}
									</span>
									uczestników
								</Typography>
							</CardContent>
						</Card>
					</Grid>
				);
			})}
			{owner && (
				<Grid
					xs={12}
					sm={6}
					md={6}
					lg={4}
					xl={3}>
					<Card
						variant='outlined'
						onClick={handleAddGroupClick}
						sx={{ height: "100%" }}>
						<CardContent
							sx={{
								height: "100%",
							}}>
							<Typography
								mt={1}
								align='center'
								variant='h5'
								color={"darkviolet"}>
								<EditCalendarIcon /> Zarządzaj grupami
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			)}
		</Grid>
	);
};

export default GrCard;
