"use client";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

const Home = () => {
	const router = useRouter();
	return (
		<>
			<Box sx={{ textAlign: "center", marginBottom: "2.5rem" }}>
				<Typography
					variant='h1'
					color='indigo'>
					Witaj w systemie!
				</Typography>
			</Box>
			<Button
				onClick={() => router.push("/login")}
				variant='outlined'
				color='secondary'>
				Zaloguj się
			</Button>
		</>
	);
};

export default Home;
