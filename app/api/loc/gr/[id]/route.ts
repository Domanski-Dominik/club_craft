import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		id: string;
	};
}
export const GET = async ({ params }: Props) => {
	console.log("Wszedłem do funkcji", params);
	const locationId = params.id;
	const locationIdNum = parseInt(locationId, 10);
	//console.log("Id lokalizacji to "+ locationIdNum);
	try {
		const schedules = await prisma.locationSchedule.findMany({
			where: {
				locationId: locationIdNum,
			},
			include: {
				group: true,
			},
		});
		//console.log(schedules)

		if (!schedules) {
			return new Response("Dana lokalizacja nie ma jeszcze grup", {
				status: 200,
			});
		}
		const groups = schedules.map((schedule) => {
			return {
				id: schedule.group.id,
				name: schedule.group.name,
				dayOfWeek: schedule.group.dayOfWeek,
				timeS: schedule.group.timeS,
				timeE: schedule.group.timeE,
			};
		});
		//console.log(groups)
		return new Response(JSON.stringify(groups), { status: 200 });
	} catch (error) {
		console.error("Błąd podczas pobierania relacji: ", error);
	}
};
