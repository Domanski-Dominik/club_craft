import { prisma } from "@/prisma/prisma";
import bcrypt from "bcrypt";

export const PUT = async (req: Request) => {
	const body = await req.json();
	const password = body.password;
	const resetPasswordToken = body.resetpasswordtoken;
	try {
		const user = await prisma.user.findUnique({
			where: { resetPasswordToken: resetPasswordToken },
		});
		if (!user) {
			return Response.json(
				{ error: "Nie znaleziono użytkownika o podanym tokenie" },
				{ status: 404 }
			);
		}
		const resetPasswordTokenExpire = user.resetPasswordTokenExpire;
		if (!resetPasswordTokenExpire) {
			return Response.json(
				{ error: "Token wygasł, utwórz nowy żeby móc zresetować hasło" },
				{ status: 404 }
			);
		}
		const today = new Date();
		if (today > resetPasswordTokenExpire) {
			return Response.json(
				{ error: "Token wygasł, utwórz nowy żeby móc zresetować hasło" },
				{ status: 404 }
			);
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
			return Response.json(
				{ error: "Nie udało się zaktualizować hasła" },
				{ status: 400 }
			);
		}
		return Response.json(
			{ message: "Hasło zaktualizowane pomyślnie" },
			{ status: 200 }
		);
	} catch (error) {
		console.error(error);

		return Response.json(
			{ error: "Błąd komunikacji z serwerem" },
			{ status: 500 }
		);
	}
};
