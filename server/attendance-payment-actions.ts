"use server";
import { prisma } from "@/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export const updateAttendance = async (info: any) => {
	const session = await auth();
	if (session) {
		const { date, isChecked, dateToRemove, groupId, participantId } = info;
		//const groupId = parseInt(params.ids[0], 10);
		//const participantId = parseInt(params.ids[1], 10);
		console.log("group: ", groupId, " participant: ", participantId, date);
		try {
			const existingAttendance = await prisma.attendance.findFirst({
				where: {
					participantId: participantId,
					groupId: groupId,
					date: date,
				},
			});
			//console.log(existingAttendance);
			if (!existingAttendance) {
				if (isChecked) {
					const belongs = await prisma.participantgroup.findFirst({
						where: { groupId, participantId },
					});
					if (belongs) {
						await prisma.attendance.create({
							data: {
								date: date,
								groupId,
								participantId,
								belongs: true,
							},
						});
						return Response.json({ message: "Obecny" }, { status: 200 });
					} else {
						await prisma.attendance.create({
							data: {
								date: date,
								groupId,
								participantId,
								belongs: false,
							},
						});
						if (dateToRemove) {
							const existingAttendance = await prisma.attendance.findFirst({
								where: {
									participantId,
									groupId,
									date: dateToRemove,
								},
							});
							await prisma.attendance.delete({
								where: {
									id: existingAttendance?.id,
								},
							});
							return Response.json({ message: "Edytowano" }, { status: 200 });
						} else {
							return Response.json({ message: "Obrabia" }, { status: 200 });
						}
					}
				} else {
					return Response.json(
						{ error: "Błąd w logice systemu przy dodawaniu obecności" },
						{ status: 400 }
					);
				}
			}
			if (!isChecked && existingAttendance) {
				// Usuń istniejący wpis obecności
				await prisma.attendance.delete({
					where: {
						id: existingAttendance.id,
					},
				});
				return Response.json({ message: "Nie obecny" }, { status: 200 });
			} else {
				return Response.json(
					{ error: "Błąd w logice systemu przy usuwaniu obecności" },
					{ status: 400 }
				);
			}
		} catch (error: any) {
			return Response.json({ error: error.message }, { status: error.code });
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};

export const getWorkingOutParticipants = async (id: number) => {
	const session = await auth();
	if (session) {
		try {
			const existingAttendance = await prisma.attendance.findMany({
				where: {
					belongs: false,
					groupId: id,
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
			//console.log(existingAttendance);
			if (!existingAttendance)
				return { error: "Brak odrabiających w tej grupie" };

			const uniqueParticipants: any[] = [];
			const uniqueIds: Set<number> = new Set();

			existingAttendance.forEach((object: any) => {
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

				const participant = {
					...object.participant,
					payments: paymentsArray,
				};

				// Dodaj uczestnika tylko jeśli nie istnieje już w tablicy
				if (!uniqueIds.has(participant.id)) {
					uniqueIds.add(participant.id);
					uniqueParticipants.push(participant);
				}
			});

			return uniqueParticipants;
		} catch (error: any) {
			console.error(error);
			return { error: "Błąd przy pobieraniu odrabiających" };
		}
	} else {
		return { error: "Musisz być zalogowany!" };
	}
};

export const modifyPayment = async (info: any) => {
	const session = await auth();
	if (session) {
		const {
			amount,
			description,
			paymentDate,
			paymentMethod,
			selectedMonth,
			action,
			participantId,
		} = info;
		try {
			const existingPayment = await prisma.payment.findFirst({
				where: {
					participants: {
						some: { participantId: participantId },
					},
					month: selectedMonth,
				},
			});
			if (existingPayment && action === "save") {
				const updatedPayment = await prisma.payment.update({
					where: {
						id: existingPayment.id,
					},
					data: {
						amount: parseInt(amount, 10) || existingPayment.amount,
						description: description || existingPayment.description,
						paymentDate: paymentDate || existingPayment.paymentDate,
						paymentMethod: paymentMethod || existingPayment.paymentMethod,
					},
				});
				if (updatedPayment) {
					return updatedPayment;
				} else {
					return { error: "Nie udało się zaktualizować płatności" };
				}
			} else if (existingPayment && action === "delete") {
				const deleteRelation = await prisma.payment_participant.deleteMany({
					where: { paymentId: existingPayment.id },
				});
				if (!deleteRelation)
					return { error: "Nie udało się usunąć relacji z płatnością" };

				const deletedPayment = await prisma.payment.delete({
					where: { id: existingPayment.id },
				});
				if (!deletedPayment) return { error: "Nie udało się usunąć płatności" };

				return existingPayment;
			} else if (!existingPayment) {
				const newPayment = await prisma.payment.create({
					data: {
						amount: parseInt(amount, 10),
						month: selectedMonth,
						description: description,
						paymentDate: paymentDate,
						paymentMethod: paymentMethod,
					},
				});
				await prisma.payment_participant.create({
					data: {
						paymentId: newPayment.id,
						participantId: participantId,
					},
				});
				return newPayment;
			} else {
				return { error: "Błąd w logice systemu przy dodawaniu płatności" };
			}
		} catch (error: any) {
			return { error: "Błąd przy manipulacją płatności" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
