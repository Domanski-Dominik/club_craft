import { prisma } from "@/prisma/prisma";
import type { Group } from "@/types/type";

interface Props {
  params: {
    ids: [string, string, string, string, string];
  };
}

export async function GET(req: Request, { params }: Props) {
  //console.log("Wszedłem do funkcji", params);
  const locationId = params.ids[0];
  const locationIdNum = parseInt(locationId, 10);
  const type = params.ids[1];
  const role = params.ids[2];
  const coachId = params.ids[3];
  const day = params.ids[4];
  const dayNum = parseInt(day, 10);

  //console.log("To są id: ", locationId, locationIdNum);
  try {
    if (role === "owner" || role === "admin") {
      const schedule = await prisma.locationschedule.findMany({
        where: {
          locationId: locationIdNum,
        },
        include: {
          group: {
            include: {
              participantgroup: {
                include: {
                  participant: { select: { id: true } },
                },
              },
            },
          },
        },
      });
      if (!schedule) {
        return Response.json(
          { error: "Dana lokalizacja nie ma jeszcze grup" },
          {
            status: 200,
          }
        );
      }
      const groups = schedule.map((schedule) => {
        return {
          id: schedule.group.id,
          name: schedule.group.name,
          dayOfWeek: schedule.group.dayOfWeek,
          timeS: schedule.group.timeS,
          timeE: schedule.group.timeE,
          participants: schedule.group.participantgroup.length,
        };
      });
      if (type === "days") {
        const groupsByDay: { [dayOfWeek: number]: Group[] } = {};
        groups.forEach((group) => {
          const { dayOfWeek } = group;

          if (!groupsByDay[dayOfWeek]) {
            groupsByDay[dayOfWeek] = [];
          }
          groupsByDay[dayOfWeek].push(group);
        });
        //console.log(groupsByDay);
        return new Response(JSON.stringify(groupsByDay), { status: 201 });
      } else {
        const selectedGroups = groups.filter(
          (group) => group.dayOfWeek === dayNum
        );
        selectedGroups.sort((a, b) => {
          // Porównanie czasu w formacie HH:mm
          const timeA = a.timeS.split(":").map(Number);
          const timeB = b.timeS.split(":").map(Number);

          if (timeA[0] !== timeB[0]) {
            return timeA[0] - timeB[0]; // Sortowanie wg. godzin
          } else {
            return timeA[1] - timeB[1]; // Sortowanie wg. minut
          }
        });
        return new Response(JSON.stringify(selectedGroups), { status: 201 });
      }
    } else {
      const groupIds = await prisma.groupcoach.findMany({
        where: { userId: coachId },
      });
      const formattedGroupIds = groupIds.map((gr) => gr.groupId);
      const schedule = await prisma.locationschedule.findMany({
        where: {
          locationId: locationIdNum,
        },
        include: {
          group: {
            include: {
              participantgroup: {
                include: {
                  participant: { select: { id: true } },
                },
              },
            },
          },
        },
      });
      if (!schedule) {
        return Response.json(
          { error: "Dana lokalizacja nie ma jeszcze grup" },
          {
            status: 400,
          }
        );
      }
      const groups = schedule.map((schedule) => {
        return {
          id: schedule.group.id,
          name: schedule.group.name,
          dayOfWeek: schedule.group.dayOfWeek,
          timeS: schedule.group.timeS,
          timeE: schedule.group.timeE,
          participants: schedule.group.participantgroup.length,
        };
      });
      const filteredGroups = groups.filter((group) =>
        formattedGroupIds.includes(group.id)
      );
      if (type === "days") {
        const groupsByDay: { [dayOfWeek: number]: Group[] } = {};
        filteredGroups.forEach((group) => {
          const { dayOfWeek } = group;

          if (!groupsByDay[dayOfWeek]) {
            groupsByDay[dayOfWeek] = [];
          }
          groupsByDay[dayOfWeek].push(group);
        });
        return new Response(JSON.stringify(groupsByDay), { status: 201 });
      } else {
        const selectedGroups = filteredGroups.filter(
          (group) => group.dayOfWeek === dayNum
        );
        selectedGroups.sort((a, b) => {
          // Porównanie czasu w formacie HH:mm
          const timeA = a.timeS.split(":").map(Number);
          const timeB = b.timeS.split(":").map(Number);

          if (timeA[0] !== timeB[0]) {
            return timeA[0] - timeB[0]; // Sortowanie wg. godzin
          } else {
            return timeA[1] - timeB[1]; // Sortowanie wg. minut
          }
        });

        return new Response(JSON.stringify(selectedGroups), { status: 201 });
      }
    }
  } catch (error) {
    console.error("Błąd podczas pobierania nazw grup:", error);
    return new Response("Failed to find groups", { status: 500 });
  }
}
