"use client"; // Error boundaries must be Client Components

import { Typography, Fab, Box } from "@mui/material";
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
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		// global-error must include html and body tags
		<html>
			<body>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						backgroundColor: "white",
						height: "100vh",
						width: "100%",
						alignItems: "center",
						justifyContent: "center",
						borderRadius: 4,
					}}>
					<ErrorOutlineIcon
						color='error'
						sx={{
							width: 150,
							height: 150,
							my: 8,
							animation: `${shake} 0.5s ease-in-out infinite`,
						}}
					/>
					<Typography
						variant='h5'
						align='center'
						color='error'
						my={4}>
						Coś poszło nie tak!
					</Typography>
					<Typography
						variant='body1'
						align='center'
						color='text.secondary'
						my={2}>
						Przepraszamy za niedogodności. Spróbuj odświeżyć stronę.
					</Typography>
					<Fab
						sx={{ m: 2 }}
						variant='extended'
						size='large'
						color='primary'
						onClick={reset}>
						<CachedIcon sx={{ mr: 1 }} />
						Spróbuj ponownie
					</Fab>
				</Box>
			</body>
		</html>
	);
}
