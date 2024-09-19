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
								include: {
									locationschedule: {
										include: {
											locations: {
												select: { name: true },
											},
										},
									},
									terms: {
										include: { location: { select: { name: true } } },
									},
									breaks: true,
								},
							},
						},
					},
					payments: {
						include: {
							payment: true,
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

			const participants = allParticipants.map((object) => {
				const paymentsArray = object.payments.map((paymentParticipant) => ({
					id: paymentParticipant.payment.id,
					amount: paymentParticipant.payment.amount,
					description: paymentParticipant.payment.description,
					paymentDate: paymentParticipant.payment.paymentDate,
					paymentMethod: paymentParticipant.payment.paymentMethod,
					month: paymentParticipant.payment.month,
				}));
				const groups = object.participantgroup.map((gr) => {
					return {
						...gr.group,
					};
				});
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
														include: {
															locationschedule: {
																include: {
																	locations: {
																		select: { name: true },
																	},
																},
															},
															terms: {
																include: {
																	location: { select: { name: true } },
																},
															},
															breaks: true,
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
				const groups = object.participantgroup.map((gr: any) => {
					return {
						...gr.group,
					};
				});
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
