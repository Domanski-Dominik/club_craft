"use client";
import { Box, Button, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import Image from "next/image";
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
		if (isIos() && !isInStandaloneMode() && status === "authenticated") {
			setShowInstallMessage(true);
		}
	}, []);
	return (
		<>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
				}}>
				<Image
					src={"/faviconTransparent.png"}
					width={200}
					height={200}
					alt='logo'
				/>
				<Typography
					ml={4}
					sx={{ display: { xs: "none", sm: "block" } }}
					variant='h1'
					color='secondary'>
					Club Craft
				</Typography>
			</Box>
			<Box sx={{ textAlign: "center", marginBottom: "3rem" }}>
				<Typography
					variant='h2'
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
					onClick={() => router.push("/calendar")}
					variant='contained'>
					Przejdź do kalendarza
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
