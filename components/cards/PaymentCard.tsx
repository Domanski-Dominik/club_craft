import { Button, Card, CardContent, Divider, Typography } from "@mui/material";
import React, { useState } from "react";

interface PaymentCardProps {
	amount: number;
	coaches: number;
	participants: number;
	variant: string;
	clubName: string;
	clubId: string;
	clubEmail: string;
}
const PaymentCard = ({
	variant,
	amount,
	participants,
	coaches,
	clubName,
	clubEmail,
	clubId,
}: PaymentCardProps) => {
	const [loading, setLoading] = useState(false);

	const handleCheckout = async () => {
		setLoading(true);

		try {
			// Wywołanie backendowego endpointu do tworzenia sesji płatności
			const response = await fetch("/api/stripe/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					variant,
					clubName,
					clubId,
					clubEmail,
				}),
			});

			const data = await response.json();

			if (data.url) {
				// Przekierowanie na stronę Stripe Checkout
				window.location.href = data.url;
			} else {
				console.error("Błąd podczas tworzenia sesji:", data.error);
			}
		} catch (error) {
			console.error("Wystąpił błąd:", error);
		} finally {
			setLoading(false);
		}
	};
	return (
		<Card sx={{ border: 1, borderColor: "divider" }}>
			<CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
				<Typography
					align='center'
					variant='h6'>
					{variant}
				</Typography>
				<Typography
					align='center'
					variant='h3'>
					{amount} zł<span style={{ fontSize: "15px" }}>/miesiąc</span>
				</Typography>
				<Divider variant='middle' />
				{participants === 0 ? (
					<Typography
						align='center'
						fontWeight={"bold"}>
						Brak limitu uczestników
					</Typography>
				) : (
					<Typography align='center'>
						Do <span style={{ fontWeight: "bold" }}>{participants}</span>{" "}
						uczestników
					</Typography>
				)}

				<Divider variant='middle' />
				{coaches === 0 ? (
					<Typography
						align='center'
						fontWeight={"bold"}>
						Brak limitu trenerów
					</Typography>
				) : (
					<Typography align='center'>
						Do <span style={{ fontWeight: "bold" }}>{coaches}</span>
						{coaches === 1 ? " dodatkowego trenera" : " dodatkowych trenerów"}
					</Typography>
				)}

				<Button
					variant='contained'
					onClick={handleCheckout}>
					{loading ? "Przekierowywanie..." : "Subskrybuj"}
				</Button>
			</CardContent>
		</Card>
	);
};

export default PaymentCard;
