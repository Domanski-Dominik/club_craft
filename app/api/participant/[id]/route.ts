import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		id: string;
	};
}
export const GET = async (req: Request, { params }: Props) => {
	console.log("Wszedłem do funkcji", params);
	const groupId = params.id;
	const groupIdNum = parseInt(groupId, 10);
	console.log("Id Groupy to ", groupIdNum);
	try {
	} catch (error) {
		console.error("Błąd podczas pobierania relacji participant group: ", error);
	}
};
