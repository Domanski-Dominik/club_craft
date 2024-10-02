import { metadata } from "@/app/layout";
import { prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
	apiVersion: "2024-06-20",
});

const endpointSecret = process.env.WEBHOOK_SECRET as string;

const handleCompletedCheckoutSession = async (
	event: Stripe.CheckoutSessionCompletedEvent
) => {
	try {
		const session = event.data.object as Stripe.Checkout.Session;

		const subscriptionId = session.subscription as string;
		const customerEmail = session.customer_email as string;
		const customerId = session.customer as string;
		const metadata = session.metadata;

		console.log(metadata, subscriptionId, customerEmail, customerId);

		// Możesz teraz zaktualizować dane klubu w bazie
		await updateClubSubscription(
			subscriptionId,
			customerEmail,
			customerId,
			"active",
			metadata
		);

		return true;
	} catch (error) {
		console.error("Błąd podczas obsługi checkout session:", error);
		return false;
	}
};
const handleCreateCustomer = async (event: Stripe.CustomerCreatedEvent) => {
	try {
		const session = event.data.object;
		console.log("create customer", session);
		/*const customer = await stripe.customers.create({
			metadata: {
				clubId : clubId
			}
		})*/
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
};
const handleCustomerSubscriptionUpdate = async (
	event: Stripe.CustomerSubscriptionUpdatedEvent
) => {
	try {
		const session = event.data.object;
		console.log("customer subcription update", session);
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
};
async function updateClubSubscription(
	subscriptionId: string,
	customerEmail: string,
	customerId: string,
	status: string,
	metadata: any
) {
	try {
		// Znajdź klub na podstawie emaila użytkownika lub subskrypcji
		const club = await prisma.club.findUnique({
			where: { id: parseInt(metadata.clubId, 10) },
		});
		if (!club) {
			console.error("Nie znaleziono klubu o podanym ID:", metadata.clubId);
			return;
		}

		await prisma.club.update({
			where: { id: parseInt(metadata.clubId, 10), name: metadata.clubName },
			data: {
				subscriptionId: subscriptionId,
				subscriptionStatus: status,
				subscriptionPlan: metadata.variant,
				customerEmail: customerEmail,
				customerId: customerId,
			},
		});
	} catch (error) {
		console.error("Błąd w aktualizacji subskrypcji:", error);
	}
}
export async function POST(req: NextRequest) {
	const body = await req.text();
	const sig = req.headers.get("stripe-signature");

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(body, sig!, endpointSecret!);
	} catch (error: any) {
		console.error("Webhook signature verification failed", error.message);
		return NextResponse.json({ error: error.message }, { status: 400 });
	}

	switch (event.type) {
		case "checkout.session.completed":
			const savedSession = await handleCompletedCheckoutSession(event);
			if (!savedSession)
				return NextResponse.json(
					{ error: "Nie udało się zapisać sesji z kupowania" },
					{ status: 500 }
				);
			return NextResponse.json({ status: 200 });
		case "customer.created":
			const createCustomer = await handleCreateCustomer(event);
			if (!createCustomer)
				return NextResponse.json(
					{ error: "Nie udało się utworzyć klienta" },
					{ status: 500 }
				);
			return NextResponse.json({ status: 200 });
		case "customer.subscription.deleted":
			console.log("Subskrypcja usunięta");
			return NextResponse.json({ status: 200 });

		case "customer.subscription.updated":
			const updated = await handleCustomerSubscriptionUpdate(event);
			if (!updated)
				return NextResponse.json(
					{ error: "Nie udało się zaktualizować subskrybcji klienta" },
					{ status: 500 }
				);
			return NextResponse.json({ status: 200 });

		default:
			console.warn(`Nie obsługiwany typ eventu ${event.type}`);
			return NextResponse.json({ status: 200 });
	}
}
