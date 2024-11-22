import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	try {
		// Pobranie wszystkich grup z bazy danych
		const groups = await prisma.group.findMany({
			where: {
				club: "flipkids",
			},
			include: {
				terms: {
					include: {
						location: {
							select: { name: true },
						},
					},
				},
			},
		});
		const mappedGroups = groups.map((group) => {
			return {
				name: group.name,
				terms: group.terms,
				firstLesson: group.firstLesson,
				lastLesson: group.lastLesson,
				participantCount: group.participantCount,
				signInfo: group.signInfo,
				locations: group.terms.map((t) => t.location.name),
			};
		});
		// Zwrócenie grup w odpowiedzi JSON
		return NextResponse.json(mappedGroups);
	} catch (error: any) {
		// Obsługa błędów
		return NextResponse.json(
			{ error: error.message },
			{ status: 500 } // Kod 500 oznacza błąd serwera
		);
	}
}
