import "@/styles/globals.css";
import type { Metadata } from "next";
import TopNav from "@/components/navigation/Nav";
import Provider from "@/context/Provider";
import BottomNav from "@/components/navigation/BottomNav";
import ThemeRegistry from "@/theme/ThemeRegistry";
import { Container, useMediaQuery } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
export const metadata: Metadata = {
	title: "ClubCraft",
	description: "Organize, rule, and much more!",
};
export default function RootLayout({
	children,
}: {
	children?: React.ReactNode;
}) {
	//if (status==="loading") return <div>Loading...</div>;
	return (
		<html lang='en'>
			<head>
				{(process.env.NODE_ENV === "development" ||
					process.env.VERCEL_ENV === "preview") && (
					// eslint-disable-next-line @next/next/no-sync-scripts
					<script
						data-project-id='3ZakYiOPOm7RPgFRM9qlV7rSwE94HRNQtGXUEL6f'
						data-is-production-environment='false'
						src='https://snippet.meticulous.ai/v1/meticulous.js'
					/>
				)}
				<link
					rel='stylesheet'
					href='https://fonts.googleapis.com/icon?family=Material+Icons'
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
					name='viewport'
					content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
				/>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no, shrink-to-fit=no'
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
			</head>
			<ThemeRegistry>
				<body>
					<Provider>
						<AppRouterCacheProvider>
							<TopNav />
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
							<BottomNav />
						</AppRouterCacheProvider>
					</Provider>
				</body>
			</ThemeRegistry>
		</html>
	);
}
