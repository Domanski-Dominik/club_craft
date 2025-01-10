import { prisma } from "@/prisma/prisma";

interface Props {
	params: Promise<{
		token: string;
	}>;
}
export async function GET(req: Request, { params }: Props) {
	const tokenId = (await params).token;
	try {
		const user = await prisma.user.findUnique({
			where: {
				resetPasswordToken: tokenId,
			},
		});
		if (!user) {
			return Response.json(
				{
					error: "Nie poprawny lub wygasły token, zresetuj hasło jeszcze raz!",
				},
				{ status: 404 }
			);
		}
		return new Response(JSON.stringify(user), { status: 200 });
	} catch (error) {
		console.error(error);
		return Response.json(
			{ error: "Błąd komunikacji z serwerem!" },
			{ status: 500 }
		);
	}
}
