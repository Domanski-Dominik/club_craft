"use client";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";

const Home = () => {
	const router = useRouter();
	return (
		<>
			<Box sx={{ textAlign: "center", marginBottom: "2.5rem" }}>
				<span className='blue_gradient head_text'>Witaj w systemie!</span>
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
