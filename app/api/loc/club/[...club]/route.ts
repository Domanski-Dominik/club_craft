import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		club: [string, string, string];
	};
}

export const GET = async (req: Request, { params }: Props) => {
	const club = params.club[0];
	const role = params.club[1];
	const coachId = params.club[2];
	//console.log("To jest nazwa klubu: ", club);
	if (role === "owner") {
		try {
			const Loc = await prisma.locations.findMany({
				where: { club: club },
			});
			if (!Loc)
				return Response.json(
					{
						error:
							"Nie udało się pobrać lokalizacji, sprawdź połączenie z internetem",
					},
					{ status: 400 }
				);
			//console.log(Loc);
			return new Response(JSON.stringify(Loc), { status: 200 });
		} catch (error) {
			console.error("Błąd podczas pobierania lokalizacji:", error);
			return new Response("Nie znaleziono lokalizacji", { status: 500 });
		}
	}
	if (role === "coach") {
		try {
			const access = await prisma.groupcoach.findMany({
				where: { userId: coachId },
				include: {
					group: {
						include: { locationschedule: { include: { locations: true } } },
					},
				},
			});
			if (!access)
				return Response.json(
					{
						error:
							"Nie udało się pobrać lokalizacji, sprawdź połączenie z internetem",
					},
					{ status: 400 }
				);
			if (access.length === 0) {
				return Response.json(
					{
						error: "Nie zostały ci przypisane jeszcze żadne grupy",
					},
					{ status: 400 }
				);
			}
			const uniqueLocationIds = new Set<number>();
			const uniqueLocations: any[] = [];

			access.forEach((item) => {
				const { group } = item;
				if (group && group.locationschedule) {
					group.locationschedule.forEach((schedule) => {
						const { locations } = schedule;
						if (locations) {
							// Sprawdź, czy locations to pojedynczy obiekt
							if (Array.isArray(locations)) {
								locations.forEach((location) => {
									const { id } = location;
									if (typeof id === "number") {
										uniqueLocationIds.add(id);
									}
								});
							} else {
								const { id } = locations;
								if (typeof id === "number") {
									uniqueLocationIds.add(id);
								}
							}
						}
					});
				}
			});

			// Pobierz pełne dane lokalizacji na podstawie unikalnych identyfikatorów
			uniqueLocationIds.forEach((id) => {
				const locationDetails = access
					.map((item) => item.group?.locationschedule)
					.flat()
					.map((schedule) => schedule?.locations)
					.flat()
					.find((location) => location?.id === id);

				if (locationDetails) {
					uniqueLocations.push(locationDetails);
				}
			});

			return new Response(JSON.stringify(uniqueLocations));
		} catch (error) {}
	}
};
