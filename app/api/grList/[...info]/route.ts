import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		info: [string, string, string];
	};
}

export const GET = async (req: Request, { params }: Props) => {
	const role = params.info[0];
	const club = params.info[1];
	const coachId = params.info[2];
	//console.log("To jest nazwa klubu: ", club);
	try {
		if (role === "owner") {
			const locs = await prisma.locations.findMany({
				where: { club: club },
				include: { locationschedule: { include: { group: true } } },
			});
			if (!locs)
				return Response.json(
					{ error: "Nie udało się pobrać danych" },
					{ status: 400 }
				);
			const formatedLocs = locs.map((loc) => {
				const groups = loc.locationschedule.map((schedule) => ({
					id: schedule.group.id,
					name: schedule.group.name,
					timeE: schedule.group.timeE,
					timeS: schedule.group.timeS,
					dayOfWeek: schedule.group.dayOfWeek,
				}));
				return {
					...loc,
					locationschedule: groups,
				};
			});
			return new Response(JSON.stringify(formatedLocs), { status: 200 });
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
						},
					},
				},
			});
			const uniqueLocations = new Map<number, any>(); // Mapa, gdzie klucz to id lokalizacji
			access.forEach((item) => {
				const { group } = item;
				if (group) {
					const locationschedule = group.locationschedule;
					if (locationschedule) {
						locationschedule.forEach((schedule) => {
							const location = schedule.locations;
							if (location) {
								const locationId = location.id;
								if (locationId && !uniqueLocations.has(locationId)) {
									uniqueLocations.set(locationId, {
										...location,
										locationschedule: [],
									});
								}

								const uniqueLocation = uniqueLocations.get(locationId);
								if (uniqueLocation) {
									uniqueLocation.locationschedule.push({
										id: group.id,
										name: group.name,
										timeE: group.timeE,
										timeS: group.timeS,
										dayOfWeek: group.dayOfWeek,
									});
								}
							}
						});
					}
				}
			});
			const uniqueLocationsArray = Array.from(uniqueLocations.values());
			return new Response(JSON.stringify(uniqueLocationsArray), {
				status: 200,
			});
		}
	} catch (error) {
		console.error("Błąd podczas pobierania danych:", error);
		return new Response("Nie znaleziono danych", { status: 500 });
	}
};
