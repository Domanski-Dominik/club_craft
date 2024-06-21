import { prisma } from "@/prisma/prisma";

export const PUT = async (req: Request) => {
	const { userId, role } = await req.json();
	console.log(userId, role);
	try {
		const changeRole = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				role: role,
			},
		});
		if (!changeRole)
			return Response.json(
				{ error: "Nie udało się zmienić uprawnień" },
				{ status: 400 }
			);
		return new Response(JSON.stringify(changeRole), { status: 200 });
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
