"use client";

import React, {
	useState,
	useMemo,
	useOptimistic,
	useCallback,
	startTransition,
} from "react";
import {
	Box,
	Grid2,
	Typography,
	TextField,
	Divider,
	styled,
	Stack,
} from "@mui/material";
import {
	StyledAccordion,
	StyledAccordionDetails,
	StyledAccordionSummaryNoExpand,
	TypographyStack,
} from "../styled/StyledComponents";
import { pl } from "date-fns/locale/pl";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format, parse } from "date-fns";
import { PieChart } from "@mui/x-charts";
import AddCardIcon from "@mui/icons-material/AddCard";
import DialogPay from "../dialogs/DialogPay";
import type {
	Participant,
	Payment,
	FormPay,
	LocWithGroups,
} from "@/types/type";
import ResponsiveSnackbar from "../Snackbars/Snackbar";
import { modifyPayment } from "@/server/attendance-payment-actions";
import { GridValidRowModel } from "@mui/x-data-grid";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useRouter } from "next/navigation";

type Props = {
	participants: Participant[];
};
const StackBalance = styled(Stack)(({ theme }) => ({
	flexDirection: "row",
	padding: theme.spacing(2),
	justifyContent: "space-between",
	alignItems: "center",
}));
const Balance = ({ participants }: Props) => {
	const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
	const [payDialogOpen, setPayDialogOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<Participant | null>(null);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "error" | "warning" | "info" | "success";
	}>({ open: false, message: "", severity: "info" });
	const router = useRouter();
	const handleCloseSnackbar = () => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	};
	const [optimisticParticipants, updateOptymisticParticipants] = useOptimistic(
		participants,
		(state, updatedParticipants: Participant[]) => {
			return state.map(
				(participant) =>
					updatedParticipants.find(
						(updated) => updated.id === participant.id
					) || participant
			);
		}
	);
	const updateParticipantsOptimisticallyTransition = useCallback(
		(updatedParticipants: Participant[]) => {
			startTransition(() => {
				updateOptymisticParticipants(updatedParticipants);
			});
		},
		[updateOptymisticParticipants]
	);
	const summary = useMemo(() => {
		if (!selectedMonth)
			return { attending: 0, paid: 0, overdue: 0, overdueList: [] };

		const monthString = format(selectedMonth, "MM-yyyy");

		let attending = 0;
		let paid = 0;
		const overdueList: Participant[] = [];

		optimisticParticipants.forEach((participant) => {
			const attended = participant.attendance?.some((att) => {
				const attendanceDate = parse(att.date, "dd-MM-yyyy", new Date());
				return att.belongs && format(attendanceDate, "MM-yyyy") === monthString;
			});

			const paidForMonth = participant.payments?.some(
				(payment) => payment.month === monthString
			);

			if (attended) {
				attending++;
				if (paidForMonth) {
					paid++;
				} else {
					overdueList.push(participant);
				}
			}
		});

		return { attending, paid, overdue: attending - paid, overdueList };
	}, [participants, selectedMonth]);
	const handlePayDialogOpen = (row: Participant) => () => {
		setSelectedRow(row);
		setPayDialogOpen(true);
	};
	const handlePayment = async (
		form: FormPay | null,
		row: GridValidRowModel | null,
		action: "save" | "delete" | null
	) => {
		//console.log(form, row);
		setPayDialogOpen(false);
		if (form !== null && row !== null && action !== null) {
			let updatedRows = [...optimisticParticipants];
			try {
				if (selectedRow) {
					const data = {
						...form,
						participantId: selectedRow.id,
						action: action,
					};
					if (action === "save") {
						updatedRows = updatedRows.map((row) => {
							if (row.id === selectedRow.id && row.payments) {
								// Sprawdź, czy istnieje płatność dla danego miesiąca
								const existingPayment = row.payments.find(
									(payment: Payment) => payment.month === form.selectedMonth
								);
								if (existingPayment) {
									// Jeśli płatność istnieje, zaktualizuj jej dane
									const updatedPayments = row.payments.map((payment: Payment) =>
										payment.month === form.selectedMonth
											? {
													...payment,
													amount: Number(form.amount),
													description: form.description,
													paymentDate: form.paymentDate,
													paymentMethod: form.paymentMethod,
											  }
											: payment
									);

									return {
										...row,
										payments: updatedPayments,
									};
								} else {
									// Jeśli płatność nie istnieje, dodaj nowy obiekt płatności
									const newPayment = {
										id: Math.random(),
										month: form.selectedMonth,
										amount: Number(form.amount),
										description: form.description,
										paymentDate: form.paymentDate,
										paymentMethod: form.paymentMethod,
									};

									return {
										...row,
										payments: [...row.payments, newPayment],
									};
								}
							}

							return row;
						});
					}
					if (action === "delete") {
						updatedRows = updatedRows.map((row) => {
							if (row.id === selectedRow.id && row.payments) {
								// Sprawdź, czy istnieje płatność dla danego miesiąca
								const existingPaymentIndex = row.payments.findIndex(
									(payment: Payment) => payment.month === form.selectedMonth
								);

								if (existingPaymentIndex !== -1) {
									// Usuń płatność, jeśli istnieje
									const updatedPayments = [...row.payments];
									updatedPayments.splice(existingPaymentIndex, 1);

									return {
										...row,
										payments: updatedPayments,
									};
								}
							}
							return row;
						});
					}
					updateParticipantsOptimisticallyTransition(updatedRows);
					const message = await modifyPayment(data);
					if (!("error" in message)) {
						//console.log(message);
						setSnackbar({
							open: true,
							message:
								action === "save"
									? "Udało się dodać płatność"
									: "Udało się usunąć płatność",
							severity: "success",
						});
					} else {
						console.log(message);
						setSnackbar({
							open: true,
							message: message.error,
							severity: "error",
						});
					}
				}
			} catch (error) {
				console.error("Błąd podczas aktualizacji płatności:", error);
				setSnackbar({
					open: true,
					message: "Wystąpił bład podczas komunikacją z bazą danych",
					severity: "error",
				});
				updateOptymisticParticipants(participants);
			} finally {
				setSelectedRow(null);
			}
		}
	};
	return (
		<Box sx={{ width: "100%" }}>
			{/* Podsumowanie */}
			<StyledAccordion
				expanded={true}
				elevation={0}>
				<StyledAccordionSummaryNoExpand>
					<Typography
						color='white'
						variant='h6'>
						Podsumowanie
					</Typography>
				</StyledAccordionSummaryNoExpand>
				<StyledAccordionDetails
					sx={{
						display: "flex",
						flexDirection: { xs: "column", sm: "column", lg: "row" }, // Układ zależny od ekranu
						alignItems: { xs: "center", lg: "flex-start" },
						gap: 2, // Odstęp między Box a wykresem
						p: 2,
					}}>
					<Box
						sx={{
							width: { xs: "100%", sm: "100%", lg: "50%", xl: "50%" },
						}}>
						<StackBalance>
							<Typography
								variant='h6'
								color='primary'>
								Uczęszczających na zajęcia:
							</Typography>
							<Typography variant='h6'>{summary.attending}</Typography>
						</StackBalance>{" "}
						<Divider />
						<StackBalance>
							<Typography
								variant='h6'
								color='primary'>
								Osób, które zapłaciły:
							</Typography>
							<Typography variant='h6'>{summary.paid}</Typography>
						</StackBalance>
						<Divider />
						<StackBalance>
							<Typography
								variant='h6'
								color='primary'>
								Zaległości w płatnościach:
							</Typography>
							<Typography variant='h6'>{summary.overdue}</Typography>
						</StackBalance>{" "}
						<Divider />
						<StackBalance>
							<LocalizationProvider
								dateAdapter={AdapterDateFns}
								adapterLocale={pl}>
								<DatePicker
									label='Wybierz miesiąc'
									views={["year", "month"]}
									value={selectedMonth}
									onChange={(newValue) =>
										newValue && setSelectedMonth(newValue)
									}
									slotProps={{
										textField: { size: "small", fullWidth: true },
									}}
								/>
							</LocalizationProvider>
						</StackBalance>
						<Divider />
					</Box>
					{summary.attending && (
						<PieChart
							series={[
								{
									data: [
										{ id: 0, value: summary.paid, label: "Opłacone" },
										{
											id: 1,
											value: summary.overdue,
											label: "Zaległości",
											color: "red",
										},
									],
									innerRadius: 20,
									outerRadius: 110,
									paddingAngle: 2,
									cornerRadius: 5,
								},
							]}
							width={350}
							height={250}
						/>
					)}
				</StyledAccordionDetails>
			</StyledAccordion>

			{/* Lista osób z zaległościami */}
			<StyledAccordion
				expanded={true}
				elevation={0}>
				<StyledAccordionSummaryNoExpand>
					<Typography
						color='white'
						variant='h6'>
						Lista osób z zaległościami
					</Typography>
				</StyledAccordionSummaryNoExpand>
				<StyledAccordionDetails>
					<Box>
						{summary.overdueList.map((participant) => (
							<>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										height: "100%",
										width: "100%",
										px: 1,
									}}>
									<Box
										key={participant.id}
										p={1}>
										<Typography>
											<strong>Imię i nazwisko:</strong> {participant.firstName}{" "}
											{participant.lastName}
										</Typography>
										<Typography>
											<strong>Numer telefonu:</strong>{" "}
											{participant.phoneNumber || "Brak"}
										</Typography>
										<Typography>
											<strong>Grupy:</strong>{" "}
											{participant.participantgroup
												?.map((group: any) => group.name)
												.join(", ")}
										</Typography>
									</Box>

									<Box>
										<InfoOutlinedIcon
											onClick={() =>
												router.push(`/participant/${participant.id}`)
											}
											sx={{ mr: 2 }}
										/>
										<AddCardIcon onClick={handlePayDialogOpen(participant)} />
									</Box>
								</Box>
								<Divider variant='middle' />
							</>
						))}
						{summary.overdueList.length === 0 && (
							<Typography>
								Brak osób z zaległościami w wybranym miesiącu.
							</Typography>
						)}
					</Box>
				</StyledAccordionDetails>
			</StyledAccordion>
			{selectedRow && (
				<DialogPay
					open={payDialogOpen}
					row={selectedRow}
					onClose={handlePayment}
				/>
			)}
			<ResponsiveSnackbar
				open={snackbar.open}
				onClose={handleCloseSnackbar}
				message={snackbar.message}
				severity={snackbar.severity}
			/>
		</Box>
	);
};

export default Balance;
