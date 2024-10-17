import authConfig from "./auth.config";
import NextAuth from "next-auth";
import {
	DEAFAULT_LOGIN_REDIRECT,
	apiAuthPrefix,
	authRoutes,
	publicRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);
export default auth(async function middleware(req) {
	const { nextUrl } = req;
	const isLoggedIn = !!req.auth;

	const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
	const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
	const isAuthRoute = authRoutes.includes(nextUrl.pathname);

	if (isApiAuthRoute) {
		return;
	}
	if (isAuthRoute) {
		if (isLoggedIn) {
			return Response.redirect(new URL(DEAFAULT_LOGIN_REDIRECT, nextUrl));
		}
		return;
	}
	if (!isLoggedIn && !isPublicRoute)
		return Response.redirect(new URL("/login", nextUrl));

	return;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
