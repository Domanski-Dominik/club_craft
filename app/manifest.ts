import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		id: "1",
		name: "ClubCraft",
		short_name: "ClubCraft",
		start_url: "https://www.clubcrafts.pl",
		description: "Zarządzaj swoim klubem!",
		scope: "/",
		display: "standalone",
		background_color: "#E3CBE7",
		orientation: "portrait",
		theme_color: "#FFFFFF",
		display_override: ["window-controls-overlay", "standalone"],
		categories: ["finance", "productivity"],
		launch_handler: {
			client_mode: ["navigate-existing", "auto"],
		},
		dir: "auto",
		lang: "pl",
		prefer_related_applications: false,
		icons: [
			{
				src: "/favicon192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/favicon384x384.png",
				sizes: "384x384",
				type: "image/png",
			},
			{
				src: "/favicon.ico",
				sizes: "any",
			},
			{
				src: "/favicon16x16.png",
				sizes: "16x16",
				type: "image/png",
			},
			{
				src: "/favicon32x32.png",
				sizes: "32x32",
				type: "image/png",
			},
			{
				src: "/favicon180x180.png",
				sizes: "180x180",
				type: "image/png",
			},
			{
				src: "/favicon512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/favicon512x512.png",
				sizes: "any",
				type: "image/png",
				purpose: "any",
			},
		],
		screenshots: [
			{
				src: "/home.png",
				type: "image/png",
				sizes: "375x667",
				platform: "android",
			},
			{
				src: "/home.png",
				type: "image/png",
				sizes: "375x667",
				platform: "ios",
			},
		],
		shortcuts: [
			{
				name: "Zaloguj się",
				url: "/login",
				description: "Strona logowania",
				icons: [
					{
						src: "/favicon512x512.png",
						type: "image/png",
						sizes: "512x512",
					},
				],
			},
			{
				name: "Wszyscy uczestnicy",
				url: "/participants",
				description: "Lista wszystkich uczestników",
				icons: [
					{
						src: "/favicon512x512.png",
						type: "image/png",
						sizes: "512x512",
					},
				],
			},
			{
				name: "Oczekujący",
				url: "/awaiting",
				description: "Lista oczekujących uczestników",
				icons: [
					{
						src: "/favicon512x512.png",
						type: "image/png",
						sizes: "512x512",
					},
				],
			},
		],
	};
}
