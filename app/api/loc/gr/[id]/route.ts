import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		id: string;
	};
}
export const GET = async (req: Request, { params }: Props) => {
	//console.log("Wszedłem do funkcji", params);
	const locationId = params.id;
	const locationIdNum = parseInt(locationId, 10);
	//console.log("Id lokalizacji to "+ locationIdNum);
	try {
		const schedules = await prisma.locationschedule.findMany({
			where: {
				locationId: locationIdNum,
			},
			include: {
				group: true,
			},
		});
		//console.log(schedules);

		if (!schedules) {
			return Response.json(
				{ error: "Dana lokalizacja nie ma jeszcze grup" },
				{
					status: 404,
				}
			);
		}
		const groups = schedules.map((schedule) => {
			return {
				id: schedule.group.id,
				name: schedule.group.name,
				dayOfWeek: schedule.group.dayOfWeek,
				timeS: schedule.group.timeS,
				timeE: schedule.group.timeE,
				color: schedule.group.color,
			};
		});
		//console.log(groups)
		return new Response(JSON.stringify(groups), { status: 200 });
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
