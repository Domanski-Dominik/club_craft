import { prisma } from "@/prisma/prisma";

interface Props {
  params: {
    club: string;
  };
}

export const GET = async (req: Request, { params }: Props) => {
  const club = params.club;
  //console.log("To jest club:", club);
  try {
    const locs = await prisma.locations.findMany({
      where: { club: club },
      include: {
        locationschedule: {
          select: {
            group: true,
          },
        },
      },
    });
    if (!locs)
      return Response.json(
        { error: "Nie znaleziono lokalizacji" },
        { status: 400 }
      );

    const formattedLoc = locs.map((loc) => {
      const groups = loc.locationschedule.map((gr) => gr.group);
      return {
        ...loc,
        locationschedule: groups,
      };
    });
    //console.log(Loc);
    return new Response(JSON.stringify(formattedLoc), { status: 200 });
  } catch (error) {
    console.error("Błąd podczas pobierania lokalizacji i grup:", error);
    return new Response("Nie znaleziono żadnych lokalizacji", { status: 500 });
  }
};
