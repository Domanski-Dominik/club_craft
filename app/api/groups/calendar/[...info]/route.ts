import { prisma } from "@/prisma/prisma";

interface Props {
	params: Promise<{
		info: [string, string, string];
	}>;
}

export const GET = async (req: Request, { params }: Props) => {
	const role = (await params).info[0];
	const club = (await params).info[1];
	const coachId = (await params).info[2];
	//console.log("To jest nazwa klubu: ", club);
	try {
		if (role === "owner") {
			const groups = await prisma.group.findMany({
				where: { club: club },
				include: {
					locationschedule: { include: { locations: true } },
					terms: { include: { location: true } },
					breaks: true,
					participantgroup: { include: { participant: true } },
					coaches: { include: { user: true } },
				},
			});
			if (!groups)
				return Response.json(
					{ error: "Nie udało się pobrać danych" },
					{ status: 400 }
				);
			const formatedgroups = groups.map((g) => {
				const participants = g.participantgroup.map((p) => p.participant);
				const coachesformat = g.coaches.map((c) => c.user);
				return {
					...g,
					participantgroup: participants,
					coaches: coachesformat,
				};
			});
			return new Response(JSON.stringify(formatedgroups), { status: 200 });
		}
		if (role === "coach") {
			const access = await prisma.groupcoach.findMany({
				where: { userId: coachId },
				include: {
					group: {
						include: {
							locationschedule: {
								include: { locations: true },
							},
							terms: { include: { location: true } },
							breaks: true,
						},
					},
				},
			});
			// Wyodrębnienie grup z dostępów trenera
			const groups = access.map((item) => item.group);

			if (!groups || groups.length === 0) {
				return new Response(
					JSON.stringify({ error: "Nie udało się pobrać danych" }),
					{ status: 400 }
				);
			}

			// Formatowanie grup
			const formatedgroups = groups.map((g) => {
				const locs = g.locationschedule.map((schedule) => ({
					id: schedule.locations.id,
					name: schedule.locations.name,
				}));
				return {
					...g,
					locationschedule: locs,
				};
			});

			return new Response(JSON.stringify(formatedgroups), { status: 200 });
		}
	} catch (error) {
		console.error("Błąd podczas pobierania danych:", error);
		return new Response("Nie znaleziono danych", { status: 500 });
	}
};
