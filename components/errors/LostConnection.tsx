"use client";
import { Typography, Fab, Box } from "@mui/material";
import CachedIcon from "@mui/icons-material/Cached";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import { keyframes } from "@mui/system";

const zoomAndRotate = keyframes`
  0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.2) rotate(-10deg);
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  75% {
    transform: scale(1.2) rotate(-10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
`;
const LostConnection = () => {
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
			<WifiOffIcon
				color='error'
				sx={{
					width: 150,
					height: 150,
					my: 8,
					animation: `${zoomAndRotate} 2s ease-in-out infinite`,
				}}
			/>
			<Typography
				variant='h5'
				align='center'
				color='red'
				my={4}>
				Utracono połączenie z internetem, jesteś offline!
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
		</Box>
	);
};

export default LostConnection;
