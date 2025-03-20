import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import TopNav from "@/components/navigation/Nav";
import Provider from "@/context/Provider";
import BottomNav from "@/components/navigation/BottomNav";
import ThemeRegistry from "@/theme/ThemeRegistry";
import { Container, useMediaQuery, Box } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { Analytics } from "@vercel/analytics/react";
import { auth } from "@/auth";

const APP_NAME = "ClubCraft";
const APP_DEFAULT_TITLE = "ClubCraft";
const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_DESCRIPTION = "Zarządzaj swoim klubem!";

export const metadata: Metadata = {
	applicationName: APP_NAME,
	title: {
		default: APP_DEFAULT_TITLE,
		template: APP_TITLE_TEMPLATE,
	},
	description: APP_DESCRIPTION,
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: APP_DEFAULT_TITLE,
		startupImage: [
			"/public/apple_splash_750.png",
			{
				url: `/apple_splash_1536.png`,
				media: "(device-width: 768px) and (device-height: 1024px)",
			},
		],
	},
	formatDetection: {
		telephone: false,
	},
	openGraph: {
		type: "website",
		siteName: APP_NAME,
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
	},
	twitter: {
		card: "summary",
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
	},
	other: {
		"mobile-web-app-capable": "yes",
	},
};
export const viewport: Viewport = {
	themeColor: "#FFFFFF",
	maximumScale: 1,
	userScalable: false,
};
export default async function RootLayout({
	children,
}: {
	children?: React.ReactNode;
}) {
	const session = await auth();
	//if (status==="loading") return <div>Loading...</div>;
	return (
		<html lang='en'>
			<head>
				<link
					rel='stylesheet'
					href='https://fonts.googleapis.com/icon?family=Material+Icons'
				/>
				<meta
					name='viewport'
					content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=0, viewport-fit=cover'
				/>
				<meta
					name='apple-mobile-web-app-capable'
					content='yes'
				/>
				<meta
					name='mobile-web-app-capable'
					content='yes'
				/>
				<meta
					name='apple-mobile-web-app-status-bar-style'
					content='black'
				/>

				<meta
					name='HandheldFriendly'
					content='true'
				/>

				<link
					rel='icon'
					href='/favicon.ico'
					sizes='any'
				/>

				<link
					href='/apple_splash_2048.png'
					sizes='2048x2732'
					rel='apple-touch-startup-image'
				/>
				<link
					href='/apple_splash_1668.png'
					sizes='1668x2224'
					rel='apple-touch-startup-image'
				/>
				<link
					href='/apple_splash_1536.png'
					sizes='1536x2048'
					rel='apple-touch-startup-image'
				/>
				<link
					href='/apple_splash_1125.png'
					sizes='1125x2436'
					rel='apple-touch-startup-image'
				/>
				<link
					href='/apple_splash_1242.png'
					sizes='1242x2208'
					rel='apple-touch-startup-image'
				/>
				<link
					href='/apple_splash_750.png'
					sizes='750x1334'
					rel='apple-touch-startup-image'
				/>
				<link
					href='/apple_splash_640.png'
					sizes='640x1136'
					rel='apple-touch-startup-image'
				/>
			</head>
			<ThemeRegistry>
				<body>
					<Provider>
						<AppRouterCacheProvider>
							{/* Top Navigation */}
							<TopNav session={session} />
							{/* Layout Box */}
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									minHeight: "100vh",
									m: 0,
								}}>
								{/* Main Content */}
								<Container
									component='main'
									sx={{
										flexGrow: 1,
										width: "100%",
										minWidth: "100%",
										height: "100%",
										px: { xs: 1 },
										paddingLeft: { md: session?.user ? `260px` : "20px" },
										paddingRight: { md: "20px" }, // Uwzględnij Drawer na desktopie
										display: "flex",
										flexDirection: "column",
										justifyContent: "center",
										alignItems: "center",
										paddingTop: { xs: "75px", sm: "75px", md: "90px" }, // Odstęp od góry
										paddingBottom: {
											xs: session?.user ? "100px" : "20px",
											sm: session?.user ? "100px" : "20px",
											md: "20px",
										}, // Odstęp od dołu tylko na telefonach
									}}>
									{children}
								</Container>
							</Box>
							{/* Bottom Navigation */}
							{session?.user && <BottomNav />}
						</AppRouterCacheProvider>
					</Provider>
					{/* Snackbar Portal */}
					<div id='snackbar-root'></div>
					<Analytics />
				</body>
			</ThemeRegistry>
		</html>
	);
}
