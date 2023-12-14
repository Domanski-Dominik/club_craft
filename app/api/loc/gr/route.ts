import { prisma } from "@/prisma/prisma";

export const POST = async (req: Request) => {
	const { name, dayOfWeek, timeS, timeE, locationId, club } = await req.json();
	console.log(name, dayOfWeek, timeS, timeE, locationId, club);

	if (!name || !timeS || !timeE || !locationId) {
		return new Response("Brak wymaganych danych", { status: 400 });
	}
	try {
		const findLoc = await prisma.locations.findUnique({
			where: { id: locationId },
		});

		if (!findLoc || !findLoc.name) {
			return new Response("Nie znaleziono lokalizacji:", { status: 404 });
		}

		const newGroup = await prisma.group.create({
			data: {
				name: String(name),
				dayOfWeek: Number(dayOfWeek),
				timeS: String(timeS),
				timeE: String(timeE),
				club: String(club),
			},
		});

		const newSchedule = await prisma.locationschedule.create({
			data: {
				locations: {
					connect: { id: locationId },
				},
				group: {
					connect: { id: newGroup.id },
				},
			},
		});
		if (!newSchedule) {
			return new Response("Nie udało się dodać harmonogramu do lokalizacji", {
				status: 500,
			});
		}
		return new Response(JSON.stringify(newGroup), { status: 200 });
	} catch (error) {
		console.error("Błąd przy komunikacji z bazą danych:  ", error);
		return new Response("Wystąpił błąd przy komunikacji z bazą danych", {
			status: 500,
		});
	}
};
export const DELETE = async (req: Request) => {
	const { id } = await req.json();
	console.log("Id grupy to " + id);
	try {
		if (id !== null && id !== undefined) {
			const deleteSchedule = await prisma.locationschedule.deleteMany({
				where: { group: { id: id } },
			});

			if (!deleteSchedule) {
				return new Response("Nie udało się usunąć relacji z lokalizacją:", {
					status: 404,
				});
			}

			const deleteGroup = await prisma.group.delete({
				where: { id: id },
			});

			if (!deleteGroup) {
				return new Response("Nie udało się usunąć grupy", { status: 500 });
			}

			return new Response(JSON.stringify(deleteGroup), { status: 200 });
		} else {
			return new Response("Błąd podczas usuwania grupy id undefined lub null", {
				status: 500,
			});
		}
	} catch (error) {
		console.error("Błąd podczas usuwania grupy:", error);
		return new Response("Błąd podczas usuwania grupy", { status: 500 });
	}
};

export const PUT = async (req: Request) => {
	const { name, dayOfWeek, timeS, timeE, locationId, id } = await req.json();
	//console.log("Wszedłem w edytowanie");
	console.log(id, name, dayOfWeek, timeS, timeE, locationId);
	if (!name || !timeS || !timeE || !locationId) {
		return new Response("Brak wymaganych danych", { status: 400 });
	}
	try {
		// Sprawdzenie, czy grupa istnieje
		const existingGroup = await prisma.group.findUnique({
			where: { id: id },
		});

		if (!existingGroup) {
			return new Response("Grupa nie istnieje", { status: 404 });
		}

		// Aktualizacja danych grupy
		const updatedGroup = await prisma.group.update({
			where: { id: id },
			data: {
				name: name !== undefined ? String(name) : existingGroup.name,
				dayOfWeek:
					dayOfWeek !== undefined ? Number(dayOfWeek) : existingGroup.dayOfWeek,
				timeS: timeS !== undefined ? String(timeS) : existingGroup.timeS,
				timeE: timeE !== undefined ? String(timeE) : existingGroup.timeE,
			},
		});

		// Odpowiedź po udanej aktualizacji
		return new Response(JSON.stringify(updatedGroup), { status: 200 });
	} catch (error) {
		console.error("Błąd podczas aktualizacji danych: ", error);
		return new Response("Wystąpił błąd podczas aktualizacji danych", {
			status: 500,
		});
	}
};
