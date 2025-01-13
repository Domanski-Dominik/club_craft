"use client";
import { Box, Button, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const Home = () => {
	const router = useRouter();
	const { status } = useSession();
	const [showInstallMessage, setShowInstallMessage] = useState(false);

	const isIos = () => {
		const userAgent = window.navigator.userAgent.toLowerCase();
		return /iphone|ipad|ipod/.test(userAgent);
	};

	const isInStandaloneMode = () =>
		"standalone" in window.navigator && (window.navigator as any).standalone;

	useEffect(() => {
		if (isIos() && !isInStandaloneMode()) {
			setShowInstallMessage(true);
		}
	}, []);
	return (
		<>
			<Box sx={{ textAlign: "center", marginBottom: "2.5rem" }}>
				<Typography
					variant='h1'
					color='secondary'>
					Witaj w systemie!
				</Typography>
			</Box>
			{showInstallMessage && (
				<div className='install-banner'>
					<p>
						Dodaj aplikację do ekranu głównego, aby uzyskać lepsze
						doświadczenie.
					</p>
					<p>
						Naciśnij przycisk udostępniania, a następnie "Dodaj do ekranu
						głównego".
					</p>
					<button onClick={() => setShowInstallMessage(false)}>Zamknij</button>
				</div>
			)}
			{status === "authenticated" ? (
				<Button
					onClick={() => router.push("/home")}
					variant='contained'>
					Przejdź do klubu
				</Button>
			) : (
				<Button
					onClick={() => router.push("/login")}
					variant='contained'>
					Zaloguj się
				</Button>
			)}
		</>
	);
};

export default Home;
