import { prisma } from "@/prisma/prisma";

export const POST = async (req: Request) => {
  const {
    name,
    color,
    prtCount,
    locId,
    signInfo,
    firstLesson,
    lastLesson,
    diffrentPlaces,
    breaks,
    terms,
    price,
    payOption,
    clientsPay,
    xClasses,
    type,
    club,
  } = await req.json();
  console.log(
    name,
    color,
    prtCount,
    locId,
    signInfo,
    firstLesson,
    lastLesson,
    diffrentPlaces,
    breaks,
    terms,
    price,
    payOption,
    clientsPay,
    xClasses,
    type,
    club
  );
  if (!name || !locId || !firstLesson || !lastLesson || club === "") {
    return Response.json({ error: "Brak wymaganych danych" }, { status: 400 });
  }
  try {
    const findLoc = await prisma.locations.findUnique({
      where: { id: locId },
    });

    if (!findLoc) {
      return Response.json(
        { error: "Nie znaleziono lokalizacji" },
        { status: 404 }
      );
    }

    const newGroup = await prisma.group.create({
      data: {
        name: name,
        price: Number(price),
        firstLesson: firstLesson,
        lastLesson: lastLesson,
        signInfo: String(signInfo),
        participantCount: Number(prtCount),
        club: club,
        color: color,
        payOption: payOption,
        clientsPay: clientsPay,
        type: type,
        xClass: xClasses,
      },
    });
    if (!newGroup) {
      return Response.json(
        { error: "Nie udało się utworzyć grupy" },
        { status: 500 }
      );
    }

    const newSchedule = await prisma.locationschedule.create({
      data: {
        locations: {
          connect: { id: locId },
        },
        group: {
          connect: { id: newGroup.id },
        },
      },
    });
    if (!newSchedule) {
      return Response.json(
        { error: "Nie udało się dodać harmonogramu do lokalizacji" },
        { status: 500 }
      );
    }
    const newTerms = await prisma.term.createMany({
      data: terms.map((term: any) => ({
        dayOfWeek: term.dayOfWeek,
        locationId:
          typeof term.locId === "number" ? term.locId : parseInt(term.locId),
        timeS: term.timeS,
        timeE: term.timeE,
        effectiveDate: new Date(), // Załóżmy, że wszystkie terminy zaczynają obowiązywać od teraz
        groupId: newGroup.id, // Podaj właściwy ID grupy
      })),
      skipDuplicates: true, // opcjonalne, pomija duplikaty
    });
    if (!newTerms) {
      return Response.json(
        { error: "Nie udało się zapisać terminów" },
        { status: 500 }
      );
    }
    if (breaks.length > 0) {
      const newBreaks = await prisma.break.createMany({
        data: breaks.map((b: any) => ({
          name: b.name,
          begin: b.begin,
          end: b.end,
          groupId: newGroup.id,
        })),
        skipDuplicates: true,
      });
      if (!newBreaks) {
        return Response.json(
          { error: "Nie udało się zapisać przerw" },
          { status: 500 }
        );
      }
    }
    return new Response(JSON.stringify(newGroup), { status: 200 });
  } catch (error: any) {
    console.error("Błąd przy komunikacji z bazą danych:  ", error);
    return Response.json(
      { error: "Wystąpił błąd przy komunikacji z bazą danych" },
      { status: error.status }
    );
  }
};
export const DELETE = async (req: Request) => {
  const { id } = await req.json();
  //console.log("Id grupy to " + id);
  try {
    if (id !== null && id !== undefined) {
      const deleteSchedule = await prisma.locationschedule.deleteMany({
        where: { group: { id: id } },
      });
      if (!deleteSchedule)
        return Response.json(
          { error: "Nie udało się usunąć relacji z lokalizacją" },
          { status: 404 }
        );

      const deleteParticipants = await prisma.participantgroup.deleteMany({
        where: { groupId: id },
      });
      if (!deleteParticipants)
        return Response.json(
          { error: "Nie udało się usunąć relacji z uczestnikami" },
          { status: 404 }
        );

      const deleteAttendance = await prisma.attendance.deleteMany({
        where: { groupId: id },
      });
      if (!deleteAttendance)
        return Response.json(
          { error: "Nie udało się usunąć obecności" },
          { status: 500 }
        );

      const deleteCoach = await prisma.groupcoach.deleteMany({
        where: { groupId: id },
      });
      if (!deleteCoach)
        return Response.json(
          { error: "Nie udało się usunąć trenerów" },
          { status: 500 }
        );

      const deleteTerms = await prisma.term.deleteMany({
        where: { groupId: id },
      });
      if (!deleteTerms)
        return Response.json(
          { error: "Nie udało się usunąć terminów" },
          { status: 500 }
        );
      const deleteBreaks = await prisma.break.deleteMany({
        where: { groupId: id },
      });
      if (!deleteBreaks)
        return Response.json(
          { error: "Nie udało się usunąć przerw" },
          { status: 500 }
        );
      const deleteGroup = await prisma.group.deleteMany({
        where: { id: id },
      });

      if (!deleteGroup) {
        return Response.json(
          { error: "Nie udało się usunąć grupy" },
          { status: 500 }
        );
      }

      return new Response(JSON.stringify(deleteGroup), { status: 200 });
    } else {
      return Response.json(
        { error: "Błąd podczas usuwania grupy id undefined lub null" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Błąd podczas usuwania grupy:", error);
    return Response.json(
      { error: "Błąd podczas usuwania grupy" },
      { status: error.status }
    );
  }
};

export const PUT = async (req: Request) => {
  const {
    name,
    dayOfWeek,
    timeS,
    timeE,
    id,
    color,
    price,
    locationschedule,
    locations,
  } = await req.json();
  //console.log("Wszedłem w edytowanie");
  //console.log(id, name, dayOfWeek, timeS, timeE, locationId);
  if (!name || !timeS || !timeE) {
    return Response.json({ error: "Brak wymaganych danych" }, { status: 400 });
  }
  try {
    // Sprawdzenie, czy grupa istnieje
    const existingGroup = await prisma.group.findUnique({
      where: { id: id },
      include: {
        locationschedule: {
          include: { locations: true },
        },
      },
    });

    if (!existingGroup) {
      return Response.json({ error: "Grupa nie istnieje" }, { status: 404 });
    }
    if (
      !existingGroup.locationschedule.some(
        (l: any) => l.locations.name === locationschedule
      )
    ) {
      const scheduleId = existingGroup.locationschedule.find(
        (l) => l.id !== undefined
      )?.id;
      if (scheduleId !== undefined) {
        const loc = locations.find((l: any) => l.name === locationschedule);
        if (loc) {
          const updatedSchedule = await prisma.locationschedule.update({
            where: { id: scheduleId },
            data: {
              groupId: existingGroup.id,
              locationId: loc.id,
            },
          });
          if (!updatedSchedule) {
            return Response.json(
              { error: "Wystąpił błąd podczas przepisywania grupy" },
              { status: 400 }
            );
          }
        }
        /**/
      }
    }
    // Aktualizacja danych grupy
    const updatedGroup = await prisma.group.update({
      where: { id: id },
      data: {
        name: name !== undefined ? String(name) : existingGroup.name,
        dayOfWeek:
          dayOfWeek !== undefined ? Number(dayOfWeek) : existingGroup.dayOfWeek,
        timeS: timeS !== undefined ? String(timeS) : existingGroup.timeS,
        timeE: timeE !== undefined ? String(timeE) : existingGroup.timeE,
        color: color !== undefined ? String(color) : existingGroup.color,
        price: price !== undefined ? price : existingGroup.price,
      },
    });

    // Odpowiedź po udanej aktualizacji
    return new Response(JSON.stringify(updatedGroup), { status: 200 });
  } catch (error: any) {
    console.error("Błąd podczas aktualizacji danych: ", error);
    return Response.json(
      { error: "Wystąpił błąd podczas aktualizacji danych" },
      { status: error.status }
    );
  }
};
