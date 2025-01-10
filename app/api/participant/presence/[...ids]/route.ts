import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

interface Props {
	params: Promise<{
		ids: [string, string];
	}>;
}
export const PUT = async (req: Request, { params }: Props) => {
	const { date, isChecked, dateToRemove } = await req.json();
	const groupId = parseInt((await params).ids[0], 10);
	const participantId = parseInt((await params).ids[1], 10);
	//console.log("group: ", groupId, " participant: ", participantId, date);
	try {
		const existingAttendance = await prisma.attendance.findFirst({
			where: {
				participantId,
				groupId,
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
};
export const GET = async (req: Request, { params }: Props) => {
	const groupId = parseInt((await params).ids[0], 10);
	try {
		const existingAttendance = await prisma.attendance.findMany({
			where: {
				belongs: false,
				groupId,
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
		if (!existingAttendance) {
			return Response.json(
				{ message: "Brak odrabiających w tej grupie" },
				{ status: 200 }
			);
		}

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

		return NextResponse.json(uniqueParticipants);
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
