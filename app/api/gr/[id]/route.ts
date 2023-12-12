import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		id: string;
	};
}
export const GET = async (req: Request, { params }: Props) => {
	console.log("Wszedłem do funkcji", params);
	const groupId = params.id;
	const groupIdNum = parseInt(groupId, 10);
	console.log("Id Groupy to " + groupIdNum);

	try {
		const schedule = await prisma.locationSchedule.findFirst({
			where: {
				groupId: groupIdNum,
			},
			include: {
				location: true,
				group: true,
			},
		});
		//console.log(schedule);

		if (!schedule) {
			return new Response("Podana grupa nie istnieje", {
				status: 200,
			});
		}
		const group = {
			id: schedule.groupId,
			name: schedule.group.name,
			dayOfWeek: schedule.group.dayOfWeek,
			timeS: schedule.group.timeS,
			timeE: schedule.group.timeE,
			locationName: schedule.location.name,
			locationId: schedule.locationId,
			club: schedule.group.club,
		};
		//console.log(group);
		return new Response(JSON.stringify(group), { status: 200 });
	} catch (error) {
		console.error("Błąd podczas pobierania relacji: ", error);
	}
};
