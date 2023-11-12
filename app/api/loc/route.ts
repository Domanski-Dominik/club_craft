import { prisma } from "@/prisma/prisma";

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
		const { name, addres } = await req.json();
		console.log("Route js: " + name, addres);

		const newLoc = await prisma.locations.create({
			data: {
				name: name,
				addres: addres,
			},
		});

		return new Response(JSON.stringify(newLoc), { status: 201 });
	} catch (error) {
		console.error("Błąd podczas zapisywania lokalizacji:", error);
		return new Response("Błąd podczas zapisywania lokalizacji:", {
			status: 500,
		});
	}
};
