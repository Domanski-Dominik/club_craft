import { prisma } from "@/prisma/prisma";

interface Props {
	params: {
		id: string;
	};
}
export const PUT = async (req: Request, { params }: Props) => {
	const body = await req.json();
	const { amount, description, paymentDate, paymentMethod, selectedMonth } =
		body.form;
	const participantId = parseInt(params.id, 10);
	/*console.log(
		" participant: ",
		participantId,
		amount,
		description,
		paymentDate,
		paymentMethod,
		selectedMonth
	);*/
	try {
		const existingPayment = await prisma.payment.findFirst({
			where: {
				participants: {
					some: { participantId: participantId },
				},
				month: selectedMonth,
			},
		});
		if (existingPayment) {
			const updatedPayment = await prisma.payment.update({
				where: {
					id: existingPayment.id,
				},
				data: {
					amount: parseInt(amount, 10) || existingPayment.amount,
					description: description || existingPayment.description,
					paymentDate: paymentDate || existingPayment.paymentDate,
					paymentMethod: paymentMethod || existingPayment.paymentMethod,
				},
			});
			if (updatedPayment) {
				return Response.json(
					{ message: "Płatność zaktualizowana" },
					{ status: 200 }
				);
			} else {
				return Response.json(
					{ error: "Nie udało się zaktualizować płatności" },
					{ status: 400 }
				);
			}
		} else if (!existingPayment) {
			const newPayment = await prisma.payment.create({
				data: {
					amount: parseInt(amount, 10),
					month: selectedMonth,
					description: description,
					paymentDate: paymentDate,
					paymentMethod: paymentMethod,
				},
			});
			await prisma.payment_participant.create({
				data: {
					paymentId: newPayment.id,
					participantId: participantId,
				},
			});
			return Response.json({ message: "Dodano płatność" }, { status: 200 });
		} else {
			return Response.json(
				{ error: "Błąd w logice systemu przy dodawaniu płatności" },
				{ status: 400 }
			);
		}
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: error.code });
	}
};
