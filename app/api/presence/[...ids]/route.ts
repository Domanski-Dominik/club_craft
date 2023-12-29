import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		ids: [string, string];
	};
}
export const PUT = async (req: Request, { params }: Props) => {
	const { date, isChecked } = await req.json();
	const groupId = parseInt(params.ids[0], 10);
	const participantId = parseInt(params.ids[1], 10);
	//console.log("group: ", groupId, " participant: ", participantId, date);
	try {
		const existingAttendance = await prisma.attendance.findFirst({
			where: {
				participantId,
				groupId,
				date: date,
			},
		});
		if (!existingAttendance) {
			if (isChecked) {
				await prisma.attendance.create({
					data: {
						date: date,
						groupId,
						participantId,
					},
				});
				return Response.json({ message: "Obecny" }, { status: 200 });
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
