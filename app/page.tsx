"use client";
import { Box, Button, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";

const Home = () => {
	const router = useRouter();
	const { status } = useSession();
	if (status === "authenticated") {
		redirect("/home");
	}
	return (
		<>
			<Box sx={{ textAlign: "center", marginBottom: "2.5rem" }}>
				<Typography
					variant='h1'
					color='secondary'>
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
