import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		info: [string, string, string];
	};
}

export const GET = async (req: Request, { params }: Props) => {
	const userId = params.info[0];
	try {
		const userInfo = await prisma.user.findUnique({
			where: {
				id: userId,
			},
			include: {
				clubconnect: {
					include: { club: true },
				},
			},
		});
		if (!userInfo) {
			return Response.json(
				{ error: "Nie znaleziono użytkownika w bazie danych" },
				{ status: 404 }
			);
		}
		if (userInfo.clubconnect && userInfo.clubconnect.length > 0) {
			const club = userInfo.clubconnect[0].club;
			return new Response(JSON.stringify(club), { status: 200 });
		} else {
			console.error("Nie znaleziono połączenia z klubem");
			return Response.json(
				{ error: "Nie znaleziono połączenia użytkownika z klubem" },
				{ status: 404 }
			);
		}
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
export const PUT = async (req: Request, { params }: Props) => {
	const body = await req.json();
	console.log(body);
	return Response.json(null, { status: 200 });
};
