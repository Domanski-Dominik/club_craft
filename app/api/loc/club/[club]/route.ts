import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		club: string;
	};
}

export const GET = async (req: Request, { params }: Props) => {
	const club = params.club;
	console.log("To jest nazwa klubu: ", club);
	try {
		let Loc = await prisma.locations.findMany({
			where: { club: club },
		});
		//console.log(Loc);
		return new Response(JSON.stringify(Loc), { status: 200 });
	} catch (error) {
		console.error("Błąd podczas pobierania lokalizacji:", error);
		return new Response("Nie znaleziono lokalizacji", { status: 500 });
	}
};
