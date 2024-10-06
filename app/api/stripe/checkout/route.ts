import { NextResponse } from "next/server";
import Stripe from "stripe";
import { constants } from "@/constants/constants";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
	apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
	const { variant, clubName, clubId, subscriptionId } = await req.json();
	console.log(variant, clubId, clubName, subscriptionId);
	try {
		if (!subscriptionId) {
			// Tworzenie sesji płatności
			const session = await stripe.checkout.sessions.create({
				//payment_method_types: ["card"],
				mode: "subscription", // lub 'payment' dla jednorazowych płatności
				line_items: [
					{
						price: getPriceIdByPlan(variant), // Cena subskrypcji lub produktu
						quantity: 1,
					},
				],
				//success_url: `http://localhost:3000/settings/success?session_id={CHECKOUT_SESSION_ID}`,
				success_url: constants.success_url,
				cancel_url: constants.cancel_url,
				metadata: {
					clubName, // Przekazujemy nazwę klubu jako metadane
					clubId, // Przekazujemy ID klubu jako metadane
					variant,
				},
			});
			return NextResponse.json({ url: session.url }, { status: 200 });
		} else {
			const subscription = await stripe.subscriptions.retrieve(subscriptionId);

			const existingItem = subscription.items.data.find(
				(item) => item.price.id === getPriceIdByPlan(variant)
			);
			if (existingItem) {
				await stripe.subscriptions.update(subscriptionId, {
					items: [
						{
							id: existingItem.id, // Użyjemy istniejącego id pozycji subskrypcji
							price: getPriceIdByPlan(variant), // Nowa cena, jeśli potrzebna
						},
					],
					metadata: {
						clubName,
						clubId,
						variant,
					},
				});
				return NextResponse.json({ success: true }, { status: 200 });
			} else {
				await stripe.subscriptions.update(subscriptionId, {
					items: [
						{
							price: getPriceIdByPlan(variant),
							quantity: 1,
						},
					],
					metadata: {
						clubName,
						clubId,
						variant,
					},
				});
				return NextResponse.json({ success: true }, { status: 200 });
			}
		}
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// Funkcja, która zwraca ID ceny na podstawie wybranego planu
const getPriceIdByPlan = (plan: string): string => {
	switch (plan) {
		case "Standard":
			return process.env.STRIPE_STANDARD_PRICE_ID as string;
		case "Plus":
			return process.env.STRIPE_PLUS_PRICE_ID as string;
		case "Gold":
			return process.env.STRIPE_GOLD_PRICE_ID as string;
		case "Platinum":
			return process.env.STRIPE_PLATINUM_PRICE_ID as string;
		default:
			throw new Error("Niepoprawny plan");
	}
};
