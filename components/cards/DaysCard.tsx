"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Group } from "@/types/type";
import { useEffect } from "react";
import Grid from "@mui/material/Unstable_Grid2";

type DaysCardProps = {
	gr: { [dayOfWeek: number]: Group[] };
	handleClick: (id: string | number) => void;
};

const DaysCard = ({ gr, handleClick }: DaysCardProps) => {
	const handleDayClick = (id: number) => {
		//handleClick(day); //Przekazuje ID klikniętej karty do funkcji handleClick
		console.log(id);
	};
	const getPolishDayName = (dayOfWeek: number): string => {
		switch (dayOfWeek) {
			case 1:
				return "Poniedziałek";
			case 2:
				return "Wtorek";
			case 3:
				return "Środa";
			case 4:
				return "Czwartek";
			case 5:
				return "Piątek";
			case 6:
				return "Sobota";
			case 7:
				return "Niedziela";
			default:
				return "Nieznany dzień";
		}
	};

	return (
		<>
			<Grid
				container
				columns={2}
				spacing={0.5}>
				{Object.keys(gr).map((dayOfWeek) => {
					const day = parseInt(dayOfWeek, 10);
					const groupsForDay = gr[day];

					return (
						<Grid xs={1}>
							<Card
								variant='outlined'
								onClick={() => handleDayClick(day)}>
								<CardContent>
									<Typography
										variant='h5'
										component='div'
										sx={{ marginBottom: 1 }}>
										{getPolishDayName(day)}
									</Typography>

									<Typography variant='body2'>
										{groupsForDay.map(
											(group) => `
											${group.name},`
										)}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					);
				})}
			</Grid>
		</>
	);
};

export default DaysCard;
