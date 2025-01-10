import bcrypt from "bcrypt";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import { VerifyEmailTemplate } from "@/components/emailTemps/EmailVerify";

const resend = new Resend(process.env.RESEND_API_KEY);

interface Body {
	formData: {
		email: string;
		password: string;
		name: string;
		surname: string;
		club: string;
		role: string;
		newClub: boolean;
	};
}
export async function POST(req: Request) {
	try {
		const body: Body = await req.json();
		//console.log(body);
		const { email, password, name, surname, club, role, newClub } =
			body.formData;
		//console.log(email, password, name, surname, club, role);

		if (!email || !password) {
			return NextResponse.json(
				{ error: "Brakuje maila lub hasła" },
				{ status: 400 }
			);
		}

		const exist = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});

		if (exist) {
			return NextResponse.json(
				{ error: "Podany email jest wykorzystywany" },
				{ status: 409 }
			);
		}
		if (newClub) {
			const existingUserWithClub = await prisma.user.findFirst({
				where: {
					club: club,
				},
			});
			if (existingUserWithClub) {
				return NextResponse.json(
					{ error: "Ta nazwa klubu jest już w bazie danych" },
					{ status: 409 }
				);
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
			return NextResponse.json(
				{ error: "Nie udało się stworzyć konta" },
				{ status: 400 }
			);
		}

		const emailSend = await resend.emails.send({
			from: "Club Craft <reset@clubcraft.pl>",
			to: [email.toLowerCase()],
			subject: "Zresetuj hasło",
			react: VerifyEmailTemplate({
				email,
				verifyEmailToken,
			}) as React.ReactElement,
		});
		if (!emailSend) {
			return NextResponse.json(
				{ error: "Nie udało się wysłać maila" },
				{ status: 400 }
			);
		}

		return NextResponse.json(user);
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
}
