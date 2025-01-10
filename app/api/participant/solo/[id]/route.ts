import { prisma } from "@/prisma/prisma";

interface Props {
	params: Promise<{
		id: string;
	}>;
}
export const GET = async (req: Request, { params }: Props) => {
	//console.log("Wszedłem do funkcji", params);
	const participantId = parseInt((await params).id, 10);
	//console.log("Id Groupy to ", groupIdNum);
	try {
		const participant = await prisma.participant.findUnique({
			where: {
				id: participantId,
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
		if (!participant) {
			return Response.json(
				{ error: "Podana uczestnik nie istnieje" },
				{
					status: 404,
				}
			);
		}

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

		return Response.json(formattedParticipant);
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
