import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma/prisma";
import authConfig from "./auth.config";
import { getUserById } from "./server/authorize";

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: PrismaAdapter(prisma) as any,
	session: { strategy: "jwt" },
	trustHost: true,
	callbacks: {
		/*async signIn({ user }) {
		//sprawdzenie jeśli nie zweryfikowany email to nie pozwól się zalogować
			const existingUser = await getUserById(user?.id as string);
			if (!existingUser || !existingUser.emailVerified) {
				return false;
			}

			return true;
		},*/
		async session({ token, session }) {
			if (token.sub && session.user && token.role && token.club) {
				(session.user.club = token.club as string),
					(session.user.role = token.role as string),
					(session.user.id = token.sub);
				session.user.name = token.name;
			}
			return session;
		},
		async jwt({ token, user }) {
			if (user && user.role && user.club) {
				return {
					...token,
					role: user.role,
					club: user.club,
				};
			}
			//console.log("jwt callback", { token, user });

			return token;
		},
	},
	pages: {
		signIn: "/login",
		signOut: "/login",
		error: "/login",
	},
	...authConfig,
});
/*
callbacks: {
		async jwt({ token, user, session, trigger }) {
			if (trigger === "update" && session?.name) {
				token.name = session.name;
			}
			if (trigger === "update" && session?.role) {
				token.role = session.role;
			}
			if (trigger === "update" && session?.club) {
				token.club = session.club;
			}

			if (user && user.role && user.club) {
				return {
					...token,
					id: user.id,
					role: user.role,
					club: user.club,
				};
			}
			//console.log("jwt callback",{token, user, session})
			return token;
		},
		async session({ session, token, user }) {
			//const sessionUser = await
			//console.log("session callback",{ session, token, user })
			return {
				...session,
				user: {
					...session.user,
					id: token.id,
					name: token.name,
					role: token.role,
					club: token.club,
				},
			};
		},
	}
*/
