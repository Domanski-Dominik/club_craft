import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const body = await req.json();
	const { token } = body;
	const today = new Date();
	try {
		const findAndUpdate = await prisma.user.update({
			where: { verifyEmailToken: token },
			data: { emailVerified: today, verifyEmailToken: null },
		});
		if (!findAndUpdate)
			return NextResponse.json(
				{ error: "Nie udało się zweryfikować email, token nie poprawny!" },
				{ status: 400 }
			);
		return NextResponse.json(
			{ message: "Udało się zweryfikować email!" },
			{ status: 200 }
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Token niepoprawny!" }, { status: 500 });
	}
}
