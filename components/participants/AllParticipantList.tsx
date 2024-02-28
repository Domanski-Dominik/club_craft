import React, { useState, useEffect } from "react";
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
	GridToolbarContainer,
	GridPagination,
	GridToolbarColumnsButton,
	GridToolbarQuickFilter,
	GridFooterContainer,
	GridFooter,
} from "@mui/x-data-grid";
import {
	Box,
	Button,
	Alert,
	AlertProps,
	Snackbar,
	Typography,
} from "@mui/material";
import type {
	Participant,
	Payment,
	FormPay,
	LocWithGroups,
} from "@/types/type";
import IosShareIcon from "@mui/icons-material/IosShare";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCardIcon from "@mui/icons-material/AddCard";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import pl from "date-fns/locale/pl";
import format from "date-fns/format";
import { MobileDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import DialogPay from "../dialogs/DialogPay";
import DialogDelete from "../dialogs/DialogDelete";
import PolishDayName from "@/context/PolishDayName";
import DialogGroups from "../dialogs/DialogGroups";
import ExportToExel from "../export/ExportToExel";
import { sortAndAddNumbersAll } from "@/functions/sorting";
import {
	useDeletePrt,
	usePayment,
	useUpdatePrt,
} from "@/hooks/participantHooks";

type Props = {
	participants: Participant[];
	locWithGroups: LocWithGroups[];
	isOwner: boolean;
};

const formatDateMonth = (date: Date) => {
	return format(date, "MM-yyyy");
};

const AllParticipantList = ({ participants, locWithGroups }: Props) => {
	const [selectedRow, setSelectedRow] = useState<GridRowModel | null>(null);
	const gridRef = useGridApiRef();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [payDialogOpen, setPayDialogOpen] = useState(false);
	const [groupsDialogOpen, setGroupsDialogOpen] = useState(false);
	const [edit, setEdit] = useState(false);
	const [date, setDate] = useState<Date>(new Date());
	const [rows, setRows] = useState<(Participant | GridValidRowModel)[]>(
		sortAndAddNumbersAll(participants)
	);
	const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
	const [columnVisibilityModel, setColumnVisibilityModel] =
		useState<GridColumnVisibilityModel>({
			actions: false,
			hiddengroups: false,
		});
	const [snackbar, setSnackbar] = useState<Pick<
		AlertProps,
		"children" | "severity"
	> | null>(null);
	const payment = usePayment();
	const deletePrt = useDeletePrt();
	const updatePrt = useUpdatePrt();
	const handleCloseSnackbar = () => setSnackbar(null);

	const hiddenFields = ["num", "actions", "hiddengroups"];

	const getTogglableColumns = (columns: GridColDef[]) => {
		return columns
			.filter((column) => !hiddenFields.includes(column.field))
			.map((column) => column.field);
	};
	const handleRowEditStop: GridEventListener<"rowEditStop"> = (
		params,
		event
	) => {
		if (params.reason === GridRowEditStopReasons.rowFocusOut) {
			event.defaultMuiPrevented = true;
		}
		setRowModesModel({
			...rowModesModel,
			[params.id]: { mode: GridRowModes.View },
		});
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
	const handleGroupsDialogOpen = (row: GridRowModel) => () => {
		setSelectedRow(row);
		setGroupsDialogOpen(true);
	};
	const handlePayment = async (
		form: FormPay | null,
		row: GridRowModel | null,
		action: "save" | "delete" | null
	) => {
		//console.log(form, row);
		setPayDialogOpen(false);
		if (form !== null && row !== null && action !== null) {
			try {
				if (selectedRow) {
					const data = {
						participantId: selectedRow.id,
						form: form,
						action: action,
					};
					const message = await payment.mutateAsync(data);
					if (!message.error) {
						//console.log(message);
						setSnackbar({
							children:
								action === "save"
									? "Udało się dodać płatność"
									: "Udało się usunąć płatność",
							severity: "success",
						});
						if (action === "save") {
							const updatedRows = rows.map((row) => {
								if (row.id === selectedRow.id) {
									// Sprawdź, czy istnieje płatność dla danego miesiąca
									const existingPayment = row.payments.find(
										(payment: Payment) => payment.month === form.selectedMonth
									);
									if (existingPayment) {
										// Jeśli płatność istnieje, zaktualizuj jej dane
										const updatedPayments = row.payments.map(
											(payment: Payment) =>
												payment.month === form.selectedMonth
													? {
															...payment,
															amount: form.amount,
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
											id: message.id,
											month: form.selectedMonth,
											amount: form.amount,
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
							setRows(updatedRows);
						}
						if (action === "delete") {
							const updatedRows = rows.map((row) => {
								if (row.id === selectedRow.id) {
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
							//console.log(updatedRows);
							setRows(updatedRows);
						}
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
				const data = {
					id: selectedRow.id,
					selectedRow: selectedRow,
				};
				const message = await deletePrt.mutateAsync(data);
				if (!message.error) {
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
		//console.log(newRow, oldRow);
		const findRow = rows.find((row) => row.id === newRow.id);
		if (findRow) {
			try {
				const data = {
					newRowId: newRow.id,
					updatedRow: updatedRow,
				};
				const message = await updatePrt.mutateAsync(data);
				if (message.message) {
					//console.log(message);
					setSnackbar({
						children: message.message,
						severity: "success",
					});
					setRows(sortAndAddNumbersAll(updatedRows));
					return updatedRow;
				} else {
					//console.log(message);
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
	function CustomToolbar() {
		return (
			<GridToolbarContainer
				sx={{ display: "flex", mt: 1, justifyContent: "space-around" }}>
				<GridToolbarQuickFilter sx={{ width: "50vw" }} />

				<LocalizationProvider
					dateAdapter={AdapterDateFns}
					adapterLocale={pl}>
					<MobileDatePicker
						label='Wybierz Miesiąc'
						value={date}
						onChange={(newDate) => {
							if (newDate) {
								setDate(newDate);
								console.log(newDate);
							}
						}}
						views={["month", "year"]}
						sx={{ width: 150 }}
						slotProps={{ textField: { size: "small" } }}
					/>
				</LocalizationProvider>
				<GridToolbarColumnsButton />
				{edit ? (
					<Button
						variant='text'
						size='medium'
						sx={{ marginLeft: 1, marginRight: 1 }}
						onClick={() => {
							setColumnVisibilityModel({
								actions: false,
								hiddengroups: false,
							});
							const newModesModel: GridRowModesModel = {};
							rows.forEach((row) => {
								newModesModel[row.id] = { mode: GridRowModes.View };
							});
							setRowModesModel(newModesModel);
						}}>
						<CheckIcon />
						Zakończ edycje
					</Button>
				) : (
					<Button
						variant='text'
						size='medium'
						sx={{ marginLeft: 1, marginRight: 1 }}
						onClick={() => {
							setEdit(true);
							gridRef.current.scroll({ left: 0 });
							setColumnVisibilityModel({
								actions: true,
								hiddengroups: false,
							});
						}}>
						<EditIcon />
						Edytuj
					</Button>
				)}
				<Button onClick={Export}>
					<IosShareIcon />
					Exportuj
				</Button>
			</GridToolbarContainer>
		);
	}
	function CustomFooter() {
		const active = rows.filter(
			(participant) => participant.active === true
		).length;
		return (
			<GridFooterContainer>
				<Typography
					variant='body2'
					ml={2}>
					<span style={{ fontWeight: "bold", color: "darkviolet" }}>
						{active}
					</span>{" "}
					/ <span style={{ fontWeight: "bold" }}>{rows.length}</span>{" "}
					uczestników
				</Typography>
				<GridFooter />
			</GridFooterContainer>
		);
	}
	const columns: GridColDef[] = [
		{
			field: "num",
			headerName: "#",
			width: 40,
			sortable: false,
			filterable: false,
			hideable: false,
		},
		{
			field: "actions",
			type: "actions",
			headerName: "Edytuj",
			width: 80,
			cellClassName: "actions",
			hideable: true,
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
			minWidth: 115,
			editable: true,
			flex: 1,
		},
		{
			field: "firstName",
			headerName: "Imię",
			minWidth: 100,
			editable: true,
			flex: 1,
		},
		{
			field: "phoneNumber",
			headerName: "Telefon",
			minWidth: 100,
			editable: true,
			hideable: true,
			flex: 1,
			sortable: false,
		},
		{
			field: "payment",
			headerName: "Płatność",
			minWidth: 80,
			flex: 1,
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
						<Box width={40}>
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
			field: "regulamin",
			headerName: "Umowa",
			width: 90,
			editable: true,
			hideable: true,
			type: "boolean",
		},
		{
			field: "participantgroup",
			headerName: "Grupy",
			minWidth: 300,
			flex: 2,
			hideable: true,
			editable: false,
			sortable: false,
			filterable: true,
			renderCell: (params) => {
				const groups = params.row.participantgroup;
				const groupText = groups.map((gr: any) => (
					<Typography
						sx={{ my: 0.5 }}
						variant='body2'
						key={gr.id}>
						<span style={{ color: "darkviolet" }}>{gr.location},</span>
						{"  "}
						<span style={{ fontWeight: "normal" }}>
							{PolishDayName(gr.day)}:
						</span>
						{"  "}
						<span style={{ fontWeight: "bolder" }}>{gr.name}</span>
					</Typography>
				));

				//console.log(groups);
				return (
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}>
						<Box
							sx={{
								width: 265,
								whiteSpace: "pre-wrap",
							}}>
							{groups.length > 0 ? (
								groupText
							) : (
								<Typography color='error'>
									Nie przypisany do żadnej grupy
								</Typography>
							)}
						</Box>

						<GridActionsCellItem
							icon={<EditCalendarIcon />}
							label='Dodaj grupy'
							onClick={handleGroupsDialogOpen(params.row)}
							color='inherit'
						/>
					</Box>
				);
			},
		},
		{
			field: "note",
			headerName: "Notatka",
			minWidth: 200,
			editable: true,
			hideable: true,
			flex: 1,
			sortable: false,
		},
		{ field: "hiddengroups", headerName: "Ukryta ", hideable: true },
	];
	const Export = async () => {
		ExportToExel({ data: rows });
	};
	return (
		<>
			<Box
				sx={{
					minWidth: "95vw",
					height: "calc(100vh - 75px - 90px)",
					maxWidth: "98vw",
				}}>
				<DataGrid
					apiRef={gridRef}
					columns={columns}
					rows={rows}
					pagination
					disableColumnMenu
					density='compact'
					editMode='row'
					processRowUpdate={processRowUpdate}
					rowModesModel={rowModesModel}
					onRowModesModelChange={handleRowModesModelChange}
					onRowEditStop={handleRowEditStop}
					getRowHeight={() => "auto"}
					onCellDoubleClick={() => {
						setEdit(true);
						setColumnVisibilityModel({
							actions: true,
							hiddengroups: false,
						});
					}}
					columnVisibilityModel={columnVisibilityModel}
					localeText={plPL.components.MuiDataGrid.defaultProps.localeText}
					slots={{
						toolbar: CustomToolbar,
						pagination: GridPagination,
						footer: CustomFooter,
					}}
					slotProps={{
						columnsPanel: { getTogglableColumns, disableHideAllButton: true },
					}}
					onColumnVisibilityModelChange={(newModel) =>
						setColumnVisibilityModel(newModel)
					}
					initialState={{
						columns: {
							columnVisibilityModel: {
								actions: false,
								hiddengroups: false,
							},
						},
						pagination: { paginationModel: { pageSize: 100 } },
					}}
				/>
			</Box>
			{!!snackbar && (
				<Snackbar
					open
					anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
					autoHideDuration={3000}
					sx={{ position: "absolute", bottom: 90, zIndex: 20 }}
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
					onClose={handlePayment}
				/>
			)}
			{selectedRow && (
				<DialogGroups
					open={groupsDialogOpen}
					row={selectedRow}
					onClose={() => {
						setGroupsDialogOpen(false);
						setSelectedRow(null);
					}}
					locWithGroups={locWithGroups}
				/>
			)}
		</>
	);
};

export default AllParticipantList;
