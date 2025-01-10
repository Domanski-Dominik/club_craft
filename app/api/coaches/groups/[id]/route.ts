import { prisma } from "@/prisma/prisma";

interface Props {
	params: Promise<{
		id: string;
	}>;
}

export const GET = async (req: Request, { params }: Props) => {
	const coachId = (await params).id;

	try {
		const groupIds = await prisma.groupcoach.findMany({
			where: { userId: coachId },
		});
		const formattedGroupIds = groupIds.map((gr) => gr.groupId);
		return new Response(JSON.stringify(formattedGroupIds), { status: 200 });
	} catch (error) {
		console.error("Błąd podczas pobierania danych:", error);
		return Response.json({ error: "Nie znaleziono danych" }, { status: 500 });
	}
};
