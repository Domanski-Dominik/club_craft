"use client";

import type { Group } from "@/types/type";
import { Typography, Card, CardContent } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";

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
	handleClick: (id: string | number) => void;
};

const GrCard = ({ groups, handleClick }: GroupCardProps) => {
	const handleGroupClick = (id: number | string) => {
		handleClick(id); //Przekazuje ID klikniętej karty do funkcji handleClick
	};
	return (
		<Grid
			container
			columns={1}
			spacing={2}
			columnSpacing={1}
			direction='column'>
			{groups.map((group) => {
				return (
					<Grid key={group.timeS}>
						<Card
							variant='outlined'
							onClick={() => handleGroupClick(group.id)}
							sx={{ width: "90vw" }}>
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
		</Grid>
	);
};

export default GrCard;
