"use server";
import { prisma } from "@/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { Session } from "next-auth";
import { Participant } from "@/types/type";

interface Add {
	email: string;
	phoneNumber: string;
	firstName: string;
	lastName: string;
	club: string;
	groups: number[];
	regulamin: boolean;
	contactWithParent: boolean;
	parentFirstName: string;
	parentLastName: string;
	birthday: string | null;
	note: string;
	id?: number;
}
export const addParticipant = async (info: Add) => {
	const session = await auth();
	if (session) {
		try {
			if (!info.lastName || !info.firstName || !info.groups)
				return { error: "Brakuje Imienia lub nazwiska" };

			const exist = await prisma.participant.findFirst({
				where: {
					firstName: info.firstName,
					lastName: info.lastName,
					club: info.club,
					parentFirstName: info.parentFirstName,
				},
			});
			//console.log(exist);
			if (exist)
				return { error: "Uczestnik o danym nazwisku i imieniu już istnieje" };

			const newParticipant = await prisma.participant.create({
				data: {
					firstName: info.firstName,
					lastName: info.lastName,
					email: info.email.toLowerCase(),
					phoneNumber: info.phoneNumber,
					club: info.club,
					regulamin: info.regulamin,
					contactWithParent: info.contactWithParent,
					parentFirstName: info.parentFirstName,
					parentLastName: info.parentLastName,
					birthday: info.birthday,
					participantgroup: {
						create: info.groups.map((id: number) => ({
							group: { connect: { id: id } },
						})),
					},
				},
				include: {
					participantgroup: true,
				},
			});
			if (!newParticipant)
				return { error: "Błąd podczas zapisywania uczestnika" };
			revalidateTag("participants");
			return newParticipant;
		} catch (error) {
			console.error("Błąd podczas pobierania lokalizacji:", error);
			return { error: "Nie udało sie dodać uczestnika" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const updateParticipant = async (info: Participant) => {
	const session = await auth();
	if (session) {
		try {
			const update = await prisma.participant.update({
				where: { id: info.id },
				data: {
					firstName: info.firstName,
					lastName: info.lastName,
					phoneNumber: info.phoneNumber,
					note: info.note,
					regulamin: info.regulamin,
					birthday: info.birthday,
					parentFirstName: info.parentFirstName,
					parentLastName: info.parentLastName,
				},
			});
			if (!update) return { error: "Nie udało się zaktualizować uczestnika" };

			return { message: "Udało się zaktualizować uczestnika" };
		} catch (error) {
			console.error("Błąd podczas pobierania lokalizacji:", error);
			return { error: "Nie udało sie dodać uczestnika" };
		} finally {
			revalidateTag("participants");
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const deleteParticipant = async (id: number) => {
	const session = await auth();
	if (session) {
		try {
			if (id !== null) {
				const deleteSchedule = await prisma.participantgroup.deleteMany({
					where: { participantId: id },
				});
				if (!deleteSchedule)
					return { error: "Nie udało się usunąć grup uczestnika" };

				const deleteAttendance = await prisma.attendance.deleteMany({
					where: { participantId: id },
				});
				if (!deleteAttendance)
					return { error: "Nie udało się usunąć obecości" };

				const deletePayments = await prisma.payment_participant.deleteMany({
					where: { participantId: id },
				});
				if (!deletePayments) return { error: "Nie udało się usunąć płatności" };

				const deletePrt = await prisma.participant.delete({
					where: { id: id },
				});
				if (!deletePrt) return { error: "Nie udało się usunąć uczestnika" };

				return { message: "Udało się usunąć uczestnika" };
			} else {
				return { error: "Błąd podczas usuwania uczestnika, nie posiada Id" };
			}
		} catch (error) {
			console.error("Błąd podczas pobierania lokalizacji:", error);
			return { error: "Nie udało sie usunąć uczestnika" };
		} finally {
			revalidateTag("participants");
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const getParticipantsByGroupId = async (
	groupId: number,
	session: Session | null
) => {
	if (session) {
		try {
			if (groupId !== null) {
				const schedule = await prisma.participantgroup.findMany({
					where: {
						groupId: groupId,
					},
					include: {
						participant: {
							include: {
								attendance: true,
								payments: {
									include: {
										payment: {
											select: {
												id: true,
												amount: true,
												description: true,
												paymentDate: true,
												paymentMethod: true,
												month: true,
											},
										},
									},
								},
							},
						},
					},
				});
				if (!schedule) return { error: "Podana grupa nie istnieje" };

				/*const participants = schedule.map((object) => object.participant);*/
				const participants = schedule.map((object: any) => {
					const paymentsArray = object.participant.payments.map(
						(paymentParticipant: any) => ({
							id: paymentParticipant.payment.id,
							amount: paymentParticipant.payment.amount,
							description: paymentParticipant.payment.description,
							paymentDate: paymentParticipant.payment.paymentDate,
							paymentMethod: paymentParticipant.payment.paymentMethod,
							month: paymentParticipant.payment.month,
						})
					);
					return {
						...object.participant,
						payments: paymentsArray,
					};
				});
				if (participants.length > 0) {
					return participants;
				} else {
					return { error: "Podana grupa nie ma jeszcze uczestników" };
				}
			} else {
				return { error: "Brakuje Id groupy do pobrania" };
			}
		} catch (error) {
			console.error(
				"Błąd przy pobieraniu uczestników należących grupy:",
				error
			);
			return { error: "Błąd przy pobieraniu uczestników należących grupy" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const addParticipantGroup = async (info: any) => {
	const session = await auth();
	if (session) {
		const { groupId, participantId } = info;
		//console.log(groupId, participantId);
		try {
			const exist = await prisma.participantgroup.findFirst({
				where: {
					groupId: groupId,
					participantId: participantId,
				},
			});
			//console.log(exist);
			if (exist !== null) {
				return { error: "Uczestnik już należy do tej grupy" };
			} else {
				const newGroup = await prisma.participantgroup.create({
					data: {
						groupId: groupId,
						participantId: participantId,
					},
				});
				if (!newGroup) return { error: "Nie udało się dodać grupy" };

				const addedGroup = await prisma.group.findUnique({
					where: { id: newGroup.groupId },
					include: {
						locationschedule: {
							include: {
								locations: {
									select: {
										name: true,
									},
								},
							},
						},
						terms: {
							include: { location: { select: { name: true } } },
						},
						breaks: true,
					},
				});
				if (!addedGroup)
					return { error: "Nie udało się uzyskać informacji o dodanej grupie" };
				//console.log(formatGroup);
				return addedGroup;
			}
		} catch (error) {
			console.error("Błąd przy dopisywaniu uczestnika do grupy:", error);
			return { error: "Błąd przy dopisywaniu uczestnika do grupy" };
		} finally {
			revalidateTag("participants");
		}
	} else {
		return { error: "Musisz być zalogowany!" };
	}
};
export const updateParticipantGroup = async (info: any) => {
	const session = await auth();
	if (session) {
		const { groupIdToAdd, participantId, groupIdToRemove } = info;
		//console.log(groupIdToAdd, participantId, groupIdToRemove);
		try {
			const exist = await prisma.participantgroup.findFirst({
				where: {
					groupId: groupIdToAdd,
					participantId: participantId,
				},
			});
			if (exist !== null) return { error: "Uczestnik już należy do tej grupy" };

			const newGroup = await prisma.participantgroup.create({
				data: {
					groupId: groupIdToAdd,
					participantId: participantId,
				},
			});
			if (!newGroup) return { error: "Nie udało się dodać grupy" };

			const deleteGroup = await prisma.participantgroup.deleteMany({
				where: {
					participantId: participantId,
					groupId: groupIdToRemove,
				},
			});
			if (!deleteGroup) return { error: "Nie udało się usunąć grupy" };

			const addedGroup = await prisma.group.findUnique({
				where: { id: newGroup.groupId },
				include: {
					locationschedule: {
						include: {
							locations: {
								select: {
									name: true,
								},
							},
						},
					},
					terms: {
						include: { location: { select: { name: true } } },
					},
					breaks: true,
				},
			});
			if (!addedGroup)
				return { error: "Nie udało się uzyskać informacji o dodanej grupie" };
			//console.log(formatGroup);
			return addedGroup;
		} catch (error) {
			console.error("Błąd przy edycji grup uczestnika", error);
			return { error: "Błąd przy przepisywaniu uczestnika do innej grupy" };
		} finally {
			revalidateTag("participants");
		}
	} else {
		return { error: "Musisz być zalogowany!" };
	}
};
export const deleteParticipantGroup = async (info: any) => {
	const session = await auth();
	if (session) {
		const { groupId, participantId } = info;
		//console.log(groupId, participantId);
		try {
			const deleteGroup = await prisma.participantgroup.deleteMany({
				where: {
					participantId: participantId,
					groupId: groupId,
				},
			});
			if (!deleteGroup) return { error: "Nie udało się usunąć grupy" };
			return deleteGroup;
		} catch (error) {
			console.error("Błąd przy usuwaniu grup uczestnika", error);
			return { error: "Błąd przy usuwaniu uczestnika z grupy" };
		} finally {
			revalidateTag("participants");
		}
	} else {
		return { error: "Musisz być zalogowany!" };
	}
};
export const getParticipantById = async (id: number) => {
	const session = await auth();
	if (session) {
		try {
			const participant = await prisma.participant.findUnique({
				where: {
					id: id,
				},
				include: {
					attendance: true,
					payments: {
						include: {
							payment: true,
						},
					},
				},
			});
			if (!participant) return { error: "Podana uczestnik nie istnieje" };

			const updatedAttendance = await Promise.all(
				participant.attendance.map(async (attendanceItem: any) => {
					const group = await prisma.group.findUnique({
						where: {
							id: attendanceItem.groupId,
						},
					});
					if (group) {
						return {
							...attendanceItem,
							groupName: group.name,
						};
					} else {
						// Jeśli grupa o podanym ID nie istnieje, zwracamy oryginalny obiekt
						return attendanceItem;
					}
				})
			);

			const formattedParticipant = {
				...participant,
				attendance: updatedAttendance,
				payments: participant.payments.map((p: any) => p.payment),
			};

			return formattedParticipant;
		} catch (error: any) {
			console.error("Błąd przy pobieraniu danych uczestnika", error);
			return { error: "Błąd przy pobieraniu danych uczestnika" };
		}
	} else {
		return { error: "Musisz być zalogowany!" };
	}
};
