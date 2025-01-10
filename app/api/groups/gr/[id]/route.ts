import { prisma } from "@/prisma/prisma";

interface Props {
	params: Promise<{
		id: string;
	}>;
}
export const GET = async (req: Request, { params }: Props) => {
	//console.log("Wszedłem do funkcji", params);
	const groupId = (await params).id;
	const groupIdNum = parseInt(groupId, 10);
	//console.log("Id Groupy to " + groupIdNum);

	try {
		const schedule = await prisma.locationschedule.findFirst({
			where: {
				groupId: groupIdNum,
			},
			include: {
				locations: true,
				group: {
					include: {
						terms: true,
						breaks: true,
						coaches: true,
					},
				},
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
			locationName: schedule.locations.name,
			locationId: schedule.locationId,
			club: schedule.group.club,
			prtCount: schedule.group.participantCount,
			signInfo: schedule.group.signInfo,
			firstLesson: schedule.group.firstLesson,
			lastLesson: schedule.group.lastLesson,
			breaks: schedule.group.breaks,
			terms: schedule.group.terms,
			price: schedule.group.price,
			payOption: schedule.group.payOption,
			clientsPay: schedule.group.clientsPay,
			xClasses: schedule.group.xClass,
			type: schedule.group.type,
			color: schedule.group.color,
			coachId:
				schedule.group.coaches.length > 0
					? schedule.group.coaches[0].userId
					: "",
		};
		//console.log(group);
		return new Response(JSON.stringify(group), { status: 200 });
	} catch (error) {
		console.error("Błąd podczas pobierania relacji: ", error);
	}
};
