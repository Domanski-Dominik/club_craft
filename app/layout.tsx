import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import TopNav from "@/components/navigation/Nav";
import Provider from "@/context/Provider";
import BottomNav from "@/components/navigation/BottomNav";
import ThemeRegistry from "@/theme/ThemeRegistry";
import { Container, useMediaQuery } from "@mui/material";
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
					rel='apple-touch-icon'
					href='/apple-icon?<generated>'
					type='image/<generated>'
					sizes='<generated>'
				/>
				<link
					rel='icon'
					href='/icon?<generated>'
					type='image/<generated>'
					sizes='<generated>'
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
							<TopNav session={session} />
							<Container
								component='main'
								sx={{
									position: "relative",
									zIndex: "10",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									flexDirection: "column",
									marginLeft: "auto",
									marginRight: "auto",
									paddingLeft: "2px",
									paddingRight: "2px",
									paddingTop: "75px",
									paddingBottom: "90px",
									minHeight: "100vh",
									maxWidth: "64rem",
								}}>
								{children}
							</Container>
							{session && <BottomNav />}
						</AppRouterCacheProvider>
					</Provider>
					<Analytics />
				</body>
			</ThemeRegistry>
		</html>
	);
}
