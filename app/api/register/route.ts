import bcrypt from "bcrypt";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

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
export async function POST(req: Request, res: Response) {
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

		const user = await prisma.user.create({
			data: {
				email: email.toLowerCase(),
				password: hashedPassword,
				club: club,
				role: role,
				name: name,
				surname: surname,
			},
		});

		return NextResponse.json(user);
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
}
