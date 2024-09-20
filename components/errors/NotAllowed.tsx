import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DoNotTouchIcon from "@mui/icons-material/DoNotTouch";
import { Typography, Fab, Box } from "@mui/material";
import CachedIcon from "@mui/icons-material/Cached";
import { useRouter } from "next/navigation";

const NotAllowed = () => {
	const router = useRouter();
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				backgroundColor: "white",
				height: "calc(100vh - 180px)",
				width: "calc(100% - 10px)",
				alignItems: "center",
				justifyContent: "center",
				borderRadius: 4,
			}}>
			<DoNotTouchIcon
				color='error'
				sx={{ width: 150, height: 150 }}
			/>
			<Typography
				variant='h5'
				align='center'
				color='red'
				my={4}>
				Nie masz uprawnień do tej strony
			</Typography>
			<Fab
				sx={{ m: 2 }}
				variant='extended'
				size='large'
				color='primary'
				onClick={() => window.location.reload()}>
				<CachedIcon sx={{ mr: 1 }} />
				Odśwież stronę
			</Fab>
			<Fab
				sx={{ m: 2 }}
				size='large'
				variant='extended'
				color='primary'
				onClick={() => router.push(`/home`)}>
				Wróć do ekranu głównego
			</Fab>
		</Box>
	);
};

export default NotAllowed;
