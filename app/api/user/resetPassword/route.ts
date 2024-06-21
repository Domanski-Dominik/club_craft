import { prisma } from "@/prisma/prisma";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import { ResetPasswordEmailTemplate } from "@/components/emailTemps/ResetPassword";

const resend = new Resend(process.env.RESEND_API_KEY);
export async function POST(req: Request) {
	const body = await req.json();
	const email = body.email;
	console.log(body);
	try {
		const user = await prisma.user.findUnique({ where: { email: body.email } });
		if (!user) {
			return Response.json({ error: "Nie znaleziono konta o podanym mailu" });
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
			from: "Club Craft <reset@clubcraft.pl>",
			to: [email],
			subject: "Zresetuj hasło",
			react: ResetPasswordEmailTemplate({
				email,
				resetPasswordToken,
			}) as React.ReactElement,
		});
		return Response.json(
			{ message: "Wysłano wiadmość na podany mail" },
			{ status: 200 }
		);
	} catch (error) {
		console.error(error);
		return Response.json(
			{ error: "Nie udało się wysłać wiadomości" },
			{ status: 500 }
		);
	}
}
