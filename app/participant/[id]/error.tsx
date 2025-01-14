"use client";
import { useEffect } from "react";
import { Box, Typography, Fab } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CachedIcon from "@mui/icons-material/Cached";
import { keyframes } from "@mui/system";

const shake = keyframes`
0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(-5deg);
  }
  50% {
    transform: scale(1.1) rotate(5deg);
  }
  75% {
    transform: scale(1.1) rotate(-5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
`;

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				height: "70vh",
				backgroundColor: "white",
				textAlign: "center",
				borderRadius: 4,
				padding: 4,
				width: "100%",
			}}>
			<ErrorOutlineIcon
				color='error'
				sx={{
					width: 100,
					height: 100,
					animation: `${shake} 0.5s ease-in-out infinite`,
					marginBottom: 3,
				}}
			/>
			<Typography
				variant='h5'
				color='error'
				gutterBottom>
				Coś poszło nie tak!
			</Typography>
			<Typography
				variant='body1'
				color='text.secondary'
				marginBottom={3}>
				Przepraszamy za problem. Możesz spróbować ponownie.
			</Typography>
			<Fab
				variant='extended'
				size='large'
				color='primary'
				onClick={reset}
				sx={{
					padding: "10px 24px",
				}}>
				<CachedIcon sx={{ marginRight: 1 }} />
				Spróbuj ponownie
			</Fab>
		</Box>
	);
}
