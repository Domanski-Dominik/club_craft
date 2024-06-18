import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { isWithinInterval, subDays, format, subMonths, parse } from "date-fns";

const batchSize = 10;
const updateParticipantStatus = async (participant: any) => {
	const participantId = participant.id;

	const recentAttendances = participant.attendance.filter((a: any) => {
		// Parsuj datę z formatu dd-mm-yyyy do obiektu Date
		const attendanceDate = parse(a.date, "dd-MM-yyyy", new Date());

		// Sprawdź, czy obecność jest w ostatnich 31 dniach
		return isWithinInterval(attendanceDate, {
			start: subDays(new Date(), 31),
			end: new Date(),
		});
	});

	const hasPaymentForPreviousMonth = participant.payments.some(
		(paymentParticipant: any) => {
			const previousMonth = subMonths(new Date(), 1);
			return (
				format(previousMonth, "MM-yyyy") === paymentParticipant.payment.month ||
				format(new Date(), "MM-yyyy") === paymentParticipant.payment.month
			);
		}
	);
	/*console.log(
		participant.lastName,
		recentAttendances,
		hasPaymentForPreviousMonth
	);*/
	await prisma.participant.update({
		where: { id: participantId },
		data: {
			active: recentAttendances.length > 0 || hasPaymentForPreviousMonth,
		},
	});
};
export const POST = async (req: NextRequest, res: NextResponse) => {
	try {
		console.log("Rozpoczynam Crone Job");
		const allParticipants = await prisma.participant.findMany({
			include: {
				attendance: true,
				payments: {
					include: {
						payment: {
							select: {
								id: true,
								amount: true,
								description: true,
								paymentDate: true,
								paymentMethod: true,
								month: true,
							},
						},
					},
				},
			},
		});
		for (let i = 0; i < allParticipants.length; i += batchSize) {
			const batch = allParticipants.slice(i, i + batchSize);
			await Promise.all(batch.map(updateParticipantStatus));
		}
		console.log("Skończyłem Crone Job");
		return new NextResponse("Udało Się!", { status: 200 });
	} catch (error) {
		console.error(error);
		return new NextResponse("Nie udało się", { status: 500 });
	}
};
