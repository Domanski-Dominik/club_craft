const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function migrateTerms() {
	const groups = await prisma.group.findMany({
		include: {
			locationschedule: true, // Uwzględniamy powiązane wpisy w locationschedule
		},
	});

	for (const group of groups) {
		// Sprawdzamy, czy grupa ma przypisany jakiś wpis w `locationschedule`
		if (group.locationschedule.length > 0) {
			for (const schedule of group.locationschedule) {
				await prisma.term.create({
					data: {
						dayOfWeek: group.dayOfWeek!,
						timeS: group.timeS!,
						timeE: group.timeE!,
						effectiveDate: new Date("2024-09-01"),
						group: {
							connect: { id: group.id },
						},
						location: {
							connect: { id: schedule.locationId }, // Pobieramy locationId z locationschedule
						},
					},
				});
			}
		} else {
			console.log(
				`Group with ID ${group.id} does not have a linked location. Skipping...`
			);
		}
	}

	console.log("Migration completed.");
}

migrateTerms()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
