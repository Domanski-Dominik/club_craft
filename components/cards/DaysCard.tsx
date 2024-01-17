import { Button, Typography, Card, CardContent } from "@mui/material";
import { Group } from "@/types/type";
import Grid from "@mui/material/Unstable_Grid2";
import PolishDayName from "@/context/PolishDayName";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";

type DaysCardProps = {
	gr: { [dayOfWeek: number]: Group[] };
	handleClick: (id: string | number) => void;
	handleAddGroupClick: () => void;
	owner: boolean;
};

const DaysCard = ({
	gr,
	handleClick,
	owner,
	handleAddGroupClick,
}: DaysCardProps) => {
	const handleDayClick = (id: number) => {
		handleClick(id); //Przekazuje ID klikniętej karty do funkcji handleClick
		//console.log(id);
	};
	const sortedDaysOfWeek = Object.keys(gr)
		.map((day) => parseInt(day, 10))
		.sort((a, b) => {
			if (a === 0) return 1;
			if (b === 0) return -1;
			return a - b;
		});
	return (
		<Grid
			container
			paddingTop={3}
			spacing={1}
			width={"100%"}>
			{sortedDaysOfWeek.map((day) => {
				const groupsForDay = gr[day];
				// Sortuj grupy według timeS
				groupsForDay.sort((a, b) => {
					// Zakładam, że timeS to string w formacie HH:mm
					const timeSArr = a.timeS.split(":");
					const timeSValueA =
						parseInt(timeSArr[0]) * 60 + parseInt(timeSArr[1]);

					const timeSArrB = b.timeS.split(":");
					const timeSValueB =
						parseInt(timeSArrB[0]) * 60 + parseInt(timeSArrB[1]);

					return timeSValueA - timeSValueB;
				});

				return (
					<Grid
						key={day}
						xs={12}
						sm={6}
						md={6}
						lg={4}
						xl={3}>
						<Card
							variant='outlined'
							onClick={() => handleDayClick(day)}>
							<CardContent>
								<Typography
									variant='h5'
									component='div'
									align='center'>
									{PolishDayName(day)}
								</Typography>
								<Typography variant='body1'>
									{groupsForDay.map((group) => `${group.name}, `)}
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

export default DaysCard;
