import { prisma } from "@/prisma/prisma";
import { group } from "console";

export const POST = async (req: Request) => {
	const {
		name,
		color,
		prtCount,
		locId,
		signInfo,
		firstLesson,
		lastLesson,
		diffrentPlaces,
		breaks,
		terms,
		price,
		payOption,
		clientsPay,
		xClasses,
		type,
		club,
		coachId,
	} = await req.json();

	console.log(
		name,
		color,
		prtCount,
		locId,
		signInfo,
		firstLesson,
		lastLesson,
		diffrentPlaces,
		breaks,
		terms,
		price,
		payOption,
		clientsPay,
		xClasses,
		type,
		club,
		coachId
	);

	if (!name || !firstLesson || !lastLesson || club === "") {
		return Response.json({ error: "Brak wymaganych danych" }, { status: 400 });
	}

	try {
		// Sprawdzenie, czy w każdym term jest prawidłowy locationId
		const uniqueLocIds = new Set<number>(
			terms
				.filter((term: any) => term.locId && typeof term.locId === "number")
				.map((term: any) => term.locId)
		);

		// Logowanie, aby zobaczyć, które locationId są unikalne
		console.log("Unikalne locationId: ", [...uniqueLocIds]);

		const uniqueLocIdsArray = [...uniqueLocIds]; // Bez mapowania, ponieważ locationId są już gotowe

		const newGroup = await prisma.group.create({
			data: {
				name: name,
				price: Number(price),
				firstLesson: firstLesson,
				lastLesson: lastLesson,
				signInfo: String(signInfo),
				participantCount: Number(prtCount),
				club: club,
				color: color,
				payOption: payOption,
				clientsPay: clientsPay,
				type: type,
				xClass: xClasses,
			},
		});

		if (!newGroup) {
			return Response.json(
				{ error: "Nie udało się utworzyć grupy" },
				{ status: 500 }
			);
		}

		// Tworzenie harmonogramu dla lokalizacji
		const newSchedule = await Promise.all(
			uniqueLocIdsArray.map(async (locId) => {
				return prisma.locationschedule.create({
					data: {
						locations: {
							connect: { id: locId },
						},
						group: {
							connect: { id: newGroup.id },
						},
					},
				});
			})
		);

		if (!newSchedule) {
			return Response.json(
				{ error: "Nie udało się dodać harmonogramu do lokalizacji" },
				{ status: 500 }
			);
		}

		// Tworzenie terminów
		const newTerms = await prisma.term.createMany({
			data: terms
				.filter((term: any) => term.locId) // Pomiń terminy bez locationId
				.map((term: any) => ({
					dayOfWeek: term.dayOfWeek,
					locationId: term.locId,
					timeS: term.timeS,
					timeE: term.timeE,
					effectiveDate: new Date(), // Można tutaj użyć bardziej zaawansowanej logiki, jeśli potrzeba
					groupId: newGroup.id,
				})),
			skipDuplicates: true, // opcjonalne, pomija duplikaty
		});

		if (!newTerms) {
			return Response.json(
				{ error: "Nie udało się zapisać terminów" },
				{ status: 500 }
			);
		}

		// Tworzenie przerw
		if (breaks.length > 0) {
			const newBreaks = await prisma.break.createMany({
				data: breaks.map((b: any) => ({
					name: b.name,
					begin: b.begin,
					end: b.end,
					groupId: newGroup.id,
				})),
				skipDuplicates: true,
			});
			if (!newBreaks) {
				return Response.json(
					{ error: "Nie udało się zapisać przerw" },
					{ status: 500 }
				);
			}
		}
		if (coachId !== "") {
			const coach = await prisma.groupcoach.create({
				data: {
					userId: coachId,
					groupId: newGroup.id,
				},
			});
			if (!coach)
				return Response.json(
					{ error: "Nie udało się przypisać prowadzącego" },
					{ status: 500 }
				);
		}

		return new Response(JSON.stringify(newGroup), { status: 200 });
	} catch (error: any) {
		console.error("Błąd przy komunikacji z bazą danych:  ", error);
		return Response.json(
			{ error: "Wystąpił błąd przy komunikacji z bazą danych" },
			{ status: 500 }
		);
	}
};

