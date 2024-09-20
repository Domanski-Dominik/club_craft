"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Loading from "@/context/Loading";
import {
	Box,
	FormControl,
	Typography,
	Tab,
	Tabs,
	Select,
	InputLabel,
	MenuItem,
	Collapse,
	Divider,
	Accordion,
	AccordionDetails,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { BarChart } from "@mui/x-charts/BarChart";
import { Participant } from "@/types/type";
import {
	MobileDatePicker,
	LocalizationProvider,
	DatePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import {
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	isWithinInterval,
} from "date-fns";
import pl from "date-fns/locale/pl";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import SelectInput from "@mui/material/Select/SelectInput";
import {
	Stack2,
	StyledAccordionDetails,
	StyledAccordionSummary,
	StyledTab,
	StyledTabs,
	TypographyStack,
} from "@/components/styled/StyledComponents";
import NotAllowed from "@/components/errors/NotAllowed";

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function CustomTabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role='tabpanel'
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
			style={{ width: "100%", height: "100%" }}>
			{value === index && (
				<Box
					sx={{
						height: "100%",
						width: "100%",
						backgroundColor: "white",
						borderRadius: 3,
						pt: 1,
					}}>
					{children}
				</Box>
			)}
		</div>
	);
}

function a11yProps(index: number) {
	return {
		id: `simple-tab-${index}`,
		"aria-controls": `simple-tabpanel-${index}`,
	};
}
const Stats = () => {
	const [info, setInfo] = useState({
		page: 0,
		month: new Date(),
		sumCash: 0,
		sumTransfer: 0,
		sumAll: 0,
		presenceOption: "month",
		location: "all",
		rangeStart: new Date(),
		rangeEnd: new Date(),
	});
	const [value, setValue] = useState(0);
	const [paymentData, setPaymentData] = useState<any>([]);
	const [attendance, setAttendance] = useState<any>({
		data: [],
		series: [],
		xAxis: [],
	});
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
	const locWithGroups = useQuery({
		queryKey: ["locWithGroups"],
		enabled: !!session,
		queryFn: () => fetch(`/api/components/form/${session?.user.club}`),
	});
	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};
	useEffect(() => {
		if (participants.data) {
			// Tworzymy obiekt, który będzie przechowywał sumy płatności dla każdego dnia miesiąca
			const dailyPayments: any = {};
			const startDate = startOfMonth(new Date(info.month));
			const endDate = endOfMonth(new Date(info.month));
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
			setInfo((prev) => ({
				...prev,
				sumCash: sumCash,
				sumTransfer: sumTransfer,
				sumAll: sumCash + sumTransfer,
			}));
			// Teraz zmienna chartData zawiera tablicę obiektów {x: (numery od 1 do 31), cash: suma cash, transfer: suma transfer}
			//console.log(chartData);
			setPaymentData(chartData);
		}
		//console.log(participants.data);
	}, [participants.data, info.month]);
	useEffect(() => {}, [info, locWithGroups.data, participants.data]);

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
	if (session.user.role === "coach") return <NotAllowed />;
	return (
		<Box
			sx={{
				height: "100%",
				width: "100%",
			}}>
			<StyledTabs
				value={value}
				onChange={handleChange}
				aria-label='basic tabs example'
				variant='scrollable'
				scrollButtons='auto'>
				<StyledTab
					label='Płatności'
					{...a11yProps(0)}
				/>
				<StyledTab
					label='Obecności'
					{...a11yProps(1)}
				/>
			</StyledTabs>

			<CustomTabPanel
				value={value}
				index={0}>
				<Grid
					container
					width={"100%"}
					spacing={1}
					padding={2}>
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
									value={info.month}
									onChange={(newDate) => {
										if (newDate) {
											setInfo((prev) => ({
												...prev,
												month: newDate,
											}));
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
							Gotówka:{" "}
							<span style={{ color: "darkviolet" }}>{info.sumCash}</span> zł,
							Przelew:{" "}
							<span style={{ color: "darkviolet" }}>{info.sumTransfer}</span>{" "}
							zł,
							<br />
							Suma: <span style={{ color: "darkviolet" }}>
								{info.sumAll}
							</span>{" "}
							zł
						</Typography>
					</Grid>
				</Grid>
				<Divider variant='middle' />
				<Box
					sx={{
						pt: 1,
						width: "100%",
					}}>
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
			</CustomTabPanel>
			<CustomTabPanel
				value={value}
				index={1}>
				<Typography
					sx={{ py: 25 }}
					variant='h3'
					align='center'>
					Już wkrótce!
				</Typography>
			</CustomTabPanel>
			<CustomTabPanel
				value={value}
				index={2}>
				<Accordion sx={{ p: 1 }}>
					<StyledAccordionSummary>
						<Typography
							variant='h6'
							color='white'>
							Filtruj
						</Typography>
					</StyledAccordionSummary>
					<StyledAccordionDetails>
						<Stack2>
							<TypographyStack>Lokalizacje:</TypographyStack>
							<Box
								width='50%'
								px={0.5}>
								<FormControl fullWidth>
									<InputLabel>Lokalizacje</InputLabel>
									<Select value={info.location}>
										<MenuItem value='all'>Wszystkie</MenuItem>
									</Select>
								</FormControl>
							</Box>
						</Stack2>
						<Divider variant='middle' />
						<Stack2>
							<TypographyStack>Zakres:</TypographyStack>
							<Box
								width='50%'
								px={0.5}>
								<FormControl fullWidth>
									<InputLabel>Zakres</InputLabel>
									<Select
										value={info.presenceOption}
										onChange={(e) =>
											setInfo((prev) => ({
												...prev,
												presenceOption: e.target.value,
											}))
										}>
										<MenuItem value={"month"}>Miesiąc</MenuItem>
										<MenuItem value={"range"}>Zakres</MenuItem>
										<MenuItem value={"day"}>Dzień</MenuItem>
										<MenuItem value={"group"}>Grupa</MenuItem>
									</Select>
								</FormControl>
							</Box>
						</Stack2>
						<Divider variant='middle' />
						<Collapse in={info.presenceOption === "month"}>
							<Stack2>
								<TypographyStack>Miesiąc:</TypographyStack>
								<Box
									width='50%'
									px={0.5}>
									<FormControl fullWidth>
										<LocalizationProvider
											dateAdapter={AdapterDateFns}
											adapterLocale={pl}>
											<MobileDatePicker
												label='Miesiąc'
												value={info.month}
												onChange={(newDate) => {
													if (newDate) {
														setInfo((prev) => ({
															...prev,
															month: newDate,
														}));
														//console.log(newDate);
													}
												}}
												views={["month", "year"]}
											/>
										</LocalizationProvider>
									</FormControl>
								</Box>
							</Stack2>
						</Collapse>

						<Collapse in={info.presenceOption === "range"}>
							<Stack2>
								<Box
									width='50%'
									pr={0.5}>
									<FormControl fullWidth>
										<LocalizationProvider
											dateAdapter={AdapterDateFns}
											adapterLocale={pl}>
											<DatePicker
												label='Od'
												value={info.rangeStart}
												onChange={(newDate) => {
													if (newDate) {
														setInfo((prev) => ({
															...prev,
															rangeStart: newDate,
														}));
														//console.log(newDate);
													}
												}}
											/>
										</LocalizationProvider>
									</FormControl>
								</Box>
								<Box
									width='50%'
									px={0.5}>
									<FormControl fullWidth>
										<LocalizationProvider
											dateAdapter={AdapterDateFns}
											adapterLocale={pl}>
											<DatePicker
												label='Do'
												value={info.rangeEnd}
												onChange={(newDate) => {
													if (newDate) {
														setInfo((prev) => ({
															...prev,
															rangeEnd: newDate,
														}));
														//console.log(newDate);
													}
												}}
											/>
										</LocalizationProvider>
									</FormControl>
								</Box>
							</Stack2>
						</Collapse>

						<Collapse in={info.presenceOption === "day"}>
							<Stack2>
								<TypographyStack>Dzień:</TypographyStack>
								<Box width='50%'>
									<FormControl fullWidth>
										<LocalizationProvider
											dateAdapter={AdapterDateFns}
											adapterLocale={pl}>
											<MobileDatePicker
												label='Dzień'
												value={info.month}
												onChange={(newDate) => {
													if (newDate) {
														setInfo((prev) => ({
															...prev,
															month: newDate,
														}));
														//console.log(newDate);
													}
												}}
											/>
										</LocalizationProvider>
									</FormControl>
								</Box>
							</Stack2>
						</Collapse>
						<Collapse in={info.presenceOption === "group"}>
							<Stack2>
								<TypographyStack>Grupa:</TypographyStack>
								<Box
									width='50%'
									px={0.5}>
									<FormControl fullWidth>
										<InputLabel id='select-group'>Grupa</InputLabel>
										<Select
											id='select-group'
											label='Grupa'></Select>
									</FormControl>
								</Box>
							</Stack2>
						</Collapse>
					</StyledAccordionDetails>
				</Accordion>

				<BarChart
					xAxis={attendance.xAxis}
					dataset={attendance.data}
					series={attendance.series}
					height={350}
				/>
			</CustomTabPanel>
		</Box>
	);
};

export default Stats;
