"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/prisma/prisma";

interface LoginForm {
	email: string;
	password: string;
}
interface SignInResult {
	error?: string; // Zawiera opis błędu, jeśli wystąpi
	ok?: boolean; // Informuje, czy logowanie powiodło się
	status?: number; // Kod statusu HTTP
}
export const login = async (formData: LoginForm) => {
	try {
		await signIn("credentials", {
			...formData,
		});

		return { success: true };
	} catch (error: any) {
		// Dodatkowa obsługa błędów w przypadku innych wyjątków
		if (error instanceof AuthError) {
			return { error: error.cause?.err };
		}

		// Obsługa nieprzewidzianych błędów
		throw new Error(error.message || "Wystąpił nieoczekiwany błąd.");
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