export const DELETE = async (req: Request) => {
	const { id } = await req.json();
	//console.log("Id grupy to " + id);
	try {
		if (id !== null && id !== undefined) {
			const deleteSchedule = await prisma.locationschedule.deleteMany({
				where: { group: { id: id } },
			});
			if (!deleteSchedule)
				return Response.json(
					{ error: "Nie udało się usunąć relacji z lokalizacją" },
					{ status: 404 }
				);

			const deleteParticipants = await prisma.participantgroup.deleteMany({
				where: { groupId: id },
			});
			if (!deleteParticipants)
				return Response.json(
					{ error: "Nie udało się usunąć relacji z uczestnikami" },
					{ status: 404 }
				);

			const deleteAttendance = await prisma.attendance.deleteMany({
				where: { groupId: id },
			});
			if (!deleteAttendance)
				return Response.json(
					{ error: "Nie udało się usunąć obecności" },
					{ status: 500 }
				);

			const deleteCoach = await prisma.groupcoach.deleteMany({
				where: { groupId: id },
			});
			if (!deleteCoach)
				return Response.json(
					{ error: "Nie udało się usunąć trenerów" },
					{ status: 500 }
				);

			const deleteTerms = await prisma.term.deleteMany({
				where: { groupId: id },
			});
			if (!deleteTerms)
				return Response.json(
					{ error: "Nie udało się usunąć terminów" },
					{ status: 500 }
				);
			const deleteBreaks = await prisma.break.deleteMany({
				where: { groupId: id },
			});
			if (!deleteBreaks)
				return Response.json(
					{ error: "Nie udało się usunąć przerw" },
					{ status: 500 }
				);
			const deleteGroup = await prisma.group.deleteMany({
				where: { id: id },
			});

			if (!deleteGroup) {
				return Response.json(
					{ error: "Nie udało się usunąć grupy" },
					{ status: 500 }
				);
			}

			return new Response(JSON.stringify(deleteGroup), { status: 200 });
		} else {
			return Response.json(
				{ error: "Błąd podczas usuwania grupy id undefined lub null" },
				{ status: 500 }
			);
		}
	} catch (error: any) {
		console.error("Błąd podczas usuwania grupy:", error);
		return Response.json(
			{ error: "Błąd podczas usuwania grupy" },
			{ status: error.status }
		);
	}
};

export const PUT = async (req: Request) => {
	const {
		id,
		name,
		color,
		prtCount,
		locId,
		signInfo,
		firstLesson,
		lastLesson,
		diffrentPlaces,
		breaks,
		terms,
		price,
		payOption,
		clientsPay,
		xClasses,
		type,
		club,
		coachId,
	} = await req.json();

	console.log(
		id,
		name,
		color,
		prtCount,
		locId,
		signInfo,
		firstLesson,
		lastLesson,
		diffrentPlaces,
		breaks,
		terms,
		price,
		payOption,
		clientsPay,
		xClasses,
		type,
		club,
		coachId
	);

	if (!name || !firstLesson || !lastLesson || club === "") {
		return Response.json({ error: "Brak wymaganych danych" }, { status: 400 });
	}

	try {
		// Sprawdzenie, czy grupa istnieje
		const existingGroup = await prisma.group.findUnique({
			where: { id: id },
			include: {
				coaches: true,
			},
		});

		if (!existingGroup) {
			return Response.json({ error: "Nie znaleziono grupy" }, { status: 400 });
		}

		// Transakcja aktualizacji grupy, lokalizacji, terminów i przerw
		const updatedGroup = await prisma.$transaction(async (prisma) => {
			// Aktualizacja danych grupy
			const updatedGroup = await prisma.group.update({
				where: { id: id },
				data: {
					name: name,
					price: Number(price),
					firstLesson: firstLesson,
					lastLesson: lastLesson,
					signInfo: String(signInfo),
					participantCount: Number(prtCount),
					club: club,
					color: color,
					payOption: payOption,
					clientsPay: clientsPay,
					type: type,
					xClass: xClasses,
				},
			});

			// Aktualizacja lokalizacji w harmonogramie (jeśli lokalizacja została zmieniona)
			/*await prisma.locationschedule.updateMany({
				where: { groupId: id },
				data: {
					locationId: locId,
				},
			});*/

			// Aktualizacja, dodanie lub usunięcie terminów
			// Najpierw usunięcie istniejących terminów, które nie są już aktualne
			await prisma.term.deleteMany({
				where: { groupId: id },
			});

			// Następnie dodanie nowych terminów
			await prisma.term.createMany({
				data: terms.map((term: any) => ({
					dayOfWeek: term.dayOfWeek,
					locationId:
						typeof term.locId === "number" ? term.locId : parseInt(term.locId),
					timeS: term.timeS,
					timeE: term.timeE,
					effectiveDate: new Date(), // Możesz dostosować tę datę, jeśli terminy mają inne daty rozpoczęcia
					groupId: id, // Podaj ID grupy
				})),
				skipDuplicates: true,
			});

			// Aktualizacja, dodanie lub usunięcie przerw
			// Najpierw usunięcie istniejących przerw, które nie są już aktualne
			await prisma.break.deleteMany({
				where: { groupId: id },
			});

			// Następnie dodanie nowych przerw
			if (breaks.length > 0) {
				await prisma.break.createMany({
					data: breaks.map((b: any) => ({
						name: b.name,
						begin: b.begin,
						end: b.end,
						groupId: id,
					})),
					skipDuplicates: true,
				});
			}
			if (coachId !== "") {
				await Promise.all(
					existingGroup.coaches.map(async (c) => {
						return prisma.groupcoach.deleteMany({
							where: {
								userId: c.userId,
								groupId: c.groupId,
							},
						});
					})
				);
				await prisma.groupcoach.create({
					data: {
						userId: coachId,
						groupId: existingGroup.id,
					},
				});
			}

			return updatedGroup;
		});

		// Odpowiedź po udanej aktualizacji
		return new Response(JSON.stringify(updatedGroup), { status: 200 });
	} catch (error: any) {
		console.error("Błąd podczas aktualizacji danych: ", error);
		return Response.json(
			{ error: "Wystąpił błąd podczas aktualizacji danych" },
			{ status: error.status }
		);
	}
};
