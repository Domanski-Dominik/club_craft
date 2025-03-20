import {
	Box,
	Button,
	Card,
	CardContent,
	Divider,
	Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
interface PaymentCardProps {
	amount: number;
	coaches: number;
	participants: number;
	variant: string;
	clubName: string;
	clubId: string;
	clubEmail: string;
	active: boolean;
	subscriptionId: string;
}
const PaymentCard = ({
	variant,
	amount,
	participants,
	coaches,
	clubName,
	active,
	clubId,
	subscriptionId,
}: PaymentCardProps) => {
	const [loading, setLoading] = useState(false);
	const queryClient = useQueryClient();
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
					subscriptionId,
				}),
			});

			const data = await response.json();
			if (data.url || data.success) {
				// Przekierowanie na stronę Stripe Checkout
				if (data.url) {
					window.location.href = data.url;
				}
				queryClient.invalidateQueries({
					queryKey: ["clubInfo"],
					refetchType: "all",
				});
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
		<Box
			sx={{
				padding: "3px", // Daje miejsce na ramkę
				background: active
					? "linear-gradient(45deg, #ffb326, #bb15ed)"
					: "divider", // Gradient
				borderRadius: "16px", // Zaokrąglone rogi dla efektu karty
			}}>
			<Card sx={{ borderRadius: "16px" }}>
				<CardContent
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 2,
					}}>
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
						disabled={active}
						onClick={handleCheckout}>
						{subscriptionId
							? loading
								? "Zmieniamy twój plan..."
								: "Subskrybuj"
							: loading
							? "Przekierowywanie..."
							: "Subskrybuj"}
					</Button>
				</CardContent>
			</Card>
		</Box>
	);
};

export default PaymentCard;
