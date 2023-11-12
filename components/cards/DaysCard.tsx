"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Group } from "@/types/type";

type DaysCardProps = {
	gr: Group;
	handleClick: (id: string | number) => void;
};

const DaysCard = ({ gr, handleClick }: DaysCardProps) => {
	const handleDayClick = () => {
		handleClick(gr.id); //Przekazuje ID klikniętej karty do funkcji handleClick
	};

	return (
		<Card
			variant='outlined'
			onClick={handleDayClick}>
			<CardContent>
				<Typography
					variant='h5'
					component='div'>
					{gr.name}
				</Typography>

				<Typography variant='body2'>
					<br />
				</Typography>
			</CardContent>
		</Card>
	);
};

export default DaysCard;
