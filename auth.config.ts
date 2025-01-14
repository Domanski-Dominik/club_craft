import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma/prisma";

export const config = {
	runtime: "nodejs",
};

export default {
	providers: [
		Credentials({
			credentials: {
				password: { label: "Password", type: "password" },
				email: { label: "Email", type: "email" },
			},
			authorize: async (credentials) => {
				//console.log("Wszedłem do authorize");
				if (credentials === undefined) {
					//console.log("credential:undefinied");
					throw new Error("Brak danych uwierzytelniających");
				}
				// Sprawdzenie czy mail i hasło są poprawne
				if (!credentials.email || !credentials.password) {
					//console.log("!credentials.email ...");
					throw new Error("Niepoprawne dane uwierzytelniające");
				}
				// Sprawdzenie czy użytkownik istnieje
				const user = await prisma.user.findUnique({
					where: {
						email: credentials.email as string,
					},
				});

				if (!user) {
					//console.log("User = null");
					throw new Error("Użytkownik o podanym mailu nie został znaleziony");
				}

				// Sprawdzenie czy hasło jest poprawne
				const passwordMatch = await bcrypt.compare(
					credentials.password as string,
					user.password
				);

				if (!passwordMatch) {
					//console.log("hasło sie nie zgadza");
					throw new Error("Niepoprawne hasło");
				}

				// Jeżeli wszystko poprawnę zwracamy obiekt użytkownika
				return user;
			},
		}),
	],
} satisfies NextAuthConfig;
