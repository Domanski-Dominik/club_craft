"use client";
import {
	Card,
	Avatar,
	CardContent,
	Typography,
	Box,
	CardMedia,
} from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import { Location } from "@/types/type";

type LocCardProps = {
	loc: Location;
	handleClick: (id: string | number) => void;
};
export default function LocCard({ loc, handleClick }: LocCardProps) {
	const handleCardClick = () => {
		handleClick(loc.id); //Przekazuje ID klikniętej karty do funkcji handleClick
	};

	return (
		<Card
			variant='outlined'
			onClick={handleCardClick}>
			<CardContent sx={{ display: "flex", alignItems: "center" }}>
				<Box sx={{ position: "relative", right: 0 }}>
					<Avatar sx={{ width: 35, height: 35, backgroundColor: "#3f51b5" }}>
						<PlaceIcon style={{ color: "white" }} />
					</Avatar>
				</Box>
				<Box sx={{ ml: 2 }}>
					<Typography
						variant='h5'
						component='div'>
						{loc.name}
					</Typography>

					<Typography
						variant='body2'
						sx={{ mt: 0.5 }}>
						{loc.street === "" && "Brak danych o adresie"}
						{loc.street === "" && <br />}
						{loc.street !== "" && `ul.${loc.street} ${loc.streetNr}`}
						<br />
						{loc.street !== "" && `${loc.city} ${loc.postalCode}`}
					</Typography>
				</Box>
			</CardContent>
		</Card>
	);
}
/*{isOwner && (
				<CardActions>
					<Button
						size='small'
						variant='outlined'
						onClick={() => router.push(`/locations/edit/${loc.id}`)}>
						Edytuj
					</Button>
				</CardActions>
			)}
      */
