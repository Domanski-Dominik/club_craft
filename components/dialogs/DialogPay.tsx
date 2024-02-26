import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import pl from "date-fns/locale/pl";
import format from "date-fns/format";
import { MobileDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	Select,
	TextField,
	InputLabel,
	FormControl,
	MenuItem,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Box,
	Grid,
	SelectChangeEvent,
	Typography,
	InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { DialogPayType, Payment } from "@/types/type";

const formatDate = (date: Date) => {
	return format(date, "dd-MM-yyyy");
};
const formatDateMonth = (date: Date) => {
	return format(date, "MM-yyyy");
};
const DialogPay: React.FC<DialogPayType> = ({ open, row, onClose }) => {
	if (row === null) {
		return null;
	}
	const [addingPayment, setAddingPayment] = useState(false);
	const [editedPaymentId, setEditedPaymentId] = useState<string | null>(null);
	const [paymentData, setPaymentData] = useState({
		amount: "",
		description: "",
		paymentMethod: "cash",
		selectedMonth: new Date(),
		paymentDate: formatDate(new Date()),
	});
	const [errors, setErrors] = useState({
		amount: "",
	});

	const validateForm = () => {
		let valid = true;
		const newErrors = { ...errors };

		// Walidacja pola powtórz hasło
		if (paymentData.amount.startsWith("0")) {
			newErrors.amount = "Nie może zaczynać się od zera";
			valid = false;
		} else if (/[\s,.]/.test(paymentData.amount)) {
			newErrors.amount = "Nie może zawierać przecinków i kropek";
			valid = false;
		} else if (paymentData.amount === "") {
			newErrors.amount = "Podaj kwotę";
			valid = false;
		} else {
			newErrors.amount = "";
		}
		setErrors(newErrors);
		return valid;
	};
	const handleChange =
		(name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
			setPaymentData({ ...paymentData, [name]: event.target.value });
		};
	const handleSelectChange = (name: string) => (event: SelectChangeEvent) => {
		setPaymentData({ ...paymentData, [name]: event.target.value });
	};
	const handleDateChange = (date: Date | null) => {
		if (date !== null) {
			const selectedRowPayment = row?.payments.find(
				(payment: Payment) => payment.month === formatDateMonth(date)
			);

			setPaymentData({
				amount: `${selectedRowPayment?.amount}` || "",
				description: selectedRowPayment?.description || "",
				paymentMethod: selectedRowPayment?.paymentMethod || "cash",
				selectedMonth: date,
				paymentDate: formatDate(date),
			});
		}
	};
	const handleClose = () => {
		setPaymentData({
			amount: "",
			description: "",
			paymentMethod: "cash",
			selectedMonth: new Date(),
			paymentDate: formatDate(new Date()),
		});
		onClose(null, null, null);
	};
	const handleDelete = (e: React.FormEvent) => {
		e.preventDefault();
		const formattedData = {
			...paymentData,
			selectedMonth: formatDateMonth(paymentData.selectedMonth),
		};
		onClose(formattedData, row, "delete");
		setPaymentData({
			amount: "",
			description: "",
			paymentMethod: "cash",
			selectedMonth: new Date(),
			paymentDate: formatDate(new Date()),
		});
	};
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (validateForm()) {
			const formattedData = {
				...paymentData,
				selectedMonth: formatDateMonth(paymentData.selectedMonth),
			};
			onClose(formattedData, row, "save");
			setPaymentData({
				amount: "",
				description: "",
				paymentMethod: "cash",
				selectedMonth: new Date(),
				paymentDate: formatDate(new Date()),
			});
		}
	};
	const handleEditClick = (paymentId: string) => {
		setAddingPayment(false);
		setEditedPaymentId(paymentId);
		const payment = row.payments.find(
			(pay: any) => pay.id === Number(paymentId)
		);
		if (payment) {
			const [month, year] = payment.month.split("-");
			const date = new Date(`${year}-${month}-01`);
			setPaymentData({
				amount: payment.amount,
				description: payment.description,
				selectedMonth: date,
				paymentDate: payment.paymentDate,
				paymentMethod: payment.paymentMethod,
			});
		}
	};
	const handleCancelClick = () => {
		setEditedPaymentId(null);
		setErrors({ amount: "" });
	};
	const handleAddPayment = () => {
		setAddingPayment(true);
		setEditedPaymentId(null);
		setPaymentData({
			amount: "",
			description: "",
			paymentMethod: "cash",
			selectedMonth: new Date(),
			paymentDate: formatDate(new Date()),
		});
	};
	return (
		<Dialog
			open={open}
			onClose={handleClose}
			scroll='paper'>
			<DialogTitle>
				Płatność {row.firstName} {row.lastName}
			</DialogTitle>
			<DialogContent dividers>
				{addingPayment && (
					<Grid
						sx={{ marginTop: 0.1, marginBottom: 1 }}
						container
						columnSpacing={1}
						rowSpacing={1.5}>
						<Grid
							item
							xs={6}
							sm={6}>
							<TextField
								label='Kwota'
								type='number'
								value={paymentData.amount}
								onChange={handleChange("amount")}
								required
								fullWidth
								InputProps={{
									endAdornment: (
										<InputAdornment position='end'>zł</InputAdornment>
									),
								}}
							/>
							<Typography color='error'>{errors.amount}</Typography>
						</Grid>
						<Grid
							item
							xs={6}
							sm={6}>
							<TextField
								label='Opis'
								value={paymentData.description}
								onChange={handleChange("description")}
								fullWidth
							/>
						</Grid>
						<Grid
							item
							xs={6}
							sm={6}>
							<FormControl fullWidth>
								<InputLabel>Metoda płatności</InputLabel>
								<Select
									label='Metoda płatności'
									value={paymentData.paymentMethod}
									onChange={handleSelectChange("paymentMethod")}
									required>
									<MenuItem value='cash'>Gotówka</MenuItem>
									<MenuItem value='transfer'>Przelew</MenuItem>
								</Select>
							</FormControl>
						</Grid>
						<Grid
							item
							xs={6}
							sm={6}>
							<LocalizationProvider
								dateAdapter={AdapterDateFns}
								adapterLocale={pl}>
								<MobileDatePicker
									label='Miesiąc'
									value={paymentData.selectedMonth}
									onChange={handleDateChange}
									views={["month", "year"]}
									sx={{ width: "100%" }}
								/>
							</LocalizationProvider>
						</Grid>
						<Grid
							item
							xs={6}
							sm={6}>
							<Button
								fullWidth
								variant='outlined'
								onClick={() => setAddingPayment(false)}
								endIcon={<CloseIcon />}>
								Anuluj
							</Button>
						</Grid>
						<Grid
							item
							xs={6}
							sm={6}>
							<Button
								fullWidth
								onClick={handleSubmit}
								endIcon={<SaveIcon />}
								variant='contained'>
								Zapisz
							</Button>
						</Grid>
					</Grid>
				)}
				{row.payments.map((payment: any) => (
					<div
						key={payment.id}
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}>
						{editedPaymentId === payment.id ? (
							<Grid
								sx={{ marginTop: 0.1, marginBottom: 1, marginRight: 2 }}
								container
								columnSpacing={2}
								rowSpacing={1.5}>
								<Grid
									item
									xs={12}
									sm={12}>
									<TextField
										label='Kwota'
										type='number'
										size='small'
										value={paymentData.amount}
										onChange={handleChange("amount")}
										required
										fullWidth
										InputProps={{
											endAdornment: (
												<InputAdornment position='end'>zł</InputAdornment>
											),
										}}
									/>
									<Typography color='error'>{errors.amount}</Typography>
								</Grid>
								<Grid
									item
									xs={12}
									sm={12}>
									<LocalizationProvider
										dateAdapter={AdapterDateFns}
										adapterLocale={pl}>
										<MobileDatePicker
											label='Miesiąc'
											value={paymentData.selectedMonth}
											onChange={handleDateChange}
											views={["month", "year"]}
											slotProps={{ textField: { size: "small" } }}
											sx={{ width: "100%" }}
										/>
									</LocalizationProvider>
								</Grid>
								<Grid
									item
									xs={12}
									sm={12}>
									<FormControl fullWidth>
										<InputLabel>Metoda płatności</InputLabel>
										<Select
											size='small'
											label='Metoda płatności'
											value={paymentData.paymentMethod}
											onChange={handleSelectChange("paymentMethod")}
											required>
											<MenuItem value='cash'>Gotówka</MenuItem>
											<MenuItem value='transfer'>Przelew</MenuItem>
										</Select>
									</FormControl>
								</Grid>
								<Grid
									item
									xs={12}
									sm={12}>
									<TextField
										label='Opis'
										size='small'
										value={paymentData.description}
										onChange={handleChange("description")}
										fullWidth
									/>
								</Grid>
							</Grid>
						) : (
							<Typography variant='body1'>
								Kwota:{" "}
								<span style={{ fontWeight: "bold" }}>{payment.amount}</span> zł,{" "}
								<br />
								Miesiąc:{" "}
								<span style={{ fontWeight: "bold" }}>{payment.month}</span>
							</Typography>
						)}
						{editedPaymentId === payment.id ? (
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									justifyContent: "flex-end",
									alignItems: "center",
								}}>
								<Button
									fullWidth
									variant='outlined'
									onClick={handleCancelClick}
									sx={{ marginBottom: 2 }}
									endIcon={<CloseIcon />}>
									Anuluj
								</Button>
								<Button
									fullWidth
									variant='outlined'
									color='error'
									onClick={handleDelete}
									endIcon={<DeleteIcon />}
									sx={{ marginBottom: 2 }}>
									Usuń
								</Button>
								<Button
									fullWidth
									onClick={handleSubmit}
									endIcon={<SaveIcon />}
									variant='contained'>
									Zapisz
								</Button>
							</div>
						) : (
							<div style={{ marginLeft: 6 }}>
								<Button
									fullWidth
									onClick={() => handleEditClick(payment.id)}
									variant='outlined'
									endIcon={<EditIcon />}>
									Edytuj
								</Button>
							</div>
						)}
					</div>
				))}
			</DialogContent>
			<DialogActions>
				<Grid
					container
					sx={{ justifyContent: "space-around" }}>
					<Grid>
						<Button
							color='primary'
							variant='outlined'
							onClick={handleClose}
							startIcon={<CloseIcon />}>
							Zamknij
						</Button>
					</Grid>
					<Grid>
						<Button
							onClick={handleAddPayment}
							type='submit'
							color='primary'
							variant='contained'
							disabled={addingPayment}
							endIcon={<AddIcon />}>
							Nowa
						</Button>
					</Grid>
				</Grid>
			</DialogActions>
		</Dialog>
	);
};
export default DialogPay;
