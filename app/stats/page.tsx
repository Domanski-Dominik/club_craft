"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns/format";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Loading from "@/context/Loading";
import { Box, FormControl, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { BarChart } from "@mui/x-charts/BarChart";
import { Participant } from "@/types/type";
import { MobileDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import {
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	isWithinInterval,
} from "date-fns";
import pl from "date-fns/locale/pl";
import Grid from "@mui/material/Unstable_Grid2/Grid2";

const Stats = () => {
	const [paymentData, setPaymentData] = useState<any>([]);
	const [month, setMonth] = useState<Date>(new Date());
	const [sumCash, setSumCash] = useState<number>(0);
	const [sumTransfer, setSumTransfer] = useState<number>(0);
	const [sumAll, setSumAll] = useState<number>(0);
	const [owner, setOwner] = useState(false);
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const participants = useQuery<Participant[]>({
		queryKey: ["allParticipants"],
		enabled: !!session,
		queryFn: () =>
			fetch(
				`/api/participant/all/${session?.user.role}/${session?.user.club}/${session?.user.id}`
			).then((res) => res.json()),
	});
	useEffect(() => {
		if (session?.user.role !== "owner") {
			setOwner(false);
		} else {
			setOwner(true);
		}
	}, [session]);
	useEffect(() => {
		if (participants.data) {
			// Tworzymy obiekt, który będzie przechowywał sumy płatności dla każdego dnia miesiąca
			const dailyPayments: any = {};
			const startDate = startOfMonth(new Date(month));
			const endDate = endOfMonth(new Date(month));
			const allDays = eachDayOfInterval({ start: startDate, end: endDate });
			// Przechodzimy przez wszystkich uczestników
			participants.data.forEach((participant) => {
				if (participant.payments) {
					participant.payments.forEach((payment) => {
						const [day, month, year] = payment.paymentDate
							.split("-")
							.map(Number);
						const paymentDate = new Date(year, month - 1, day);

						// Sprawdzamy, czy płatność jest w zakresie danego miesiąca
						if (
							isWithinInterval(paymentDate, { start: startDate, end: endDate })
						) {
							// Pobieramy dzień z paymentDate
							const paymentDay = paymentDate.getDate();

							// Inicjalizujemy obiekt dla danego dnia, jeśli nie istnieje
							if (!dailyPayments[paymentDay]) {
								dailyPayments[paymentDay] = {
									cash: 0,
									transfer: 0,
								};
							}

							// Dodajemy kwotę płatności do sumy danego dnia według metody płatności
							if (payment.paymentMethod === "cash") {
								dailyPayments[paymentDay].cash += payment.amount;
							} else if (payment.paymentMethod === "transfer") {
								dailyPayments[paymentDay].transfer += payment.amount;
							}
						}
					});
				}
			});

			const chartData = allDays.map((day) => ({
				x: day.getDate(), // Pobieramy dzień miesiąca
				cash: dailyPayments[day.getDate()]
					? parseInt(dailyPayments[day.getDate()].cash, 10)
					: 0,
				transfer: dailyPayments[day.getDate()]
					? parseInt(dailyPayments[day.getDate()].transfer, 10)
					: 0,
			}));
			const sumCash = chartData.reduce((sum, data) => sum + data.cash, 0);
			const sumTransfer = chartData.reduce(
				(sum, data) => sum + data.transfer,
				0
			);
			setSumCash(sumCash);
			setSumTransfer(sumTransfer);
			setSumAll(sumCash + sumTransfer);
			// Teraz zmienna chartData zawiera tablicę obiektów {x: (numery od 1 do 31), cash: suma cash, transfer: suma transfer}
			//console.log(chartData);
			setPaymentData(chartData);
		}
		//console.log(participants.data);
	}, [participants.data, month]);

	if (status === "loading" || participants.isLoading) return <Loading />;
	if (participants.isError)
		return (
			<Typography
				color={"red"}
				variant='h3'
				align='center'>
				{participants.error.message}
			</Typography>
		);
	if (!owner)
		return (
			<Typography
				color={"red"}
				variant='h3'
				align='center'>
				Nie masz uprawnień do tej strony
			</Typography>
		);
	if (paymentData.length > 0 && owner)
		return (
			<>
				<Grid
					container
					width={"100%"}
					spacing={3}>
					<Grid xs={6}>
						<FormControl
							fullWidth
							sx={{
								alignItems: "center",
								alignContent: "center",
								justifyContent: "center",
								justifyItems: "center",
							}}>
							<LocalizationProvider
								dateAdapter={AdapterDateFns}
								adapterLocale={pl}>
								<MobileDatePicker
									label='Miesiąc płatności'
									value={month}
									onChange={(newDate) => {
										if (newDate) {
											setMonth(newDate);
											//console.log(newDate);
										}
									}}
									views={["month", "year"]}
									sx={{
										width: 150,
									}}
								/>
							</LocalizationProvider>
						</FormControl>
					</Grid>
					<Grid xs={6}>
						<Typography align='center'>
							Gotówka: <span style={{ color: "darkviolet" }}>{sumCash}</span>{" "}
							zł, Przelew:{" "}
							<span style={{ color: "darkviolet" }}>{sumTransfer}</span> zł,
							<br />
							Suma: <span style={{ color: "darkviolet" }}>{sumAll}</span> zł
						</Typography>
					</Grid>
				</Grid>
				<Box
					width={"100%"}
					minWidth={360}>
					<BarChart
						xAxis={[
							{
								dataKey: "x",
								max: 31,
								scaleType: "band",
								label: "Dni miesiąca",
							},
						]}
						series={[
							{ dataKey: "cash", label: "Gotówka", stack: "A" },
							{
								dataKey: "transfer",
								label: "Przelew",
								color: "#DA00FF",
								stack: "A",
							},
						]}
						dataset={paymentData}
						height={400}
					/>
				</Box>
			</>
		);
};

export default Stats;
