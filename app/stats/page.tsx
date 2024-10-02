"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Loading from "@/context/Loading";
import type { Group, Location, LocWithGroups, Term } from "@/types/type";
import {
	Box,
	FormControl,
	Typography,
	Select,
	InputLabel,
	MenuItem,
	Collapse,
	Divider,
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
	isWithinInterval,
	parse,
	getMonth,
	getDate,
	getYear,
	format,
} from "date-fns";
import { pl } from "date-fns/locale/pl";
import { SelectChangeEvent } from "@mui/material/Select/SelectInput";
import {
	Stack2,
	StyledAccordion,
	StyledAccordionDetails,
	StyledAccordionSummary,
	StyledTab,
	StyledTabs,
	TypographyStack,
} from "@/components/styled/StyledComponents";
import NotAllowed from "@/components/errors/NotAllowed";
import PolishDayName from "@/functions/PolishDayName";

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
						mt: 2,
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
		paymentOption: "month",
		location: "all",
		group: "",
		rangeStart: new Date(),
		rangeEnd: new Date(),
	});
	const [groups, setGroups] = useState<any>([]);
	const [payment, setPayment] = useState<any>({
		data: [],
		series: [],
		xAxis: [],
	});
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
		queryFn: () =>
			fetch(`/api/components/form/${session?.user.club}`).then((res) =>
				res.json()
			),
	});
	useEffect(() => {
		if (participants.data) {
			let updatedXAxis = [];
			let updatedData: any = [];
			let updatedSeries = [
				{ dataKey: "cash", label: "Gotówka", stack: "A" },
				{
					dataKey: "transfer",
					label: "Przelew",
					color: "#DA00FF",
					stack: "A",
				},
			];
			if (info.paymentOption === "month") {
				const daysInMonth = new Date(
					info.month.getFullYear(),
					info.month.getMonth() + 1,
					0
				).getDate();

				// Tworzymy dane dla dni miesiąca
				updatedXAxis = Array.from({ length: daysInMonth }, (_, i) => i + 1);

				// Tworzymy obiekt, aby przechowywać sumy płatności dla każdego dnia
				const dailyPayments: any = {};

				// Zakres dat dla danego miesiąca
				const startDate = startOfMonth(info.month);
				const endDate = endOfMonth(info.month);

				// Przechodzimy przez wszystkich uczestników
				participants.data.forEach((participant) => {
					if (participant.payments) {
						participant.payments.forEach((payment) => {
							const paymentDate = parse(
								payment.paymentDate,
								"dd-MM-yyyy",
								new Date()
							);

							// Sprawdzamy, czy płatność jest w zakresie danego miesiąca
							if (
								isWithinInterval(paymentDate, {
									start: startDate,
									end: endDate,
								})
							) {
								const paymentDay = getDate(paymentDate); // Pobieramy dzień z paymentDate

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

				// Generowanie danych wykresu dla każdego dnia miesiąca
				updatedData = updatedXAxis.map((day) => ({
					x: day,
					cash: dailyPayments[day] ? dailyPayments[day].cash : 0,
					transfer: dailyPayments[day] ? dailyPayments[day].transfer : 0,
				}));

				// Sumowanie wszystkich płatności
				const sumCash = updatedData.reduce(
					(sum: any, data: any) => sum + data.cash,
					0
				);
				const sumTransfer = updatedData.reduce(
					(sum: any, data: any) => sum + data.transfer,
					0
				);

				setInfo((prev) => {
					if (
						prev.sumCash !== sumCash ||
						prev.sumTransfer !== sumTransfer ||
						prev.sumAll !== sumCash + sumTransfer
					) {
						return {
							...prev,
							sumCash: sumCash,
							sumTransfer: sumTransfer,
							sumAll: sumCash + sumTransfer,
						};
					}
					return prev;
				});
			} else if (info.paymentOption === "range") {
				const startDate = new Date(info.rangeStart);
				const endDate = new Date(info.rangeEnd);

				// Obliczanie liczby dni między startDate a endDate
				const dayCount =
					Math.ceil(
						(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
					) + 1;

				// Tworzenie osi X z listą dat w zakresie w formacie 'dd.MM' dla wyświetlenia
				updatedXAxis = Array.from({ length: dayCount }, (_, i) => {
					const date = new Date(startDate);
					date.setDate(startDate.getDate() + i);
					return format(date, "dd.MM"); // Formatowanie daty dla wyświetlenia
				});

				// Mapowanie danych płatności na podstawie zakresu dat
				updatedData = updatedXAxis.map((formattedDate, i) => {
					// Obliczamy faktyczną datę na podstawie indeksu do porównania
					const currentDate = new Date(startDate);
					currentDate.setDate(currentDate.getDate() + i);

					const rangePayments = participants.data.reduce(
						(acc, participant) => {
							// Sprawdzamy płatności dla uczestnika
							participant.payments?.forEach((payment) => {
								// Parsowanie daty płatności w formacie 'dd-MM-yyyy'
								const paymentDate = parse(
									payment.paymentDate,
									"dd-MM-yyyy",
									new Date()
								);

								// Sprawdzamy, czy data płatności mieści się w zakresie
								if (
									paymentDate.getDate() === currentDate.getDate() &&
									paymentDate.getMonth() === currentDate.getMonth() &&
									paymentDate.getFullYear() === currentDate.getFullYear()
								) {
									if (payment.paymentMethod === "cash") {
										acc.cash += payment.amount;
									} else if (payment.paymentMethod === "transfer") {
										acc.transfer += payment.amount;
									}
								}
							});
							return acc;
						},
						{ x: formattedDate, cash: 0, transfer: 0 } // Inicjalizacja danych dla danej daty
					);

					return rangePayments;
				});

				const sumCash = updatedData.reduce(
					(sum: number, data: any) => sum + data.cash,
					0
				);
				const sumTransfer = updatedData.reduce(
					(sum: number, data: any) => sum + data.transfer,
					0
				);

				// Zaktualizowanie sumy płatności
				setInfo((prev) => ({
					...prev,
					sumCash: sumCash,
					sumTransfer: sumTransfer,
					sumAll: sumCash + sumTransfer,
				}));
			}
			setPayment({
				xAxis: [
					{
						dataKey: "x",
						scaleType: "band",
						label: "Data",
					},
				],
				data: updatedData,
				series: updatedSeries,
			});
		}
	}, [
		info.month,
		info.paymentOption,
		info.rangeEnd,
		info.rangeStart,
		locWithGroups.data,
		participants.data,
	]);
	useEffect(() => {
		if ((locWithGroups.data, participants.data)) {
			let updatedXAxis = [];
			let updatedData: any = [];
			let updatedSeries = [
				{ dataKey: "present", label: "Obecni", stack: "A" },
				{
					dataKey: "workout",
					label: "Odrabiający",
					stack: "A",
					color: "#FF0000",
				},
			];
			if (info.presenceOption === "month") {
				const daysInMonth = new Date(
					info.month.getFullYear(),
					info.month.getMonth() + 1,
					0
				).getDate();

				// Tworzymy dane dla dni miesiąca
				updatedXAxis = Array.from({ length: daysInMonth }, (_, i) => i + 1);

				// Zaktualizuj dane o obecności na podstawie dat w danym miesiącu
				updatedData = updatedXAxis.map((day) => {
					// Obliczanie obecności na dany dzień
					const dayPresence = participants.data.reduce(
						(acc, participant) => {
							// Sprawdzanie obecności każdego uczestnika
							participant.attendance?.forEach((att) => {
								const attendanceDate = parse(
									att.date,
									"dd-MM-yyyy",
									new Date()
								);

								// Sprawdzamy, czy data pasuje do dnia i wybranego miesiąca
								if (
									getDate(attendanceDate) === day &&
									getMonth(attendanceDate) === getMonth(info.month) &&
									getYear(attendanceDate) === getYear(info.month)
								) {
									if (att.belongs) acc.present += 1;
									else acc.workout += 1;
								}
							});
							return acc;
						},
						{ x: day, present: 0, workout: 0 }
					);
					return dayPresence;
				});
			} else if (info.presenceOption === "range") {
				const isInLocation = (participant: any, locationId: number) => {
					// Sprawdzamy, czy uczestnik jest przypisany do grup w danej lokalizacji
					return locWithGroups.data.some((loc: any) => {
						if (loc.id === locationId) {
							// Sprawdzamy, czy grupy uczestnika są obecne w tej lokalizacji
							return participant.participantgroup.some((pg: any) =>
								loc.groups.some((group: Group) => group.id === pg.id)
							);
						}
						return false;
					});
				};

				const startDate = new Date(info.rangeStart);
				const endDate = new Date(info.rangeEnd);

				// Obliczanie liczby dni między startDate a endDate
				const dayCount =
					Math.ceil(
						(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
					) + 1;

				// Tworzenie osi X z listą dat w zakresie w formacie 'dd.MM' dla wyświetlenia
				updatedXAxis = Array.from({ length: dayCount }, (_, i) => {
					const date = new Date(startDate);
					date.setDate(startDate.getDate() + i);
					return format(date, "dd.MM"); // Formatowanie daty dla wyświetlenia
				});

				updatedData = updatedXAxis.map((formattedDate, i) => {
					// Obliczamy faktyczną datę na podstawie indeksu do porównania
					const currentDate = new Date(startDate);
					currentDate.setDate(currentDate.getDate() + i);

					const rangePresence = participants.data.reduce(
						(acc, participant) => {
							// Filtrujemy po lokalizacji, jeśli info.location nie jest 'all'
							if (info.location !== "all") {
								const locationId = parseInt(info.location, 10);

								// Sprawdzamy, czy uczestnik należy do odpowiedniej lokalizacji
								const isParticipantInLocation = isInLocation(
									participant,
									locationId
								);

								// Jeśli uczestnik nie jest w lokalizacji, pomijamy go
								if (!isParticipantInLocation) return acc;
							}

							participant.attendance?.forEach((att) => {
								// Parsowanie daty obecności w formacie 'dd-MM-yyyy'
								const attendanceDate = parse(
									att.date,
									"dd-MM-yyyy",
									new Date()
								);

								// Sprawdzamy, czy data obecności mieści się w zakresie
								if (
									attendanceDate.getDate() === currentDate.getDate() &&
									attendanceDate.getMonth() === currentDate.getMonth() &&
									attendanceDate.getFullYear() === currentDate.getFullYear()
								) {
									if (att.belongs) acc.present += 1;
									else acc.workout += 1;
								}
							});
							return acc;
						},
						{ x: formattedDate, present: 0, workout: 0 } // Inicjalizacja danych dla danej daty
					);

					return rangePresence;
				});
			} else if (info.presenceOption === "group" && info.group) {
				const groupId = parseInt(info.group, 10); // Parsowanie info.group do liczby
				const selectedGroup = locWithGroups.data
					.flatMap((loc: any) => loc.groups)
					.find((group: Group) => group.id === groupId);

				if (selectedGroup) {
					const selectedMonth = info.month.getMonth(); // Wybrany miesiąc
					const selectedYear = info.month.getFullYear(); // Wybrany rok

					// Filtrowanie terminów w danej grupie, które są w wybranym miesiącu
					const filteredTerms = selectedGroup.terms.filter((term: Term) => {
						const termDate = new Date(term.effectiveDate);
						return (
							termDate.getMonth() === selectedMonth &&
							termDate.getFullYear() === selectedYear
						);
					});

					// Generowanie wszystkich dni danego miesiąca
					const daysInMonth = new Date(
						selectedYear,
						selectedMonth + 1,
						0
					).getDate(); // Liczba dni w miesiącu

					// Filtrujemy te dni, które odpowiadają dniom tygodnia z terminów
					const termDaysOfWeek = filteredTerms.map(
						(term: Term) => term.dayOfWeek
					);
					const matchingDays = Array.from({ length: daysInMonth }, (_, i) => {
						const date = new Date(selectedYear, selectedMonth, i + 1);
						const dayOfWeek = date.getDay(); // Pobranie dnia tygodnia (0 - niedziela, 1 - poniedziałek, ...)
						if (termDaysOfWeek.includes(dayOfWeek)) {
							return date.toLocaleDateString("pl-PL", {
								day: "2-digit",
								month: "2-digit",
							});
						}
						return null; // Ignoruj dni, które nie pasują
					}).filter(Boolean); // Usuń null wartości

					// Aktualizujemy oś X
					updatedXAxis = matchingDays;

					// Mapowanie obecności uczestników na podstawie terminów
					updatedData = updatedXAxis.map((date) => {
						const termPresence = participants.data.reduce(
							(acc, participant) => {
								participant.attendance?.forEach((att) => {
									// Parsowanie daty obecności
									const attendanceDate = parse(
										att.date,
										"dd-MM-yyyy",
										new Date()
									).toLocaleDateString("pl-PL", {
										day: "2-digit",
										month: "2-digit",
									});
									// Sprawdzamy, czy data obecności pasuje do danej daty
									if (
										attendanceDate === date &&
										att.groupId === selectedGroup.id
									) {
										if (att.belongs) acc.present += 1;
										else acc.workout += 1;
									}
								});
								return acc;
							},
							{ x: date, present: 0, workout: 0 }
						);
						return termPresence;
					});
				}
			}
			// Twój kod do generowania danych dla wykresu...
			setAttendance({
				xAxis: [{ dataKey: "x", scaleType: "band", label: "Data" }],
				data: updatedData,
				series: updatedSeries,
			});
		}
	}, [
		info.rangeEnd,
		info.rangeStart,
		info.presenceOption,
		info.month,
		info.group,
		info.location,
		locWithGroups.data,
		participants.data,
	]);
	useEffect(() => {
		if (locWithGroups.data) {
			if (locWithGroups.data.length > 0) {
				const allGroups: Group[] = locWithGroups.data.flatMap(
					(loc: LocWithGroups) => loc.groups
				);

				// Używamy Map do usunięcia zduplikowanych grup (na podstawie `id`)
				const uniqueGroups: Group[] = Array.from(
					new Map(allGroups.map((group: Group) => [group.id, group])).values()
				);
				const filteredGroups =
					info.location === "all"
						? uniqueGroups // Zwróć wszystkie unikalne grupy
						: uniqueGroups.filter((group: Group) =>
								locWithGroups.data.some(
									(loc: LocWithGroups) =>
										loc.id === parseInt(info.location, 10) &&
										loc.groups.some((g) => g.id === group.id)
								)
						  );

				const sortedGroups = filteredGroups.sort((a: Group, b: Group) => {
					const nameComparison = a.name.localeCompare(b.name);
					if (nameComparison !== 0) {
						return nameComparison; // Jeśli nazwy są różne, sortuj po nazwie
					}
					return a.id - b.id; // Jeśli nazwy są takie same, sortuj po id
				});
				setGroups(sortedGroups);
			}
		}
	}, [locWithGroups.data, info.location]);

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
				px: 1,
			}}>
			<Box
				sx={{
					width: "100%",
					borderBottom: 1,
					borderColor: "divider",
				}}>
				<StyledTabs
					value={info.page}
					onChange={(event: React.SyntheticEvent, newValue: number) =>
						setInfo({ ...info, page: newValue })
					}
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
			</Box>
			<CustomTabPanel
				value={info.page}
				index={0}>
				<StyledAccordion>
					<StyledAccordionSummary>
						<Typography
							variant='h6'
							color='white'>
							Filtruj
						</Typography>
					</StyledAccordionSummary>
					<StyledAccordionDetails>
						<Stack2>
							<TypographyStack>Zakres:</TypographyStack>
							<Box
								width='50%'
								px={0.5}>
								<FormControl fullWidth>
									<InputLabel id='range'>Zakres</InputLabel>
									<Select
										labelId='range'
										label='Zakres'
										value={info.paymentOption}
										onChange={(e) =>
											setInfo((prev) => ({
												...prev,
												paymentOption: e.target.value,
											}))
										}>
										<MenuItem value={"month"}>Miesiąc</MenuItem>
										<MenuItem value={"range"}>Zakres</MenuItem>
									</Select>
								</FormControl>
							</Box>
						</Stack2>
						<Divider variant='middle' />
						<Collapse in={info.paymentOption === "month"}>
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
													}
												}}
												views={["month", "year"]}
											/>
										</LocalizationProvider>
									</FormControl>
								</Box>
							</Stack2>
						</Collapse>
						<Collapse in={info.paymentOption === "range"}>
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
													}
												}}
											/>
										</LocalizationProvider>
									</FormControl>
								</Box>
							</Stack2>
						</Collapse>
					</StyledAccordionDetails>
				</StyledAccordion>
				<Box
					sx={{
						width: "100%",
						backgroundColor: "white",
						borderBottomRightRadius: 3,
						borderBottomLeftRadius: 3,
					}}>
					<Box
						sx={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "space-around",
							pt: 2,
						}}>
						<Typography>
							<span style={{ fontWeight: "bold" }}>Gotówka:</span>{" "}
							<span style={{ color: "darkviolet", fontWeight: "bold" }}>
								{info.sumCash}
							</span>{" "}
							zł
						</Typography>
						<Typography>
							<span style={{ fontWeight: "bold" }}>Suma:</span>{" "}
							<span style={{ color: "darkviolet", fontWeight: "bold" }}>
								{info.sumAll}
							</span>{" "}
							zł
						</Typography>
						<Typography>
							{" "}
							<span style={{ fontWeight: "bold" }}>Przelew:</span>{" "}
							<span style={{ color: "darkviolet", fontWeight: "bold" }}>
								{info.sumTransfer}
							</span>{" "}
							zł
						</Typography>
					</Box>
					<Divider variant='middle' />
					<BarChart
						xAxis={payment.xAxis}
						series={payment.series}
						dataset={payment.data}
						height={350}
					/>
				</Box>
			</CustomTabPanel>
			<CustomTabPanel
				value={info.page}
				index={1}>
				<StyledAccordion>
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
									<InputLabel id='loc'>Lokalizacje</InputLabel>
									<Select
										labelId='loc'
										label='Lokalizacje'
										value={info.location}
										onChange={(e) =>
											setInfo((prev) => ({ ...prev, location: e.target.value }))
										}>
										<MenuItem
											value='all'
											divider>
											Wszystkie
										</MenuItem>
										{locWithGroups.data ? (
											locWithGroups.data.map((loc: Location) => (
												<MenuItem
													key={loc.id}
													divider
													value={`${loc.id}`}>
													{loc.name}
												</MenuItem>
											))
										) : (
											<></>
										)}
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
									<InputLabel id='range'>Zakres</InputLabel>
									<Select
										labelId='range'
										label='Zakres'
										value={info.presenceOption}
										onChange={(e) =>
											setInfo((prev) => ({
												...prev,
												presenceOption: e.target.value,
											}))
										}>
										<MenuItem value={"month"}>Miesiąc</MenuItem>
										<MenuItem value={"range"}>Zakres</MenuItem>
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

						<Collapse in={info.presenceOption === "group"}>
							<Stack2>
								<Box
									width='50%'
									pr={0.5}>
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
								<Box
									width='50%'
									px={0.5}>
									<FormControl fullWidth>
										<InputLabel id='select-group'>Grupa</InputLabel>
										<Select
											id='select-group'
											label='Grupa'
											value={info.group || ""}
											onChange={(e: SelectChangeEvent) =>
												setInfo({ ...info, group: e.target.value })
											}>
											{groups.length > 0 ? (
												groups.map((group: Group, index: number) => (
													<MenuItem
														key={index}
														divider
														value={group.id}>
														<Box>
															<Typography
																variant='body1'
																component='div'
																sx={{ fontWeight: "bold" }}>
																{group.name}
															</Typography>
															{group.terms.map((t: any, index) => (
																<Typography
																	key={index}
																	variant='body2'
																	component='div'
																	sx={{ paddingLeft: "8px" }}>
																	{PolishDayName(t.dayOfWeek)} {t.timeS}-
																	{t.timeE} {t.location.name}
																</Typography>
															))}
														</Box>
													</MenuItem>
												))
											) : (
												<></>
											)}
										</Select>
									</FormControl>
								</Box>
							</Stack2>
						</Collapse>
					</StyledAccordionDetails>
				</StyledAccordion>
				<Box
					sx={{
						width: "100%",
						backgroundColor: "white",
						borderBottomRightRadius: 3,
						borderBottomLeftRadius: 3,
					}}>
					<BarChart
						xAxis={attendance.xAxis}
						dataset={attendance.data}
						height={390}
						series={attendance.series}
					/>
				</Box>
			</CustomTabPanel>
		</Box>
	);
};

export default Stats;
