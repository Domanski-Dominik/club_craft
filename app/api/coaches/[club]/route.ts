import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		club: string;
	};
}

export const GET = async (req: Request, { params }: Props) => {
	const club = params.club;
	//console.log("To jest nazwa klubu: ", club);
	try {
		const coaches = await prisma.user.findMany({
			where: { club: club },
			include: {
				coachedGroups: {
					include: {
						group: {
							include: {
								locationschedule: {
									include: { locations: { select: { name: true } } },
								},
								terms: { include: { location: { select: { name: true } } } },
								breaks: true,
							},
						},
					},
				},
			},
		});
		if (!coaches)
			return Response.json(
				{ error: "Nie znaleziono trenerów" },
				{ status: 400 }
			);

		const formatedCoaches = coaches.map((coach) => {
			const groups = coach.coachedGroups.map((gr) => {
				return {
					...gr.group,
				};
			});
			return {
				...coach,
				coachedGroups: groups,
			};
		});
		return new Response(JSON.stringify(formatedCoaches), { status: 200 });
	} catch (error) {
		console.error("Błąd podczas pobierania danych:", error);
		return new Response("Nie znaleziono danych", { status: 500 });
	}
};
export const POST = async (req: Request, { params }: Props) => {
	const { groupId, coachId } = await req.json();
	//console.log(groupId, coachId);
	try {
		const exist = await prisma.groupcoach.findFirst({
			where: {
				groupId: groupId,
				userId: coachId,
			},
		});
		//console.log(exist);
		if (exist !== null) {
			return Response.json(
				{ error: "Trener jest już przypisany do tej grupy" },
				{ status: 400 }
			);
		} else {
			const newGroup = await prisma.groupcoach.create({
				data: {
					groupId: groupId,
					userId: coachId,
				},
			});
			if (!newGroup) {
				return Response.json(
					{ error: "Nie udało się przypisać grupy" },
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
					terms: { include: { location: { select: { name: true } } } },
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
export const DELETE = async (req: Request, { params }: Props) => {
	const { groupId, coachId } = await req.json();
	//console.log(groupId, coachId);
	try {
		const deleteGroup = await prisma.groupcoach.deleteMany({
			where: {
				userId: coachId,
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
	const { groupIdToAdd, coachId, groupIdToRemove } = await req.json();
	//console.log(groupIdToAdd, coachId, groupIdToRemove);
	try {
		const exist = await prisma.groupcoach.findFirst({
			where: {
				groupId: groupIdToAdd,
				userId: coachId,
			},
		});
		if (exist !== null) {
			return Response.json(
				{ error: "Trener już ma przypisaną tą grupe" },
				{ status: 400 }
			);
		} else {
			const newGroup = await prisma.groupcoach.create({
				data: {
					groupId: groupIdToAdd,
					userId: coachId,
				},
			});
			if (!newGroup) {
				return Response.json(
					{ error: "Nie udało się dodać grupy" },
					{ status: 400 }
				);
			}
			const deleteGroup = await prisma.groupcoach.deleteMany({
				where: {
					userId: coachId,
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
					terms: { include: { location: { select: { name: true } } } },
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
