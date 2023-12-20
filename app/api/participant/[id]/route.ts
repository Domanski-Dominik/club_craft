import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		id: string;
	};
}
export const GET = async (req: Request, { params }: Props) => {
	//console.log("Wszedłem do funkcji", params);
	const groupId = params.id;
	const groupIdNum = parseInt(groupId, 10);
	//console.log("Id Groupy to ", groupIdNum);
	try {
		const schedule = await prisma.participantgroup.findMany({
			where: {
				groupId: groupIdNum,
			},
			include: {
				participant: true,
			},
		});
		if (!schedule) {
			return Response.json(
				{ error: "Podana grupa nie istnieje" },
				{
					status: 404,
				}
			);
		}
		const participants = schedule.map((object) => object.participant);
		if (participants.length > 0) {
			return Response.json(participants);
		} else {
			return Response.json(
				{ error: "Podana grupa nie ma jeszcze uczestników" },
				{
					status: 404,
				}
			);
		}
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
export const PUT = async (req: Request, { params }: Props) => {
	const prtUpdate = await req.json();
	//console.log(prtUpdate);
	try {
		const update = await prisma.participant.update({
			where: { id: prtUpdate.id },
			data: {
				firstName: prtUpdate.firstName,
				lastName: prtUpdate.lastName,
				phoneNumber: prtUpdate.phoneNumber,
			},
		});
		if (!update) {
			return Response.json(
				{ error: "Nie udało się zaktualizować uczestnika" },
				{
					status: 400,
				}
			);
		}
		//console.log(update);
		return Response.json(
			{ message: "Udało się zaktualizować uczestnika" },
			{ status: 200 }
		);
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
export const DELETE = async (req: Request) => {
	const prtDel = await req.json();
	console.log("Id uczestnika to ", prtDel.id);
	try {
		if (prtDel.id !== null && prtDel.id !== undefined) {
			const deleteSchedule = await prisma.participantgroup.deleteMany({
				where: { participant: { id: prtDel.id } },
			});

			if (!deleteSchedule) {
				return Response.json(
					{ error: "Nie udało się usunąć relacji uczestnika z grupą" },
					{
						status: 404,
					}
				);
			}

			const deletePrt = await prisma.participant.delete({
				where: { id: prtDel.id },
			});

			if (!deletePrt) {
				return Response.json(
					{ error: "Nie udało się usunąć uczestnika" },
					{ status: 500 }
				);
			}
			return Response.json(
				{ message: "Udało się usunąć uczestnika" },
				{ status: 200 }
			);
		} else {
			return Response.json(
				{ error: "Błąd podczas usuwania uczestnika, nie posiada Id" },
				{
					status: 500,
				}
			);
		}
	} catch (error: any) {
		console.error("Błąd podczas usuwania uczestnika:", error);
		return Response.json({ error: error }, { status: 500 });
	}
};
