"use client";

import type { Group } from "@/types/type";
import { Typography, Card, CardContent } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";

type GroupCardProps = {
	groups: Group[];
	handleClick: (id: string | number) => void;
};

const GrCard = ({ groups, handleClick }: GroupCardProps) => {
	const handleGroupClick = (id: number | string) => {
		handleClick(id); //Przekazuje ID klikniętej karty do funkcji handleClick
	};

	return (
		<Grid
			container
			columns={2}
			spacing={1}
			justifyContent={"center"}>
			{groups.map((group) => {
				return (
					<Grid key={group.timeS}>
						<Card
							variant='outlined'
							onClick={() => handleGroupClick(group.id)}
							sx={{ minWidth: "150px" }}>
							<CardContent>
								<Typography
									variant='h5'
									component='div'
									sx={{ marginBottom: 1, textAlign: "center" }}>
									{group.name}
								</Typography>

								<Typography variant='body2'> 0 uczestników</Typography>
							</CardContent>
						</Card>
					</Grid>
				);
			})}
		</Grid>
	);
};

export default GrCard;
