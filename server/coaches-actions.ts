"use server";
import { prisma } from "@/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export const addCoachGroup = async (info: any) => {
	const session = await auth();
	if (session) {
		const { groupId, coachId } = info;
		console.log(groupId, coachId);
		try {
			const exist = await prisma.groupcoach.findFirst({
				where: {
					groupId: groupId,
					userId: coachId,
				},
			});
			//console.log(exist);
			if (exist !== null)
				return { error: "Trener jest już przypisany do tej grupy" };

			const newGroup = await prisma.groupcoach.create({
				data: {
					groupId: groupId,
					userId: coachId,
				},
			});
			if (!newGroup) return { error: "Nie udało się przypisać grupy" };

			const addedGroup = await prisma.group.findUnique({
				where: { id: newGroup.groupId },
				include: {
					locationschedule: {
						include: {
							locations: {
								select: {
									name: true,
								},
							},
						},
					},
					terms: { include: { location: { select: { name: true } } } },
					breaks: true,
				},
			});
			if (!addedGroup)
				return { error: "Nie udało się uzyskać informacji o dodanej grupie" };
			//console.log(formatGroup);
			revalidateTag("coaches");
			return addedGroup;
		} catch (error) {
			console.error("Błąd podczas dodawania grup do trenera:", error);
			return { error: "Błąd podczas dodawania grup do trenera" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const deleteCoachGroup = async (info: any) => {
	const session = await auth();
	if (session) {
		const { groupId, coachId } = info;
		//console.log(groupId, coachId);
		try {
			const deleteGroup = await prisma.groupcoach.deleteMany({
				where: {
					userId: coachId,
					groupId: groupId,
				},
			});
			if (!deleteGroup) return { error: "Nie udało się usunąć grupy" };
			revalidateTag("coaches");
			return deleteGroup;
		} catch (error) {
			console.error("Błąd podczas usuwania grup trenera:", error);
			return { error: "Błąd podczas usuwania grup trenera" };
		}
	} else {
		return { error: "Musisz być zalogowany!" };
	}
};
export const updateCoachGroup = async (info: any) => {
	const session = await auth();
	if (session) {
		const { groupIdToAdd, coachId, groupIdToRemove } = info;
		//console.log(groupIdToAdd, coachId, groupIdToRemove);
		try {
			const exist = await prisma.groupcoach.findFirst({
				where: {
					groupId: groupIdToAdd,
					userId: coachId,
				},
			});
			if (exist !== null) return { error: "Trener już ma przypisaną tą grupe" };

			const newGroup = await prisma.groupcoach.create({
				data: {
					groupId: groupIdToAdd,
					userId: coachId,
				},
			});
			if (!newGroup) return { error: "Nie udało się dodać grupy" };

			const deleteGroup = await prisma.groupcoach.deleteMany({
				where: {
					userId: coachId,
					groupId: groupIdToRemove,
				},
			});
			if (!deleteGroup) return { error: "Nie udało się usunąć grupy" };

			const addedGroup = await prisma.group.findUnique({
				where: { id: newGroup.groupId },
				include: {
					locationschedule: {
						include: {
							locations: {
								select: {
									name: true,
								},
							},
						},
					},
					terms: { include: { location: { select: { name: true } } } },
					breaks: true,
				},
			});
			if (!addedGroup)
				return { error: "Nie udało się uzyskać informacji o dodanej grupie" };
			revalidateTag("coaches");
			//console.log(formatGroup);
			return addedGroup;
		} catch (error) {
			console.error("Błąd podczas usuwania grup trenera:", error);
			return { error: "Błąd podczas usuwania grup trenera" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const changeRole = async (info: any) => {
	const session = await auth();
	if (session && session.user.role === "owner") {
		const { userId, role } = info;
		console.log(userId, role);
		try {
			const changeRole = await prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					role: role,
				},
			});
			if (!changeRole) return { error: "Nie udało się zmienić uprawnień" };
			revalidateTag("coaches");
			return changeRole;
		} catch (error) {
			console.error("Błąd podczas zmiany ról prowadzącego:", error);
			return { error: "Błąd podczas zmiany ról prowadzącego" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
