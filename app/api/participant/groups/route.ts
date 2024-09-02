import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		id: string;
	};
}

export const POST = async (req: Request) => {
	const { groupId, participantId } = await req.json();
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
			return Response.json(
				{ error: "Uczestnik już należy do tej grupy" },
				{ status: 400 }
			);
		} else {
			const newGroup = await prisma.participantgroup.create({
				data: {
					groupId: groupId,
					participantId: participantId,
				},
			});
			if (!newGroup) {
				return Response.json(
					{ error: "Nie udało się dodać grupy" },
					{ status: 400 }
				);
			}
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
			if (!addedGroup) {
				return Response.json(
					{ error: "Nie udało się uzyskać informacji o dodanej grupie" },
					{ status: 400 }
				);
			}

			//console.log(formatGroup);
			return new Response(JSON.stringify(addedGroup), { status: 200 });
		}
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
export const DELETE = async (req: Request) => {
	const { groupId, participantId } = await req.json();
	//console.log(groupId, participantId);
	try {
		const deleteGroup = await prisma.participantgroup.deleteMany({
			where: {
				participantId: participantId,
				groupId: groupId,
			},
		});
		if (!deleteGroup) {
			return Response.json(
				{ error: "Nie udało się usunąć grupy" },
				{ status: 400 }
			);
		}
		return Response.json(
			{ message: "Udało się usunąć grupę" },
			{ status: 200 }
		);
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
export const PUT = async (req: Request) => {
	const { groupIdToAdd, participantId, groupIdToRemove } = await req.json();
	//console.log(groupIdToAdd, participantId, groupIdToRemove);
	try {
		const exist = await prisma.participantgroup.findFirst({
			where: {
				groupId: groupIdToAdd,
				participantId: participantId,
			},
		});
		if (exist !== null) {
			return Response.json(
				{ error: "Uczestnik już należy do tej grupy" },
				{ status: 400 }
			);
		} else {
			const newGroup = await prisma.participantgroup.create({
				data: {
					groupId: groupIdToAdd,
					participantId: participantId,
				},
			});
			if (!newGroup) {
				return Response.json(
					{ error: "Nie udało się dodać grupy" },
					{ status: 400 }
				);
			}
			const deleteGroup = await prisma.participantgroup.deleteMany({
				where: {
					participantId: participantId,
					groupId: groupIdToRemove,
				},
			});
			if (!deleteGroup) {
				return Response.json(
					{ error: "Nie udało się usunąć grupy" },
					{ status: 400 }
				);
			}
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
			if (!addedGroup) {
				return Response.json(
					{ error: "Nie udało się uzyskać informacji o dodanej grupie" },
					{ status: 400 }
				);
			}

			//console.log(formatGroup);
			return new Response(JSON.stringify(addedGroup), { status: 200 });
		}
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
