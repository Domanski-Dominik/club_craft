import { prisma } from "@/prisma/prisma";

interface Props {
	params: Promise<{
		id: string;
	}>;
}
export const PUT = async (req: Request, { params }: Props) => {
	const body = await req.json();
	const { amount, description, paymentDate, paymentMethod, selectedMonth } =
		body.form;
	const action = body.action;
	//console.log(action);
	const participantId = parseInt((await params).id, 10);
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
		if (existingPayment && action === "save") {
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
				return new Response(JSON.stringify(updatedPayment), { status: 200 });
			} else {
				return Response.json(
					{ error: "Nie udało się zaktualizować płatności" },
					{ status: 400 }
				);
			}
		} else if (existingPayment && action === "delete") {
			const deleteRelation = await prisma.payment_participant.deleteMany({
				where: { paymentId: existingPayment.id },
			});
			if (!deleteRelation) {
				return Response.json(
					{ error: "Nie udało się usunąć relacji z płatnością" },
					{ status: 500 }
				);
			}
			const deletedPayment = await prisma.payment.delete({
				where: { id: existingPayment.id },
			});
			if (!deletedPayment) {
				return Response.json(
					{ error: "Nie udało się usunąć płatności" },
					{ status: 500 }
				);
			}

			return new Response(JSON.stringify(existingPayment), { status: 200 });
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
			return new Response(JSON.stringify(newPayment), { status: 200 });
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
