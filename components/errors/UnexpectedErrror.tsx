"use client";

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

interface UnexpectedErrorProps {
	reset: () => void; // Funkcja resetująca, przekazywana z error.tsx
}

const UnexpectedError = ({ reset }: UnexpectedErrorProps) => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				height: "100vh",
				backgroundColor: "white",
				textAlign: "center",
				padding: 4,
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
};

export default UnexpectedError;
