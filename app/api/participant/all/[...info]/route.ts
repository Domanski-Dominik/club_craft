import { prisma } from "@/prisma/prisma";
import { isWithinInterval, subDays, format, subMonths, parse } from "date-fns";

interface Props {
	params: {
		info: [string, string, string];
	};
}
const updateParticipantStatus = async (participant: any) => {
	const participantId = participant.id;

	const recentAttendances = participant.attendance.filter((a: any) => {
		// Parsuj datę z formatu dd-mm-yyyy do obiektu Date
		const attendanceDate = parse(a.date, "dd-MM-yyyy", new Date());

		// Sprawdź, czy obecność jest w ostatnich 31 dniach
		return isWithinInterval(attendanceDate, {
			start: subDays(new Date(), 31),
			end: new Date(),
		});
	});

	const hasPaymentForPreviousMonth = participant.payments.some(
		(paymentParticipant: any) => {
			const previousMonth = subMonths(new Date(), 1);
			return (
				format(previousMonth, "MM-yyyy") === paymentParticipant.payment.month ||
				format(new Date(), "MM-yyyy") === paymentParticipant.payment.month
			);
		}
	);
	/*console.log(
		participant.lastName,
		recentAttendances,
		hasPaymentForPreviousMonth
	);*/
	await prisma.participant.update({
		where: { id: participantId },
		data: {
			active: recentAttendances.length > 0 || hasPaymentForPreviousMonth,
		},
	});
};
export const GET = async (req: Request, { params }: Props) => {
	const role = params.info[0];
	const club = params.info[1];
	const coachId = params.info[2];
	try {
		if (role === "owner") {
			const allParticipants = await prisma.participant.findMany({
				where: {
					club: club,
				},
				include: {
					attendance: true,
					participantgroup: {
						include: {
							group: {
								select: {
									id: true,
									name: true,
									dayOfWeek: true,
									locationschedule: {
										include: {
											locations: {
												select: { name: true },
											},
										},
									},
								},
							},
						},
					},
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
			});
			if (!allParticipants) {
				return Response.json(
					{ error: "allParticipants nie istnieje" },
					{
						status: 404,
					}
				);
			}
			await Promise.all(allParticipants.map(updateParticipantStatus));
			const participants = allParticipants.map((object) => {
				const paymentsArray = object.payments.map((paymentParticipant) => ({
					id: paymentParticipant.payment.id,
					amount: paymentParticipant.payment.amount,
					description: paymentParticipant.payment.description,
					paymentDate: paymentParticipant.payment.paymentDate,
					paymentMethod: paymentParticipant.payment.paymentMethod,
					month: paymentParticipant.payment.month,
				}));
				const groups = object.participantgroup.map((gr) => ({
					id: gr.groupId,
					name: gr.group.name,
					day: gr.group.dayOfWeek,
					location: gr.group.locationschedule
						.map((loc) => loc.locations.name)
						.join(", "),
				}));
				return {
					...object,
					payments: paymentsArray,
					participantgroup: groups,
				};
			});

			return Response.json(participants);
		}
		if (role === "coach") {
			const accessedParticipants = await prisma.groupcoach.findMany({
				where: { userId: coachId },
				include: {
					group: {
						include: {
							participantgroup: {
								include: {
									participant: {
										include: {
											attendance: true,
											payments: {
												include: {
													payment: true,
												},
											},
											participantgroup: {
												include: {
													group: {
														select: {
															id: true,
															name: true,
															dayOfWeek: true,
															locationschedule: {
																include: {
																	locations: {
																		select: { name: true },
																	},
																},
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			});
			const uniqueParticipants = new Map<number, any>();

			accessedParticipants.forEach((item) => {
				const { group } = item;
				if (group) {
					const participants = group.participantgroup.map(
						(participantgroup) => participantgroup.participant
					);
					if (participants) {
						participants.forEach((participant) => {
							const participantId = participant.id;
							if (participantId && !uniqueParticipants.has(participantId)) {
								uniqueParticipants.set(participantId, participant);
							}
						});
					}
				}
			});
			const sortedParticipants = Array.from(uniqueParticipants.values());

			const participants = sortedParticipants.map((object) => {
				const paymentsArray = object.payments.map(
					(paymentParticipant: any) => ({
						id: paymentParticipant.payment.id,
						amount: paymentParticipant.payment.amount,
						description: paymentParticipant.payment.description,
						paymentDate: paymentParticipant.payment.paymentDate,
						paymentMethod: paymentParticipant.payment.paymentMethod,
						month: paymentParticipant.payment.month,
					})
				);
				const groups = object.participantgroup.map((gr: any) => ({
					id: gr.groupId,
					name: gr.group.name,
					day: gr.group.dayOfWeek,
					location: gr.group.locationschedule
						.map((loc: any) => loc.locations.name)
						.join(", "),
				}));
				return {
					...object,
					payments: paymentsArray,
					participantgroup: groups,
				};
			});

			return Response.json(participants);
		}
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
