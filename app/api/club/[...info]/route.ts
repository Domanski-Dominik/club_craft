import { prisma } from "@/prisma/prisma";

interface Props {
	params: Promise<{
		info: [string, string, string];
	}>;
}

export const GET = async (req: Request, { params }: Props) => {
	const userId = (await params).info[0];
	try {
		const userInfo = await prisma.user.findUnique({
			where: {
				id: userId,
			},
			include: {
				clubconnect: {
					include: {
						club: { include: { clubconnect: { include: { user: true } } } },
					},
				},
			},
		});
		if (!userInfo) {
			return Response.json(
				{ error: "Nie znaleziono użytkownika w bazie danych" },
				{ status: 404 }
			);
		}
		if (userInfo.clubconnect && userInfo.clubconnect.length > 0) {
			const club = userInfo.clubconnect[0].club;
			const formatted = {
				...club,
				clubconnect: club.clubconnect.map((c) => c.user),
			};
			return new Response(JSON.stringify(formatted), { status: 200 });
		} else {
			console.error("Nie znaleziono połączenia z klubem");
			return Response.json(
				{ error: "Nie znaleziono połączenia użytkownika z klubem" },
				{ status: 404 }
			);
		}
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
export const PUT = async (req: Request, { params }: Props) => {
	const body = await req.json();
	const clubId = parseInt((await params).info[1], 10);
	console.log(body);
	const updateData: any = {};

	if ("optionGroup" in body) updateData.optionGroup = body.optionGroup;
	if ("optionOneTime" in body) updateData.optionOneTime = body.optionOneTime;
	if ("optionSolo" in body) updateData.optionSolo = body.optionSolo;
	if ("paymentCyclic" in body) updateData.paymentCyclic = body.paymentCyclic;
	if ("paymentGroup" in body)
		updateData.paymentGroup = parseInt(body.paymentGroup, 10);
	if ("paymentOneTime" in body)
		updateData.paymentOneTime = parseInt(body.paymentOneTime, 10);
	if ("paymentSolo" in body)
		updateData.paymentSolo = parseInt(body.paymentSolo, 10);
	if ("phoneNumber" in body) updateData.phoneNumber = body.phoneNumber;
	if ("replacment" in body) updateData.replacment = Boolean(body.replacment);
	if ("switchOneTime" in body)
		updateData.switchOneTime = Boolean(body.switchOneTime);
	if ("switchSolo" in body) updateData.switchSolo = Boolean(body.switchSolo);
	if ("workOut" in body) updateData.workOut = Boolean(body.workOut);
	if ("coachPayments" in body)
		updateData.coachPayments = Boolean(body.coachPayments);
	if ("coachEditPrt" in body)
		updateData.coachEditPrt = Boolean(body.coachEditPrt);
	if ("coachNewPrt" in body) updateData.coachNewPrt = Boolean(body.coachNewPrt);

	try {
		const exist = await prisma.club.findUnique({
			where: { id: clubId },
		});
		if (!exist)
			return Response.json({ error: "Nie znaleziono klubu" }, { status: 404 });

		const update = await prisma.club.update({
			where: {
				id: clubId,
			},
			data: updateData,
		});
		if (!update)
			return Response.json(
				{ error: "Nie udało się zaktualizować klubu" },
				{ status: 404 }
			);
		return Response.json(
			{ message: "Udało się zaktualizować klub" },
			{ status: 200 }
		);
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.status });
	}
};
