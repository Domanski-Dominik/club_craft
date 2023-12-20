import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Group } from "@/types/type";
import Grid from "@mui/material/Unstable_Grid2";
import PolishDayName from "@/context/PolishDayName";

type DaysCardProps = {
	gr: { [dayOfWeek: number]: Group[] };
	handleClick: (id: string | number) => void;
	cols: number;
};

const DaysCard = ({ gr, handleClick, cols }: DaysCardProps) => {
	const handleDayClick = (id: number) => {
		handleClick(id); //Przekazuje ID klikniętej karty do funkcji handleClick
		console.log(id);
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
			columns={cols}
			rowSpacing={2}
			columnSpacing={0.5}
			justifyContent={"center"}>
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
						xs={1}
						key={day}>
						<Card
							variant='outlined'
							onClick={() => handleDayClick(day)}
							sx={{ minWidth: "174px" }}>
							<CardContent>
								<Typography
									variant='h5'
									component='div'
									sx={{ marginBottom: 1, textAlign: "center" }}>
									{PolishDayName(day)}
								</Typography>

								<Typography variant='body2'>
									{groupsForDay.map((group) => `${group.name},`)}
								</Typography>
							</CardContent>
						</Card>
					</Grid>
				);
			})}
		</Grid>
	);
};

export default DaysCard;
