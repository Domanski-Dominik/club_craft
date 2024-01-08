import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";

const prisma = new PrismaClient();

const authOptions: NextAuthOptions = {
	//adapter: PrismaAdapter(prisma),
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				password: { label: "Password", type: "password" },
				email: { label: "Email", type: "email" },
			},
			async authorize(credentials) {
				console.log("Wszedłem do authorize");
				if (credentials === undefined) {
					console.log("credential:undefinied");
					throw new Error("Brak danych uwierzytelniających");
				}
				// Sprawdzenie czy mail i hasło są poprawne
				if (!credentials.email || !credentials.password) {
					console.log("!credentials.email ...");
					throw new Error("Niepoprawne dane uwierzytelniające");
				}
				// Sprawdzenie czy użytkownik istnieje
				const user = await prisma.user.findUnique({
					where: {
						email: credentials.email,
					},
				});

				if (!user) {
					console.log("User = null");
					throw new Error("Użytkownik o podanym mailu nie został znaleziony");
				}

				// Sprawdzenie czy hasło jest poprawne
				const passwordMatch = await bcrypt.compare(
					credentials.password,
					user.password
				);

				if (!passwordMatch) {
					console.log("hasło sie nie zgadza");
					throw new Error("Niepoprawne hasło");
				}

				// Jeżeli wszystko poprawnę zwracamy obiekt użytkownika
				return user;
			},
		}),
		/*GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })*/
	],
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
	},
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60,
	},
	secret: process.env.NEXTAUTH_SECRET,
	debug: process.env.NODE_ENV === "development",
};

/*const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })

  ],
  callbacks: {
    async session({ session,token, user }) {
      // store the user id from MongoDB to session
      const sessionUser = await User.findOne({ email: session.user.email });
      session.user.id = sessionUser._id.toString();

      return session;
    },
    async signIn({ account, profile, user, credentials }) {
      try {
        await connectToDB();

        // check if user already exists
        const userExists = await User.findOne({ email: profile.email });

        // if not, create a new document and save user in MongoDB
        if (!userExists) {
          await User.create({
            email: profile.email,
            username: profile.name.replace(" ", "").toLowerCase(),
            image: profile.picture,
          });
        }

        return true
      } catch (error) {
        console.log("Error checking if user exists: ", error.message);
        return false
      }
    },
  },
  session: {
    maxAge: 30 * 24 *60 * 60,
  }
})
*/

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
