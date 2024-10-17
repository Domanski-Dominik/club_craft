"use server";
import { prisma } from "@/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export const addGroup = async (info: any) => {
	const session = await auth();
	if (session) {
		if (!info.name || !info.firstLesson || !info.lastLesson)
			return { error: "Brak wymaganych danych" };

		try {
			// Sprawdzenie, czy w każdym term jest prawidłowy locationId
			const uniqueLocIds = new Set<number>(
				info.terms
					.filter((term: any) => term.locId && typeof term.locId === "number")
					.map((term: any) => term.locId)
			);

			// Logowanie, aby zobaczyć, które locationId są unikalne
			//console.log("Unikalne locationId: ", [...uniqueLocIds]);

			const uniqueLocIdsArray = [...uniqueLocIds]; // Bez mapowania, ponieważ locationId są już gotowe

			const newGroup = await prisma.group.create({
				data: {
					name: info.name,
					price: Number(info.price),
					firstLesson: info.firstLesson,
					lastLesson: info.lastLesson,
					signInfo: String(info.signInfo),
					participantCount: Number(info.prtCount),
					club: session.user.club,
					color: info.color,
					payOption: info.payOption,
					clientsPay: info.clientsPay,
					type: info.type,
					xClass: info.xClasses,
				},
			});

			if (!newGroup) return { error: "Nie udało się utworzyć grupy" };

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

			if (!newSchedule)
				return { error: "Nie udało się dodać harmonogramu do lokalizacji" };

			// Tworzenie terminów
			const newTerms = await prisma.term.createMany({
				data: info.terms
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

			if (!newTerms) return { error: "Nie udało się zapisać terminów" };

			// Tworzenie przerw
			if (info.breaks.length > 0) {
				const newBreaks = await prisma.break.createMany({
					data: info.breaks.map((b: any) => ({
						name: b.name,
						begin: b.begin,
						end: b.end,
						groupId: newGroup.id,
					})),
					skipDuplicates: true,
				});
				if (!newBreaks) return { error: "Nie udało się zapisać przerw" };
			}
			if (info.coachId !== "") {
				const coach = await prisma.groupcoach.create({
					data: {
						userId: info.coachId,
						groupId: newGroup.id,
					},
				});
				if (!coach) return { error: "Nie udało się przypisać prowadzącego" };
			}
			revalidateTag("groups");
			return newGroup;
		} catch (error: any) {
			console.error("Błąd przy komunikacji z bazą danych:  ", error);
			return { error: "Wystąpił błąd przy komunikacji z bazą danych" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const updateGroup = async (info: any) => {
	const session = await auth();
	if (session) {
		if (!info.id || !info.firstLesson || !info.lastLesson)
			return { error: "Brak wymaganych danych" };

		try {
			// Sprawdzenie, czy grupa istnieje
			const existingGroup = await prisma.group.findUnique({
				where: { id: info.id },
				include: {
					coaches: true,
				},
			});

			if (!existingGroup) return { error: "Nie znaleziono grupy" };

			// Aktualizacja danych grupy
			const updatedGroup = await prisma.$transaction(async (prisma) => {
				// Aktualizacja danych grupy
				const updatedGroup = await prisma.group.update({
					where: { id: info.id },
					data: {
						name: "name" in info ? info.name : existingGroup.name,
						price: "price" in info ? Number(info.price) : existingGroup.price,
						firstLesson:
							"firstLesson" in info
								? info.firstLesson
								: existingGroup.firstLesson,
						lastLesson:
							"lastLesson" in info ? info.lastLesson : existingGroup.lastLesson,
						signInfo:
							"signInfo" in info
								? String(info.signInfo)
								: existingGroup.signInfo,
						participantCount:
							"prtCount" in info
								? Number(info.prtCount)
								: existingGroup.participantCount,
						club: session.user.club,
						color: "color" in info ? info.color : existingGroup.color,
						payOption:
							"payOption" in info ? info.payOption : existingGroup.payOption,
						clientsPay:
							"clientsPay" in info ? info.clientsPay : existingGroup.clientsPay,
						type: "type" in info ? info.type : existingGroup.type,
						xClass: "xClass" in info ? info.xClasses : existingGroup.xClass,
					},
				});
				await prisma.term.deleteMany({
					where: { groupId: info.id },
				});

				// Następnie dodanie nowych terminów
				await prisma.term.createMany({
					data: info.terms.map((term: any) => ({
						dayOfWeek: term.dayOfWeek,
						locationId:
							typeof term.locId === "number"
								? term.locId
								: parseInt(term.locId),
						timeS: term.timeS,
						timeE: term.timeE,
						effectiveDate: new Date(), // Możesz dostosować tę datę, jeśli terminy mają inne daty rozpoczęcia
						groupId: info.id, // Podaj ID grupy
					})),
					skipDuplicates: true,
				});

				// Aktualizacja, dodanie lub usunięcie przerw
				// Najpierw usunięcie istniejących przerw, które nie są już aktualne
				await prisma.break.deleteMany({
					where: { groupId: info.id },
				});

				// Następnie dodanie nowych przerw
				if (info.breaks.length > 0) {
					await prisma.break.createMany({
						data: info.breaks.map((b: any) => ({
							name: b.name,
							begin: b.begin,
							end: b.end,
							groupId: info.id,
						})),
						skipDuplicates: true,
					});
				}
				if (info.coachId !== "") {
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
							userId: info.coachId,
							groupId: existingGroup.id,
						},
					});
				}

				return updatedGroup;
			});

			revalidateTag("groups");
			return updatedGroup;
		} catch (error: any) {
			console.error("Błąd podczas aktualizacji danych: ", error);
			return { error: "Wystąpił błąd podczas aktualizacji danych grupy" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const deleteGroup = async (id: number) => {
	const session = await auth();
	if (session) {
		try {
			if (id !== null && id !== undefined) {
				const existingGroup = await prisma.group.findUnique({
					where: { id: id },
				});
				if (!existingGroup)
					return { error: "Nie znaleziono grupy o podanym ID" };
				if (
					existingGroup.club === session.user.club &&
					session.user.role === "owner"
				) {
					const deleteSchedule = await prisma.locationschedule.deleteMany({
						where: { group: { id: id } },
					});
					if (!deleteSchedule)
						return { error: "Nie udało się usunąć relacji z lokalizacją" };

					const deleteParticipants = await prisma.participantgroup.deleteMany({
						where: { groupId: id },
					});
					if (!deleteParticipants)
						return { error: "Nie udało się usunąć relacji z uczestnikami" };
					/*const deleteAttendance = await prisma.attendance.deleteMany({
						where: { groupId: id },
					});
					if (!deleteAttendance)
						return { error: "Nie udało się usunąć obecności" };*/
					const deleteCoach = await prisma.groupcoach.deleteMany({
						where: { groupId: id },
					});
					if (!deleteCoach) return { error: "Nie udało się usunąć trenerów" };
					const deleteBreaks = await prisma.break.deleteMany({
						where: { groupId: id },
					});
					if (!deleteBreaks) return { error: "Nie udało się usunąć przerw" };
					const deleteTerms = await prisma.term.deleteMany({
						where: { groupId: id },
					});
					if (!deleteTerms) return { error: "Nie udało się usunąć terminów" };

					const deleteGroup = await prisma.group.delete({
						where: { id: id },
					});

					if (!deleteGroup) return { error: "Nie udało się usunąć grupy" };

					revalidateTag("groups");
					return deleteGroup;
				} else {
					return {
						error:
							session.user.role === "owner"
								? "Podana grupa nie należy do twojego klubu"
								: "Nie masz uprawnień do usunięcia tej grupy",
					};
				}
			} else {
				return { error: "Błąd podczas usuwania grupy id undefined lub null" };
			}
		} catch (error: any) {
			console.error("Błąd podczas usuwania grupy:", error);
			return { error: "Błąd podczas usuwania grupy" };
		}
	} else {
		return { error: "Wystąpił błąd podczas aktualizacji danych" };
	}
};
