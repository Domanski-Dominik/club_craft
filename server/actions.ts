"use server";
import { prisma } from "@/prisma/prisma";
export const ImportP = async () => {
	const participants = require(`@/ImportP.json`);
	console.log(participants);
	const participantsDB = await Promise.all(
		participants.map(async (participant: any) => {
			await prisma.participant.create({
				data: {
					firstName: participant.firstName,
					lastName: participant.lastName,
					phoneNumber: participant.phoneNumber,
					club: "AkroSmyk",
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
