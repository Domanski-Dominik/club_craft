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
			return new Response(
				JSON.stringify({ error: "Nie znaleziono konta o podanym mailu" }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
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
		return new Response(
			JSON.stringify({ message: "Wysłano wiadmość na podany mail" }),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error(error);
		return new Response(
			JSON.stringify({ error: "Nie udało się wysłać wiadomości" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
