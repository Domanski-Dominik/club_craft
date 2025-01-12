"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/prisma/prisma";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import { ResetPasswordEmailTemplate } from "@/components/emailTemps/ResetPassword";
import bcrypt from "bcrypt";
import { VerifyEmailTemplate } from "@/components/emailTemps/EmailVerify";

const resend = new Resend(process.env.RESEND_API_KEY);

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
		const result = await signIn("credentials", {
			...formData,
		});
		console.log(result);
		return { success: true };
	} catch (error: any) {
		// Dodatkowa obsługa błędów w przypadku innych wyjątków
		if (error instanceof AuthError) {
			return {
				error:
					error.cause?.message ||
					"Wystąpił błąd uwierzytelnienia, sprawdź poprawnośc danych.",
			};
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

export const sendResetEmail = async (email: string) => {
	try {
		const user = await prisma.user.findUnique({ where: { email: email } });
		if (!user) {
			return { error: "Nie znaleziono konta o podanym mailu" };
		}

		const resetPasswordToken = randomBytes(16).toString("base64url");
		const today = new Date();
		const expiryDate = new Date(today.setDate(today.getDate() + 1));

		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				resetPasswordToken: resetPasswordToken,
				resetPasswordTokenExpire: expiryDate,
			},
		});

		await resend.emails.send({
			from: "Club Craft <reset@clubcrafts.pl>",
			to: [email],
			subject: "Zresetuj hasło",
			react: ResetPasswordEmailTemplate({
				email,
				resetPasswordToken,
			}) as React.ReactElement,
		});
		return { message: "Wysłano wiadmość na podany mail" };
	} catch (error) {
		console.error(error);
		return { error: "Nie udało się wysłać wiadomości" };
	}
};

export const checkResetToken = async (token: string) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				resetPasswordToken: token,
			},
		});
		if (!user) {
			return {
				error: "Nie poprawny lub wygasły token, zresetuj hasło jeszcze raz!",
			};
		}

		return user;
	} catch (error) {
		console.error(error);
		return { error: "Błąd komunikacji z serwerem!" };
	}
};

export const passwordChange = async ({
	password,
	resetPasswordToken,
}: {
	password: string;
	resetPasswordToken: string;
}) => {
	try {
		const user = await prisma.user.findUnique({
			where: { resetPasswordToken: resetPasswordToken },
		});
		if (!user) {
			return { error: "Nie znaleziono użytkownika o podanym tokenie" };
		}
		const resetPasswordTokenExpire = user.resetPasswordTokenExpire;
		if (!resetPasswordTokenExpire) {
			return { error: "Token wygasł, utwórz nowy żeby móc zresetować hasło" };
		}
		const today = new Date();
		if (today > resetPasswordTokenExpire) {
			return { error: "Token wygasł, utwórz nowy żeby móc zresetować hasło" };
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const update = await prisma.user.update({
			where: { id: user.id },
			data: {
				password: hashedPassword,
				resetPasswordToken: null,
				resetPasswordTokenExpire: null,
			},
		});
		if (!update) {
			return { error: "Nie udało się zaktualizować hasła" };
		}
		return { message: "Hasło zaktualizowane pomyślnie" };
	} catch (error) {
		console.error(error);
		return { error: "Błąd komunikacji z serwerem" };
	}
};
export const registerUser = async (formData: {
	email: string;
	password: string;
	name: string;
	surname: string;
	club: string;
	role: string;
	newClub: boolean;
}) => {
	try {
		//console.log(body);
		const { email, password, name, surname, club, role, newClub } = formData;
		//console.log(email, password, name, surname, club, role);

		if (
			!email ||
			!password ||
			!name ||
			!surname ||
			!club ||
			!role ||
			!newClub
		) {
			return { error: "Brakuje danych" };
		}

		const exist = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});

		if (exist) {
			return { error: "Podany email jest wykorzystywany" };
		}
		if (newClub) {
			const existingUserWithClub = await prisma.user.findFirst({
				where: {
					club: club,
				},
			});
			if (existingUserWithClub) {
				return { error: "Ta nazwa klubu jest już w bazie danych" };
			}
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const verifyEmailToken = randomBytes(16).toString("base64url");

		const user = await prisma.user.create({
			data: {
				email: email.toLowerCase(),
				password: hashedPassword,
				club: club,
				role: role,
				name: name,
				surname: surname,
				verifyEmailToken: verifyEmailToken,
			},
		});
		if (!user) {
			return { error: "Nie udało się stworzyć konta" };
		}

		const emailSend = await resend.emails.send({
			from: "Club Craft <reset@clubcrafts.pl>",
			to: [email.toLowerCase()],
			subject: "Zweryfikuj email",
			react: VerifyEmailTemplate({
				email,
				verifyEmailToken,
			}) as React.ReactElement,
		});
		if (!emailSend) {
			return { error: "Nie udało się wysłać maila" };
		}

		await prisma.club.create({
			data: {
				name: club,
				email: email.toLowerCase(),
				clubconnect: {
					create: [
						{
							userId: user.id,
						},
					],
				},
			},
		});

		return user;
	} catch (error: any) {
		console.error(error);
		return { error: "Wystąpił błąd po stronie serwera" };
	}
};
