"use client";

import { Box, Typography, Fab } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";
import { keyframes } from "@mui/system";
import Link from "next/link";

const fadeInAndOut = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

export default function NotFound() {
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
					marginBottom: 3,
					animation: `${fadeInAndOut} 2s ease-in-out infinite`,
				}}
			/>
			<Typography
				variant='h5'
				color='error'
				gutterBottom>
				Strony nie znaleziono!
			</Typography>
			<Typography
				variant='body1'
				color='text.secondary'
				marginBottom={3}>
				Nie udało się znaleźć żądanego zasobu.
			</Typography>
			<Link
				href='/home'
				passHref>
				<Fab
					variant='extended'
					size='large'
					color='primary'
					sx={{
						padding: "10px 24px",
						textDecoration: "none",
					}}>
					<HomeIcon sx={{ marginRight: 1 }} />
					Wróć do strony głównej
				</Fab>
			</Link>
		</Box>
	);
}
