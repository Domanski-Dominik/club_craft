import { prisma } from "@/prisma/prisma";
interface Props {
	params: Promise<{
		id: string;
	}>;
}
export const GET = async (req: Request, { params }: Props) => {
	//console.log("Wszedłem do funkcji", params);
	const userId = (await params).id;
	//console.log("Id Groupy to ", groupIdNum);
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});
		if (!user) {
			return Response.json(
				{ error: "Nie znaleziono użytkownika" },
				{
					status: 404,
				}
			);
		}
		return Response.json(user);
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
