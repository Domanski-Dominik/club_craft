import { prisma } from "@/prisma/prisma";

interface Props {
	params: Promise<{
		id: string;
	}>;
}

export const GET = async (req: Request, { params }: Props) => {
	const locationId = (await params).id;
	const locationIdNum = parseInt(locationId, 10);
	//console.log("To są id: ", locationId, locationIdNum);
	try {
		let Loc = await prisma.locations.findUnique({
			where: { id: locationIdNum },
		});
		//console.log(Loc);
		return new Response(JSON.stringify(Loc), { status: 200 });
	} catch (error) {
		console.error("Błąd podczas pobierania lokalizacji:", error);
		return new Response("Nie znaleziono lokalizacji", { status: 500 });
	}
};
