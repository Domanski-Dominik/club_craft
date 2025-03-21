/** @type {import('next').NextConfig} */
const nextConfig = {};

const withPWA = require("@ducanh2912/next-pwa").default({
	dest: "public",
	cacheOnFrontendNav: true,
	workboxOptions: {
		mode: "production",
	},
	cacheStartUrl: true,
	dynamicStartUrl: true,
	dynamicStartUrlRedirect: true,
	reloadOnOnline: true,
});

module.exports = withPWA(nextConfig);

/*const nextConfig = {
	/* config options here 
};*/

//module.exports = nextConfig;
