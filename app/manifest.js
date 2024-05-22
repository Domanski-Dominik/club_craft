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
				src: "/favicon.ico",
				sizes: "any",
			},
			{
				src: "/icons/favicon192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/icons/favicon180x180.png",
				sizes: "180x180",
			},
			{
				src: "/icons/favicon512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icons/favicon512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}
