import React, { useEffect } from "react";
import {
	DataGrid,
	plPL,
	GridColDef,
	GridActionsCellItem,
	GridColumnVisibilityModel,
	GridRowId,
	GridRowModel,
	GridValidRowModel,
	GridRowModesModel,
	GridEventListener,
	GridRowModes,
	GridRowEditStopReasons,
	useGridApiRef,
} from "@mui/x-data-grid";
import {
	Box,
	Button,
	Alert,
	AlertProps,
	Snackbar,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Checkbox,
	TextField,
	InputLabel,
	FormControl,
	Select,
	MenuItem,
	Grid,
	Typography,
} from "@mui/material";
import type { Attendance, Participant, Payment, FormPay } from "@/types/type";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SaveIcon from "@mui/icons-material/Save";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCardIcon from "@mui/icons-material/AddCard";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import pl from "date-fns/locale/pl";
import format from "date-fns/format";
import { MobileDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import DialogPay from "../dialogs/DialogPay";
import DialogDelete from "../dialogs/DialogDelete";

type Props = {
	participants: Participant[];
	groupId: number;
};

const sortAndAddNumbers = (
	rows: (Participant | GridValidRowModel)[],
	groupId: number
) => {
	const sortedRows = [...rows];
	sortedRows.sort((a, b) => {
		if (a.lastName === b.lastName) {
			return a.firstName.localeCompare(b.firstName);
		}
		return a.lastName.localeCompare(b.lastName);
	});

	// Dodaj numery do posortowanych uczestników
	const rowsWithNumbers = sortedRows.map((row, index) => {
		return { ...row, num: index + 1, groupId: groupId };
	});

	// Zaktualizuj stan z posortowaną i ponumerowaną listą uczestników
	return rowsWithNumbers;
};
const formatDate = (date: Date) => {
	return format(date, "dd-MM-yyyy");
};
const formatDateMonth = (date: Date) => {
	return format(date, "MM-yyyy");
};

const ParticipantList = ({ participants, groupId }: Props) => {
	const [selectedRow, setSelectedRow] = React.useState<GridRowModel | null>(
		null
	);
	const gridRef = useGridApiRef();
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [payDialogOpen, setPayDialogOpen] = React.useState(false);
	const [edit, setEdit] = React.useState(false);
	const [more, setMore] = React.useState(false);
	const [date, setDate] = React.useState<Date>(new Date());
	const [rows, setRows] = React.useState<(Participant | GridValidRowModel)[]>(
		sortAndAddNumbers(participants, groupId)
	);
	const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
		{}
	);
	const [columnVisibilityModel, setColumnVisibilityModel] =
		React.useState<GridColumnVisibilityModel>({
			phoneNumber: false,
			actions: false,
			payment: false,
			note: false,
		});
	const [snackbar, setSnackbar] = React.useState<Pick<
		AlertProps,
		"children" | "severity"
	> | null>(null);

	const handleCloseSnackbar = () => setSnackbar(null);

	const handleRowEditStop: GridEventListener<"rowEditStop"> = (
		params,
		event
	) => {
		if (params.reason === GridRowEditStopReasons.rowFocusOut) {
			event.defaultMuiPrevented = true;
		}
	};
	const handleEditClick = (id: GridRowId) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
	};
	const handleSaveClick = (id: GridRowId) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
	};
	const handlePayDialogOpen = (row: GridRowModel) => () => {
		setSelectedRow(row);
		setPayDialogOpen(true);
	};

	const handleAddPayment = async (
		form: FormPay | null,
		row: GridRowModel | null
	) => {
		// Tutaj możesz dodać logikę obsługi dodawania płatności
		//console.log(form, row);
		if (form !== null && row !== null) {
			try {
				if (selectedRow) {
					const response = await fetch(`/api/payment/${selectedRow.id}`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							form,
						}), // Przekaż zaktualizowane dane uczestnika
					});
					const message = await response.json();
					if (response.ok) {
						//console.log(message);
						setSnackbar({
							children: message.message,
							severity: "success",
						});

						const updatedRows = rows.map((row) => {
							if (row.id === selectedRow.id) {
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
													amount: form.amount,
													description: form.description,
													paymentDate: form.paymentDate,
													paymentMethod: form.paymentMethod,
													// ... inne zaktualizowane pola
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
										month: form.selectedMonth,
										amount: form.amount,
										description: form.description,
										paymentDate: form.paymentDate,
										paymentMethod: form.paymentMethod,
										// ... inne pola dla nowej płatności
									};

									return {
										...row,
										payments: [...row.payments, newPayment],
									};
								}
							}
							return row;
						});
						console.log(updatedRows);
						setRows(updatedRows);
					} else {
						console.log(message);
						setSnackbar({ children: message.error, severity: "error" });
					}
				}
			} catch (error) {
				console.error("Błąd podczas aktualizacji płatności:", error);
				setSnackbar({
					children: "Wystąpił bład podczas komunikacją z bazą danych",
					severity: "error",
				});
			}
		}
		setPayDialogOpen(false);
		setSelectedRow(null);
	};
	const handleDeleteClick = (row: GridRowModel) => () => {
		setSelectedRow(row);
		setDialogOpen(true);
		//setRows(rows.filter((row) => row.id !== id));
		//console.log(row);
	};
	const handleChoice = async (value: string) => {
		//console.log(value);
		setDialogOpen(false);
		if (value === "yes" && selectedRow !== null) {
			try {
				const response = await fetch(`/api/participant/${selectedRow.id}`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(selectedRow), // Przekaż zaktualizowane dane uczestnika
				});
				const message = await response.json();
				if (response.ok) {
					console.log(message);
					setSnackbar({
						children: message.message,
						severity: "success",
					});
					setRows(rows.filter((row) => row.id !== selectedRow.id));
				} else {
					console.log(message);
					setSnackbar({ children: message.error, severity: "error" });
				}
			} catch (error) {
				setSnackbar({
					children: "Wystąpił bład podczas komunikacją z bazą danych",
					severity: "error",
				});
			}
		} else {
			setSelectedRow(null);
		}
	};
	const handleCancelClick = (id: GridRowId) => () => {
		setRowModesModel({
			...rowModesModel,
			[id]: { mode: GridRowModes.View, ignoreModifications: true },
		});
	};

	const processRowUpdate = async (
		newRow: GridRowModel,
		oldRow: GridRowModel
	) => {
		const updatedRow = { ...newRow };
		const updatedRows = rows.map((row) =>
			row.id === newRow.id ? updatedRow : row
		);
		console.log(newRow, oldRow);
		const findRow = rows.find((row) => row.id === newRow.id);
		if (findRow) {
			try {
				const response = await fetch(`/api/participant/${newRow.id}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(updatedRow), // Przekaż zaktualizowane dane uczestnika
				});
				const message = await response.json();
				if (response.ok) {
					console.log(message);
					setSnackbar({
						children: message.message,
						severity: "success",
					});
					setRows(sortAndAddNumbers(updatedRows, groupId));
					return updatedRow;
				} else {
					console.log(message);
					setSnackbar({ children: message.error, severity: "error" });
					return oldRow;
				}
			} catch (error) {
				setSnackbar({
					children: "Wystąpił bład podczas komunikacją z bazą danych",
					severity: "error",
				});
				return oldRow;
			}
		}
		return oldRow;
	};
	const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
		setRowModesModel(newRowModesModel);
	};
	const CustomToolbar = () => {
		return (
			<Box
				height={60}
				paddingTop={2}
				mb={1}>
				{!edit && (
					<>
						<Button
							variant='outlined'
							size='medium'
							sx={{ marginLeft: 1, marginRight: 1, height: "37px" }}
							onClick={() => {
								setEdit(true);
								setColumnVisibilityModel({
									phoneNumber: true,
									actions: true,
									payment: true,
									note: true,
								});
							}}>
							<EditIcon />
							Edytuj
						</Button>
						<Button
							variant='outlined'
							size='medium'
							sx={{ marginRight: 1, height: "37px" }}
							onClick={() => {
								setColumnVisibilityModel((prev) => ({
									...prev,
									phoneNumber: !prev.phoneNumber,
									payment: !prev.payment,
									note: !prev.note,
								}));
								gridRef.current.scroll({ left: 0 });
								setMore((prev) => !prev);
							}}>
							<MoreVertIcon />
							{more ? "Mniej" : "Więcej"}
						</Button>
						<LocalizationProvider
							dateAdapter={AdapterDateFns}
							adapterLocale={pl}>
							<MobileDatePicker
								label='Wybierz dzień'
								value={date}
								disableFuture
								onChange={(newDate) => {
									if (newDate) {
										setDate(newDate);
									}
								}}
								sx={{ width: 100 }}
								slotProps={{ textField: { size: "small" } }}
							/>
						</LocalizationProvider>
					</>
				)}
				{edit && (
					<>
						<Button
							variant='outlined'
							size='medium'
							sx={{ marginLeft: 1, marginRight: 1 }}
							onClick={() => {
								setEdit(false),
									setColumnVisibilityModel({
										actions: false,
										phoneNumber: false,
										payment: false,
										note: false,
									});
								setMore(false);
								gridRef.current.scroll({ left: 0 });
							}}>
							<CheckIcon />
							Zakończ edycje
						</Button>
					</>
				)}
			</Box>
		);
	};
	const columns: GridColDef[] = [
		{
			field: "num",
			headerName: "#",
			width: 40,
			sortable: false,
		},
		{
			field: "actions",
			type: "actions",
			headerName: "Akcje",
			width: 80,
			cellClassName: "actions",
			getActions: ({ id, row }) => {
				const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

				if (isInEditMode) {
					return [
						<GridActionsCellItem
							icon={<SaveIcon />}
							label='Save'
							sx={{
								color: "primary.main",
							}}
							onClick={handleSaveClick(id)}
						/>,
						<GridActionsCellItem
							icon={<CancelIcon />}
							label='Cancel'
							className='textPrimary'
							onClick={handleCancelClick(id)}
							color='inherit'
						/>,
					];
				}

				return [
					<GridActionsCellItem
						icon={<DeleteIcon />}
						label='Delete'
						onClick={handleDeleteClick(row)}
						color='inherit'
					/>,
					<GridActionsCellItem
						icon={<EditIcon />}
						label='Edit'
						className='textPrimary'
						onClick={handleEditClick(id)}
						color='inherit'
					/>,
				];
			},
		},
		{
			field: "lastName",
			headerName: "Nazwisko",
			minWidth: 100,
			editable: edit,
			flex: 1,
		},
		{
			field: "firstName",
			headerName: "Imię",
			minWidth: 100,
			editable: edit,
			flex: 1,
		},
		{
			field: "payment",
			headerName: "Płatność",
			width: 70,
			hideable: true,
			editable: false,
			sortable: false,
			renderCell: (params) => {
				const paymentPrt = params.row.payments;

				const Payed = paymentPrt.find(
					(p: any) => p.month === formatDateMonth(date)
				);
				//console.log(paymentPrt, Payed);
				return (
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}>
						<Box width={25}>
							{Payed ? (
								<Typography
									variant='body2'
									fontWeight='bold'>
									{Payed.amount}
								</Typography>
							) : (
								<Typography
									variant='body2'
									fontWeight='bold'
									color='error'>
									0
								</Typography>
							)}
						</Box>

						{Payed ? (
							<GridActionsCellItem
								icon={<CreditCardIcon />}
								label='Dodaj płatność'
								onClick={handlePayDialogOpen(params.row)}
								color='inherit'
							/>
						) : (
							<GridActionsCellItem
								icon={<AddCardIcon />}
								label='Dodaj płatność'
								onClick={handlePayDialogOpen(params.row)}
								color='inherit'
							/>
						)}
					</Box>
				);
			},
		},
		{
			field: "phoneNumber",
			headerName: "Telefon",
			minWidth: 90,
			editable: edit,
			hideable: true,
			flex: 1,
			sortable: false,
		},
		{
			field: "attendance",
			headerName: "Obecność",
			maxWidth: 74,
			renderCell: (params) => {
				const participantAttendance = params.row.attendance;

				const isPresent = participantAttendance.find(
					(item: Attendance) => item.date === formatDate(date)
				);

				const handlePresenceChange = async (event: any) => {
					console.log(event.target.checked);
					const isChecked = event.target.checked;

					try {
						const response = await fetch(
							`/api/presence/${params.row.groupId}/${params.row.id}`,
							{
								method: "PUT",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									date: formatDate(date),
									isChecked: isChecked,
								}), // Przekaż zaktualizowane dane uczestnika
							}
						);
						const message = await response.json();
						if (response.ok) {
							//console.log(message);
							// Skopiuj aktualny stan rows
							const updatedRows = [...rows];

							// Znajdź indeks wiersza dla którego chcesz zaktualizować attendance
							const rowIndex = updatedRows.findIndex(
								(row) => row.id === params.row.id
							);

							if (isChecked) {
								// Jeśli isChecked to true, dodaj nowy obiekt Attendance
								updatedRows[rowIndex].attendance.push({
									date: formatDate(date),
								});
							} else {
								// Jeśli isChecked to false, usuń obiekt Attendance o określonej dacie
								updatedRows[rowIndex].attendance = updatedRows[
									rowIndex
								].attendance.filter(
									(item: Attendance) => item.date !== formatDate(date)
								);
							}
							setSnackbar({
								children: message.message,
								severity: "success",
							});
						} else {
							console.log(message);
							setSnackbar({ children: message.error, severity: "error" });
						}
					} catch (error) {
						console.error("Błąd podczas aktualizacji danych:", error);
						setSnackbar({
							children: "Wystąpił bład podczas komunikacją z bazą danych",
							severity: "error",
						});
					}
				};

				return (
					<Checkbox
						sx={{ width: "100%" }}
						checked={!!isPresent}
						onChange={(event) => handlePresenceChange(event)}
					/>
				);
			},

			sortable: false,
		},
		{
			field: "note",
			headerName: "Notatka",
			minWidth: 150,
			editable: edit,
			hideable: true,
			flex: 1,
			sortable: false,
		},
	];
	return (
		<>
			<DataGrid
				apiRef={gridRef}
				columns={columns}
				density='compact'
				rows={rows}
				localeText={plPL.components.MuiDataGrid.defaultProps.localeText}
				disableColumnMenu
				getRowHeight={() => "auto"}
				editMode='row'
				slots={{ toolbar: CustomToolbar }}
				columnVisibilityModel={columnVisibilityModel}
				initialState={{
					columns: {
						columnVisibilityModel: {
							phoneNumber: false,
							actions: false,
							payment: false,
							note: false,
						},
					},
				}}
				processRowUpdate={processRowUpdate}
				rowModesModel={rowModesModel}
				onRowModesModelChange={handleRowModesModelChange}
				onRowEditStop={handleRowEditStop}
			/>
			{!!snackbar && (
				<Snackbar
					open
					anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
					autoHideDuration={2000}
					sx={{ position: "absolute", bottom: 0, zIndex: 20 }}
					onClose={handleCloseSnackbar}>
					<Alert
						{...snackbar}
						onClose={handleCloseSnackbar}
					/>
				</Snackbar>
			)}
			{selectedRow && (
				<DialogDelete
					open={dialogOpen}
					row={selectedRow}
					onClose={handleChoice}
				/>
			)}
			{selectedRow && (
				<DialogPay
					open={payDialogOpen}
					row={selectedRow}
					onClose={handleAddPayment}
				/>
			)}
		</>
	);
};

export default ParticipantList;
