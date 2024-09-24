// pages/api/checkout.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
	apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
	const { variant, clubName, clubId, clubEmail } = await req.json();
	console.log(variant, clubEmail, clubId, clubName);
	try {
		// Tworzenie sesji płatności
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			mode: "subscription", // lub 'payment' dla jednorazowych płatności
			customer_email: clubEmail,
			line_items: [
				{
					price: getPriceIdByPlan(variant), // Cena subskrypcji lub produktu
					quantity: 1,
				},
			],
			//success_url: `http://localhost:3000/settings/success?session_id={CHECKOUT_SESSION_ID}`,
			success_url: "http://localhost:3000/settings",
			cancel_url: `http://localhost:3000/settings`,
			metadata: {
				clubName, // Przekazujemy nazwę klubu jako metadane
				clubId, // Przekazujemy ID klubu jako metadane
				variant,
			},
		});

		// Zwracamy URL do strony płatności
		return NextResponse.json({ url: session.url }, { status: 200 });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// Funkcja, która zwraca ID ceny na podstawie wybranego planu
const getPriceIdByPlan = (plan: string): string => {
	switch (plan) {
		case "Standard":
			return process.env.STRIPE_STANDARD_PRICE_ID as string;
		case "plus":
			return process.env.STRIPE_PLUS_PRICE_ID as string;
		case "platinum":
			return process.env.STRIPE_PLATINUM_PRICE_ID as string;
		default:
			throw new Error("Niepoprawny plan");
	}
};
