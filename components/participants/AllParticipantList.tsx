import React, { useState, useEffect, useRef } from "react";
import {
	useGridApiContext,
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
	GridRenderCellParams,
} from "@mui/x-data-grid";
import { styled } from "@mui/material";
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
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import pl from "date-fns/locale/pl";
import { format } from "date-fns/format";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import DialogPay from "../dialogs/DialogPay";
import DialogDelete from "../dialogs/DialogDelete";
import PolishDayName from "@/functions/PolishDayName";
import DialogGroups from "../dialogs/DialogGroups";
import ExportToExel from "../export/ExportToExel";
import { sortAndAddNumbersAll } from "@/functions/sorting";
import {
	useDeletePrt,
	usePayment,
	useUpdatePrt,
} from "@/hooks/participantHooks";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { StyledDataGrid } from "../styled/StyledDataGrid";
import { parse } from "date-fns";

type Props = {
	participants: Participant[];
	locWithGroups: LocWithGroups[];
	isOwner: boolean;
	clubInfo: any;
};

const formatDateMonth = (date: Date) => {
	return format(date, "MM-yyyy");
};
const PickDate = ({
	id,
	value,
	field,
	gridRef,
}: GridRenderCellParams & { gridRef: any }) => {
	const handleChange = async (newDate: Date | null) => {
		await gridRef.current.setEditCellValue({
			id,
			field,
			value: newDate ? format(newDate, "dd-MM-yyyy") : null,
		});
		gridRef.current.stopCellEditMode({ id, field });
	};
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				height: "100%",
			}}>
			<LocalizationProvider
				dateAdapter={AdapterDateFns}
				adapterLocale={pl}>
				<DatePicker
					label='Data urodzenia'
					value={value ? parse(value, "dd-MM-yyyy", new Date()) : null}
					onChange={handleChange}
					sx={{ width: 100, my: 1 }}
					slotProps={{ textField: { size: "small" } }}
				/>
			</LocalizationProvider>
			<CloseIcon
				onClick={() => handleChange(null)}
				sx={{ ml: 1 }}
			/>
		</Box>
	);
};

