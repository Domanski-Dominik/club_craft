"use server";
import { prisma } from "@/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export const updateClubInfo = async (info: any) => {
	const session = await auth();
	if (session) {
		//console.log(info);
		const updateData: any = {};

		if ("optionGroup" in info) updateData.optionGroup = info.optionGroup;
		if ("optionOneTime" in info) updateData.optionOneTime = info.optionOneTime;
		if ("optionSolo" in info) updateData.optionSolo = info.optionSolo;
		if ("paymentCyclic" in info) updateData.paymentCyclic = info.paymentCyclic;
		if ("paymentGroup" in info)
			updateData.paymentGroup = parseInt(info.paymentGroup, 10);
		if ("paymentOneTime" in info)
			updateData.paymentOneTime = parseInt(info.paymentOneTime, 10);
		if ("paymentSolo" in info)
			updateData.paymentSolo = parseInt(info.paymentSolo, 10);
		if ("phoneNumber" in info) updateData.phoneNumber = info.phoneNumber;
		if ("replacment" in info) updateData.replacment = Boolean(info.replacment);
		if ("switchOneTime" in info)
			updateData.switchOneTime = Boolean(info.switchOneTime);
		if ("switchSolo" in info) updateData.switchSolo = Boolean(info.switchSolo);
		if ("workOut" in info) updateData.workOut = Boolean(info.workOut);
		if ("coachPayments" in info)
			updateData.coachPayments = Boolean(info.coachPayments);
		if ("coachEditPrt" in info)
			updateData.coachEditPrt = Boolean(info.coachEditPrt);
		if ("coachNewPrt" in info)
			updateData.coachNewPrt = Boolean(info.coachNewPrt);
		if ("regulamin" in info) updateData.regulamin = info.regulamin;

		try {
			const exist = await prisma.club.findUnique({
				where: { id: info.clubId },
			});
			if (!exist) return { error: "Nie znaleziono klubu" };

			const update = await prisma.club.update({
				where: {
					id: info.clubId,
				},
				data: updateData,
			});
			if (!update) return { error: "Nie udało się zaktualizować klubu" };
			return { message: "Udało się zaktualizować klub" };
		} catch (error) {
			console.error("Błąd podczas aktualizacji klubu:", error);
			return { error: "Błąd podczas aktualizacji klubu" };
		} finally {
			revalidateTag("club");
		}
	} else {
		return { error: "Musisz być zalogowany!" };
	}
};
