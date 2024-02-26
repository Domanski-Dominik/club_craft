import { prisma } from "@/prisma/prisma";

interface Props {
  params: {
    info: [string, string, string];
  };
}

export const GET = async (req: Request, { params }: Props) => {
  const role = params.info[0];
  const club = params.info[1];
  const coachId = params.info[2];
  try {
    if (role === "owner") {
      let loc = await prisma.locations.findMany({
        where: { club: club },
      });
      if (!loc) loc = [];
      let groups = await prisma.group.findMany({
        where: { club: club },
      });
      if (!groups) groups = [];
      let participants = await prisma.participant.findMany({
        where: { club: club },
      });
      if (!participants) participants = [];
      let coaches = await prisma.user.findMany({ where: { club: club } });
      if (!coaches) coaches = [];
      //console.log(Loc);
      return new Response(
        JSON.stringify({ loc, groups, participants, coaches, role }),
        { status: 200 }
      );
    }
    if (role === "coach") {
      const info = await prisma.groupcoach.findMany({
        where: { userId: coachId },
        include: {
          group: {
            include: {
              locationschedule: {
                include: { locations: true },
              },
              participantgroup: {
                include: { participant: true },
              },
            },
          },
        },
      });
      const uniqueLocations = new Map<number, any>(); // Mapa, gdzie klucz to id lokalizacji
      const uniqueGroups = new Map<number, any>(); // Mapa, gdzie klucz to id grupy
      const uniqueParticipants = new Map<number, any>(); // Mapa, gdzie klucz to id uczestnika

      info.forEach((item) => {
        const { group } = item;
        if (group) {
          // Dodaj lokalizację do mapy unikalnych lokalizacji
          const locationId = group.locationschedule?.[0]?.locations?.id;
          if (locationId && !uniqueLocations.has(locationId)) {
            uniqueLocations.set(
              locationId,
              group.locationschedule?.[0]?.locations
            );
          }

          // Dodaj grupę do mapy unikalnych grup
          const groupId = group.id;
          if (groupId && !uniqueGroups.has(groupId)) {
            uniqueGroups.set(groupId, group);
          }

          // Dodaj uczestników do mapy unikalnych uczestników
          const participants = group.participantgroup?.map(
            (participantGroup) => participantGroup.participant
          );
          if (participants) {
            participants.forEach((participant) => {
              const participantId = participant.id;
              if (participantId && !uniqueParticipants.has(participantId)) {
                uniqueParticipants.set(participantId, participant);
              }
            });
          }
        }
      });

      // Teraz masz trzy oddzielne mapy unikalnych obiektów
      const loc = Array.from(uniqueLocations.values());
      const groups = Array.from(uniqueGroups.values());
      const participants = Array.from(uniqueParticipants.values());
      return new Response(
        JSON.stringify({ loc, groups, participants, coaches: [], role }),
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Błąd podczas pobierania danych:", error);
    return Response.json({ message: "Nie znaleziono danych" }, { status: 500 });
  }
};
