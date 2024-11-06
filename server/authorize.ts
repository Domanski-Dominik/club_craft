"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/prisma/prisma";

interface LoginForm {
	email: string;
	password: string;
}
export const login = async (formData: LoginForm) => {
	try {
		await signIn("credentials", {
			...formData,
			//redirectTo: DEAFAULT_LOGIN_REDIRECT,
		});
		return { succes: true };
	} catch (error: any) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case "CredentialsSignin":
					return { message: "Niepoprawne dane!" };
				default:
					return {
						message: "Coś poszło nie tak, spróbuj zweryfikować swój email!",
					};
			}
		}
		throw error;
	}
};

export const getUserById = async (id: string) => {
	try {
		const user = await prisma.user.findUnique({ where: { id: id } });
		return user;
	} catch (error) {
		return null;
	}
};
export const getUserByEmail = async (email: string) => {
	try {
		const user = await prisma.user.findUnique({ where: { email: email } });
		return user;
	} catch (error) {
		return null;
	}
};
