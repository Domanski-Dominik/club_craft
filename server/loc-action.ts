"use server";
import { prisma } from "@/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export const addLoc = async (info: any) => {
	const session = await auth();
	if (session) {
		try {
			if (!info.name) return { error: "Brak nazwy lokalizacji" };

			const newLoc = await prisma.locations.create({
				data: {
					name: info.name,
					street: info.street,
					streetNr: info.streetNr,
					city: info.city,
					postalCode: info.postalCode,
					club: session.user.club,
				},
			});
			if (!newLoc) return { error: "Nie udało się zapisać lokalizacji" };
			return newLoc;
		} catch (error) {
			console.error("Błąd podczas zapisywania lokalizacji:", error);
			return { error: "Błąd podczas zapisywania lokalizacji:" };
		} finally {
			revalidateTag("locs");
			revalidateTag("locsWithGroups");
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const updateLoc = async (info: any) => {
	const session = await auth();
	if (session) {
		try {
			const findLoc = await prisma.locations.findUnique({
				where: { id: info.id },
			});
			if (!findLoc) return { error: "Podana lokalizacja nie istnieje" };

			if (
				findLoc.name === info.name &&
				findLoc.city === info.city &&
				findLoc.street === info.street &&
				findLoc.streetNr === info.streetNr &&
				findLoc.postalCode === info.postalCode
			) {
				return { error: "Dane lokalizacji są identyczne" };
			}

			const updateLoc = await prisma.locations.update({
				where: { id: info.id },
				data: {
					name: info.name,
					city: info.city,
					postalCode: info.postalCode,
					street: info.street,
					streetNr: info.streetNr,
				},
			});
			if (!updateLoc)
				return { error: "Nie udało się zaktualiozwać lokalizacji" };
			return updateLoc;
		} catch (error) {
			console.error("Błąd podczas zapisywania lokalizacji:", error);
			return { error: "Błąd podczas zapisywania lokalizacji:" };
		} finally {
			revalidateTag("locs");
			revalidateTag("locsWithGroups");
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const deleteLoc = async (id: number) => {
	const session = await auth();
	if (session) {
		try {
			const findLoc = await prisma.locations.findFirst({
				where: { id: id },
				include: { locationschedule: true },
			});
			if (!findLoc)
				return { error: "Nie udało się znaleźć lokalizacji w bazie danych" };

			const deleteSchedule = await prisma.locationschedule.deleteMany({
				where: { locationId: id },
			});
			if (!deleteSchedule)
				return { error: "Nie udało się usunąć relacji z grupami" };

			const deleteTerms = await prisma.term.deleteMany({
				where: { locationId: id },
			});
			if (!deleteTerms) return { error: "Nie udało się usunąć terminów" };

			const deleteLoc = await prisma.locations.delete({
				where: { id: id },
			});
			if (!deleteLoc) return { error: "Nie udało się usunąć lokalizacji" };

			return deleteLoc;
		} catch (error) {
			console.error("Błąd podczas usuwania lokalizacji:", error);
			return { error: "Błąd podczas usuwania lokalizacji:" };
		} finally {
			revalidateTag("locs");
			revalidateTag("locsWithGroups");
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const getSpecificLoc = async (id: number) => {
	const session = await auth();
	if (session) {
		try {
			let Loc = await prisma.locations.findUnique({
				where: { id: id },
			});
			return Loc;
		} catch (error) {
			console.error("Błąd podczas pobierania lokalizacji:", error);
			return { error: "Nie znaleziono lokalizacji" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
