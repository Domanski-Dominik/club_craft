import { prisma } from "@/prisma/prisma";

interface Props {
	params: Promise<{
		club: [string, string, string];
	}>;
}
export const GET = async (req: Request, { params }: Props) => {
	const club = (await params).club[0];
	try {
		const groups = await prisma.group.findMany({
			where: {
				club: club,
			},
			include: {
				locationschedule: {
					include: {
						locations: {
							select: {
								name: true,
								id: true,
							},
						},
					},
				},
				terms: { include: { location: { select: { name: true } } } },
				breaks: true,
			},
		});

		if (!groups) {
			return Response.json(
				{ error: "Nie znaleziono lokalizacji z grupami" },
				{
					status: 404,
				}
			);
		}
		const Formatted = groups.map((gr) => {
			return {
				...gr,
				locationschedule: gr.locationschedule
					.map((o) => o.locations.name)
					.toString(),
				locationId: gr.locationschedule.map((o) => o.locationId).shift(),
			};
		});

		//console.log(groups)
		return new Response(JSON.stringify(Formatted), { status: 200 });
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
