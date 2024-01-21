import { Card, CardContent, Avatar, Badge } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import PlaceIcon from "@mui/icons-material/Place";
import TableRowsIcon from "@mui/icons-material/TableRows";
import SportsIcon from "@mui/icons-material/Sports";
import GroupsIcon from "@mui/icons-material/Groups";

type HomeCardProps = {
	amount: number;
	name: string;
	color: string;
	url: string;
};

const HomeCard = ({ name, amount, url, color }: HomeCardProps) => {
	const router = useRouter();
	return (
		<Card
			variant='outlined'
			onClick={() => router.push(url)}>
			<CardContent>
				<div style={{ display: "flex", alignItems: "center" }}>
					<Badge
						max={1000}
						badgeContent={amount}
						anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
						color='primary'
						variant='standard'>
						<Avatar sx={{ width: 35, height: 35, backgroundColor: color }}>
							{name === "Lokalizacje" && (
								<PlaceIcon style={{ color: "white" }} />
							)}
							{name === "Uczestnicy" && (
								<GroupsIcon style={{ color: "white" }} />
							)}
							{name === "Trenerzy" && <SportsIcon style={{ color: "white" }} />}
							{name === "Lokalizacje i Grupy" && (
								<TableRowsIcon style={{ color: "white" }} />
							)}
						</Avatar>
					</Badge>
					{/* Reszta informacji po prawej stronie */}
					<div style={{ marginLeft: "16px" }}>
						<Typography variant='h5'>{name}</Typography>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default HomeCard;
/*{isOwner && (
				<CardActions>
					<Button size='small'>Zarządzaj</Button>
				</CardActions>
			)}*/
