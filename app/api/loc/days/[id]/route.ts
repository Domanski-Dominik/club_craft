import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		id: string;
	};
}

export async function GET(req: Request, { params }: Props) {
	console.log("Wszedłem do funkcji", params);
	const locationId = params.id;
	const locationIdNum = parseInt(locationId, 10);
	console.log("To są id: ", locationId, locationIdNum);
	try {
		const schedule = await prisma.locationSchedule.findMany({
			where: {
				locationId: locationIdNum,
			},
			include: {
				group: true,
			},
		});
		if (!schedule) {
			return new Response("Dana lokalizacja nie ma jeszcze grup", {
				status: 200,
			});
		}
		const groups = schedule.map((schedule) => {
			return {
				id: schedule.group.id,
				name: schedule.group.name,
				dayOfWeek: schedule.group.dayOfWeek,
				timeS: schedule.group.timeS,
				timeE: schedule.group.timeE,
			};
		});
		return new Response(JSON.stringify(groups), { status: 201 });
	} catch (error) {
		console.error("Błąd podczas pobierania nazw grup:", error);
		return new Response("Failed to find groups", { status: 500 });
	}
}
