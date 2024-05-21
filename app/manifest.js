export default function manifest() {
	return {
		name: "ClubCraft",
		short_name: "ClubCraft",
		description: "Zarządzaj swoim klubem!",
		start_url: "/",
		display: "standalone",
		background_color: "white",
		theme_color: "white",
		orientation: "portrait",
		icons: [
			{
				src: "/app/icons/favicon.ico",
				sizes: "any",
				type: "image/x-icon",
			},
			{
				src: "/app/icons/favicon192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/app/icons/favicon180x180.png",
				sizes: "180x180",
				type: "image/png",
			},
			{
				src: "/app/icons/favicon512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/app/icons/favicon512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}
