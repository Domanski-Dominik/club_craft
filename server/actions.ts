"use server";
import { prisma } from "@/prisma/prisma";
export const ImportP = async () => {
	const participants = require(`@/ImportP.json`);
	console.log(participants);
	const participantsDB = await Promise.all(
		participants.map(async (participant: any) => {
			// Usunięcie whitespace z pól stringowych
			const trimmedFirstName = participant.firstName.trim();
			const trimmedLastName = participant.lastName.trim();
			const trimmedPhoneNumber = participant.phoneNumber.trim();
			const trimmedClub = participant.club.trim();
			const trimmedEmail = participant.email.trim();

			// Tworzenie uczestnika w bazie danych
			await prisma.participant.create({
				data: {
					firstName: trimmedFirstName,
					lastName: trimmedLastName,
					phoneNumber: trimmedPhoneNumber,
					club: trimmedClub,
					birthday: participant.birthday,
					parentFirstName: participant.parentFirstName,
					parentLastName: participant.parentLastName,
					email: trimmedEmail,
					contactWithParent: participant.contactWithParent,
					// Dodaj więcej pól, jeśli twoje dane zawierają więcej informacji
				},
			});
		})
	);
	if (!participantsDB) {
		console.log(participantsDB);
		return participantsDB;
	}
	console.log("sukces");
	return participantsDB;
};
export const DeleteInactiveP = async (club: string) => {
	const participants = await prisma.participant.findMany({
		where: {
			club: club,
			active: false,
		},
		include: {
			participantgroup: true,
			attendance: true,
			payments: true,
		},
	});

	// Iteruj przez uczestników i usuwaj związane dane, a potem uczestnika
	for (const participant of participants) {
		// Sprawdź, czy uczestnik nie ma relacji z participantgroup
		if (participant.participantgroup.length === 0) {
			// Usuń powiązane obecności
			await prisma.attendance.deleteMany({
				where: {
					participantId: participant.id,
				},
			});

			// Usuń powiązane płatności (relacje payment_participant)
			await prisma.payment_participant.deleteMany({
				where: {
					participantId: participant.id,
				},
			});

			// Po usunięciu powiązanych danych, usuń uczestnika
			await prisma.participant.delete({
				where: {
					id: participant.id,
				},
			});

			console.log(
				`Uczestnik o id ${participant.id} został usunięty razem z powiązanymi danymi.`
			);
		}
	}
};
export const UpdateRegulaminForClub = async (club: string) => {
	// Zaktualizuj wszystkich uczestników danego klubu i ustaw regulamin na false
	const updatedParticipants = await prisma.participant.updateMany({
		where: {
			club: club,
		},
		data: {
			regulamin: false,
		},
	});

	console.log(
		`${updatedParticipants.count} uczestników z klubu ${club} miało zaktualizowany regulamin na false.`
	);
};
