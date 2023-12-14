import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		club: string;
	};
}

export const GET = async (req: Request, { params }: Props) => {
	const club = params.club;
	console.log("To jest club:", club);
	try {
		let Loc = await prisma.locations.findMany({
			where: { club: club },
			include: {
				locationschedule: {
					select: {
						group: true,
					},
				},
			},
		});
		//console.log(Loc);
		return new Response(JSON.stringify(Loc), { status: 200 });
	} catch (error) {
		console.error("Błąd podczas pobierania lokalizacji i grup:", error);
		return new Response("Nie znaleziono żadnych lokalizacji", { status: 500 });
	}
};
