export default function manifest() {
	return {
		name: "ClubCraft",
		short_name: "ClubCraft",
		description: "Zarządzaj swoim klubem!",
		start_url: "/",
		display: "standalone",
		background_color: "black",
		theme_color: "black",
		icons: [
			{
				src: "/favicon.ico",
				sizes: "any",
				type: "image/x-icon",
			},
		],
	};
}
