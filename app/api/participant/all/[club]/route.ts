import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		club: string;
	};
}
export const GET = async (req: Request, { params }: Props) => {
	//console.log("Wszedłem do funkcji", params);
	const club = params.club;
	//console.log("Id Groupy to ", groupIdNum);
	try {
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
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
