import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
	try {
		let allLocs = await prisma.locations.findMany();
		//console.log(allLocs)
		return new Response(JSON.stringify(allLocs), { status: 200 });
	} catch (error) {
		console.error("Błąd podczas pobierania lokalizacji:", error);
		return new Response("Nie znaleziono lokalizacji", { status: 500 });
	}
};

export const POST = async (req: Request) => {
	try {
		const { name, street, streetNr, city, postalCode, club } = await req.json();
		//console.log("Route ts: " + name, street, streetNr, city, postalCode, club);

		const newLoc = await prisma.locations.create({
			data: {
				name: name,
				street: street,
				streetNr: streetNr,
				city: city,
				postalCode: postalCode,
				club: club,
			},
		});
		if (!newLoc)
			return NextResponse.json(
				{ error: "Nie udało się zapisać lokalizacji" },
				{ status: 400 }
			);
		return new Response(JSON.stringify(newLoc), { status: 201 });
	} catch (error) {
		console.error("Błąd podczas zapisywania lokalizacji:", error);
		return NextResponse.json(
			{ error: "Błąd podczas zapisywania lokalizacji:" },
			{ status: 500 }
		);
	}
};

export const PUT = async (req: Request) => {
	const loc = await req.json();
	//console.log(loc);
	try {
		const findLoc = await prisma.locations.findUnique({
			where: { id: loc.id },
		});
		if (!findLoc) {
			return NextResponse.json(
				{ error: "Podana lokalizacja nie istnieje" },
				{ status: 404 }
			);
		}
		if (
			findLoc.name === loc.name &&
			findLoc.city === loc.city &&
			findLoc.street === loc.street &&
			findLoc.streetNr === loc.streetNr &&
			findLoc.postalCode === loc.postalCode
		) {
			return NextResponse.json(
				{ error: "Dane lokalizacji są identyczne" },
				{ status: 304 }
			);
		}

		const updateLoc = await prisma.locations.update({
			where: { id: loc.id },
			data: {
				name: loc.name,
				city: loc.city,
				postalCode: loc.postalCode,
				street: loc.street,
				streetNr: loc.streetNr,
			},
		});
		if (!updateLoc) {
			return NextResponse.json(
				{ error: "Nie udało się zaktualiozwać lokalizacji" },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ message: "Udało  się poprawnie zaktualiozwać" },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Błąd podczas pobierania lokalizacji:", error);
		return NextResponse.json({ error: "Zmień dane" }, { status: 500 });
	}
};
export const DELETE = async (req: Request) => {
	const body = await req.json();
	const id = body.id;
	try {
		const findLoc = await prisma.locations.findFirst({
			where: { id: id },
			include: { locationschedule: true },
		});
		if (!findLoc) {
			return NextResponse.json(
				{ error: "Nie udało się znaleźć lokalizacji w bazie danych" },
				{ status: 404 }
			);
		}
		const groupIds = findLoc.locationschedule.map((gr) => gr.groupId);

		const deleteParticipants = await prisma.participantgroup.deleteMany({
			where: { groupId: { in: groupIds } },
		});
		if (!deleteParticipants) {
			return NextResponse.json(
				{ error: "Nie udało się usunąć relacji z uczestnikami" },
				{ status: 500 }
			);
		}
		const deleteSchedule = await prisma.locationschedule.deleteMany({
			where: { locationId: id },
		});
		if (!deleteSchedule) {
			return NextResponse.json(
				{ error: "Nie udało się usunąć relacji z grupami" },
				{ status: 500 }
			);
		}
		const deleteCoaches = await prisma.groupcoach.deleteMany({
			where: { groupId: { in: groupIds } },
		});
		if (!deleteCoaches) {
			return NextResponse.json(
				{ error: "Nie udało się usunąć relacji z trenerami" },
				{ status: 500 }
			);
		}
		const deleteGroups = await prisma.group.deleteMany({
			where: { id: { in: groupIds } },
		});
		if (!deleteGroups) {
			return NextResponse.json(
				{ error: "Nie udało się usunąć grup" },
				{ status: 500 }
			);
		}
		const deleteLoc = await prisma.locations.delete({
			where: { id: id },
		});
		if (!deleteLoc) {
			return NextResponse.json(
				{ error: "Nie udało się usunąć lokalizacji" },
				{ status: 500 }
			);
		}
		return NextResponse.json(
			{ message: "Udało się usunąć lokalizacje!" },
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{ error: "Nie udało się usunąć lokalizacji" },
			{ status: 500 }
		);
	}
};