const AllParticipantList = ({ participants, locWithGroups }: Props) => {
	const router = useRouter();
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
	const queryClient = useQueryClient();

	const handleCloseSnackbar = () => setSnackbar(null);

	const hiddenFields = ["num", "actions", "hiddengroups"];
	const filterTextsRef = useRef([]);

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
					queryClient.invalidateQueries({
						queryKey: ["allGroups"],
						refetchType: "inactive",
					});
					queryClient.invalidateQueries({
						queryKey: ["participants"],
						refetchType: "inactive",
					});
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
				<GridToolbarQuickFilter sx={{ width: 170 }} />

				<LocalizationProvider
					dateAdapter={AdapterDateFns}
					adapterLocale={pl}>
					<DatePicker
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
							setEdit((prev) => !prev);
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
			renderCell: (params: GridRenderCellParams) => {
				const rowIndex =
					params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
				return (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							height: "100%",
						}}>
						{rowIndex}
					</Box>
				);
			},
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
			renderCell: (params) => (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						height: "100%",
					}}>
					{params.value}
				</Box>
			),
		},
		{
			field: "firstName",
			headerName: "Imię",
			minWidth: 100,
			editable: true,
			flex: 1,
			renderCell: (params) => (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						height: "100%",
					}}>
					{params.value}
				</Box>
			),
		},
		{
			field: "birthday",
			headerName: "Urodzony",
			minWidth: edit ? 140 : 110,
			editable: true,
			hideable: true,
			flex: 1,
			sortable: false,
			renderEditCell: (props: GridRenderCellParams) => (
				<PickDate
					{...props}
					gridRef={gridRef}
				/>
			),
			renderCell: (params) => (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						height: "100%",
					}}>
					{params.value ? params.value : ""}
				</Box>
			),
		},
		{
			field: "phoneNumber",
			headerName: "Telefon",
			minWidth: 100,
			editable: true,
			hideable: true,
			flex: 1,
			sortable: false,
			renderCell: (params) => (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						height: "100%",
					}}>
					{params.value}
				</Box>
			),
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
							height: "100%",
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
			field: "info",
			headerName: "Info",
			width: 15,
			editable: false,
			sortable: false,
			hideable: true,
			renderCell: (params) => (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "100%",
					}}>
					<InfoOutlinedIcon
						onClick={() => router.push(`/participant/${params.row.id}`)}
					/>
				</Box>
			),
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
						<span style={{ fontWeight: "bold" }}>{gr.name}, </span>
						{gr.terms.map((t: any) => (
							<React.Fragment key={t.id}>
								<br />
								<span style={{ color: "darkviolet" }}>{t.location.name}</span>
								{", "}
								{PolishDayName(t.dayOfWeek)} {t.timeS}-{t.timeE}
							</React.Fragment>
						))}
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
			renderCell: (params) => (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "100%",
					}}>
					{params.value}
				</Box>
			),
		},
		{
			field: "active",
			headerName: "Aktywny",
			width: 100,
			editable: false,
			hideable: true,
			type: "boolean",
			sortable: true,
		},
		{
			field: "parentFirstName",
			headerName: "Imię rodzica",
			minWidth: 115,
			editable: true,
			flex: 1,
			renderCell: (params) => (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						height: "100%",
					}}>
					{params.value}
				</Box>
			),
		},
		{
			field: "parentLastName",
			headerName: "Nazwisko rodzica",
			minWidth: 120,
			editable: true,
			flex: 1,
			renderCell: (params) => (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						height: "100%",
					}}>
					{params.value}
				</Box>
			),
		},
		{ field: "hiddengroups", headerName: "Ukryta ", hideable: true },
	];
	const Export = async () => {
		const filteredData = participants.filter(
			(participant) =>
				(participant.active ||
					participant.payments?.some(
						(p: any) => p.month === formatDateMonth(date)
					) ||
					participant.attendance?.some((a: any) => {
						const attendanceMonthYear = a.date.substring(3); // Ucinamy pierwsze trzy znaki z daty
						return attendanceMonthYear === formatDateMonth(date);
					})) &&
				filterTextsRef.current.every((filter: any) =>
					Object.entries(participant).some(([key, value]) => {
						if (Array.isArray(value)) {
							// Obsługa tablic, takich jak 'participantgroup' i inne
							return value.some((item) => {
								if (key === "participantgroup") {
									// Dla każdej grupy uczestnika
									const flatStringGroup =
										`${item.name} ${item.club} ${item.clientsPay}`.toLowerCase();
									const flatStringLocation = item.locationschedule
										?.map((schedule: any) => schedule.locations?.name || "")
										.join(" ")
										.toLowerCase();
									const flatStringTerms = item.terms
										?.map(
											(term: any) =>
												`${PolishDayName(term.dayOfWeek)} ${term.timeS}-${
													term.timeE
												} ${term.location?.name || ""}`
										)
										.join(" ")
										.toLowerCase();

									// Łączymy dane grupy, lokalizacji i terminów
									const combinedString = `${flatStringGroup} ${flatStringLocation} ${flatStringTerms}`;

									// Sprawdzamy, czy filtr znajduje się w danych grupy
									return combinedString.includes(filter);
								} else {
									const flatString = Object.values(item)
										.join(" ")
										.toLowerCase();
									return flatString.includes(filter) && !key.includes("id");
								}
							});
						} else if (value && typeof value === "string") {
							return (
								value.toLowerCase().includes(filter) && !key.includes("id")
							);
						}
						return false;
					})
				)
		);
		ExportToExel({ data: filteredData, date: date });

		//ExportToExel({ data: rows });
	};
	const handleFilterModelChange = (model: any) => {
		const newFilterTexts = model.quickFilterValues.map((value: string) =>
			value.toLowerCase()
		);
		// Nie wykonujemy filtrowania tutaj, tylko przechowujemy wartość filtru w stanie komponentu
		filterTextsRef.current = newFilterTexts;
	};
	return (
		<>
			<Box
				sx={{
					width: "100%",
					height: "calc(100vh - 75px - 90px)",
					backgroundColor: "white",
					p: 2,
					borderRadius: 4,
					mx: 1,
				}}>
				<StyledDataGrid
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
					slots={{
						toolbar: CustomToolbar,
						pagination: GridPagination,
						footer: CustomFooter,
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
						filter: {
							filterModel: {
								items: [],
								quickFilterExcludeHiddenColumns: false,
							},
						},
					}}
					onFilterModelChange={handleFilterModelChange}
					slotProps={{
						columnsManagement: {
							getTogglableColumns,
						},
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
/*const handleFilterModelChange = (model: any) => {
		const filterTexts = model.quickFilterValues.map((value: string) =>
			value.toLowerCase()
		); // Zamień na małe litery
		//console.log(filterTexts);
		if (filterTexts.length !== 0) {
			const filteredData = participants.filter(
				(participant) =>
					participant.active && // Dodaj warunek, że participant musi być aktywny
					filterTexts.every(
						(
							filter: any // Zmieniamy some na every, aby sprawdzić, czy każda fraza pasuje
						) =>
							Object.entries(participant).some(([key, value]) => {
								// Iterujemy po polach uczestnika
								if (Array.isArray(value)) {
									// Sprawdzamy, czy wartość jest tablicą
									return value.some((item) => {
										// Sprawdzamy, czy jakikolwiek element w tablicy pasuje
										if (key === "participantgroup") {
											const dayName = PolishDayName(item.day); // Zamień numer dnia tygodnia na jego nazwę
											const flatString =
												`${dayName} ${item.location} ${item.name}`.toLowerCase(); // Tworzymy ciąg znaków z nazwy dnia, lokalizacji i nazwy grupy
											return flatString.includes(filter); // Sprawdzamy, czy ciąg znaków zawiera frazę
										} else {
											const flatString = Object.values(item)
												.join(" ")
												.toLowerCase(); // Spłaszczamy obiekt do ciągu znaków i zamieniamy na małe litery
											return flatString.includes(filter) && !key.includes("id"); // Sprawdzamy, czy ciąg znaków zawiera frazę i czy klucz nie zawiera 'id'
										}
									});
								} else if (value && typeof value === "string") {
									// Sprawdzamy, czy wartość jest łańcuchem znaków
									return (
										value.toLowerCase().includes(filter) && !key.includes("id")
									); // Sprawdzamy, czy wartość zawiera frazę i czy klucz nie zawiera 'id'
								}
								return false; // Zwracamy false, jeśli wartość nie jest łańcuchem znaków, tablicą lub jeśli jest null
							})
					)
			);
			/*console.log(model);
			console.log(model.quickFilterValues.join(" "));
			console.log(filteredData);
			setFilteredRows(filteredData);
		}
	};*/
