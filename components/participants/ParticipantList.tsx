"use client";
import { useState, useEffect, useOptimistic, useCallback } from "react";
import {
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
	GridRenderCellParams,
} from "@mui/x-data-grid";
import {
	Box,
	Button,
	Alert,
	AlertProps,
	Snackbar,
	Checkbox,
	Typography,
} from "@mui/material";
import type {
	Attendance,
	Participant,
	Payment,
	FormPay,
	Term,
	GroupL,
	LocWithGroups,
} from "@/types/type";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SaveIcon from "@mui/icons-material/Save";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCardIcon from "@mui/icons-material/AddCard";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { pl } from "date-fns/locale/pl";
import { format } from "date-fns/format";
import CloseIcon from "@mui/icons-material/Close";
import {
	MobileDatePicker,
	LocalizationProvider,
	DatePicker,
} from "@mui/x-date-pickers";
import DialogPay from "../dialogs/DialogPay";
import DialogDelete from "../dialogs/DialogDelete";
import Grid from "@mui/material/Grid2";
import DialogPresent from "../dialogs/DialogPresent";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { getShouldDisableDate } from "@/functions/dates";
import { useRouter } from "next/navigation";
import { StyledDataGrid } from "../styled/StyledDataGrid";
import { getDay, parse } from "date-fns";
import PolishDayName from "@/functions/PolishDayName";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import DialogMoveToGroup from "../dialogs/DialogMoveToGroup";
import {
	modifyPayment,
	updateAttendance,
} from "@/server/attendance-payment-actions";
import { startTransition } from "react";
import {
	deleteParticipant,
	updateParticipant,
} from "@/server/participant-actions";
type Props = {
	participants: Participant[];
	groupId: number;
	group: GroupL;
	clubInfo: any;
	isOwner: boolean;
	locWithGroups: LocWithGroups[];
};

const formatDate = (date: Date) => {
	return format(date, "dd-MM-yyyy");
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
const ParticipantList = ({
	participants,
	groupId,
	group,
	clubInfo,
	isOwner,
	locWithGroups,
}: Props) => {
	const router = useRouter();
	const [selectedRow, setSelectedRow] = useState<GridRowModel | null>(null);
	const gridRef = useGridApiRef();
	const [dialogsOpen, setDialogsOpen] = useState({
		pay: false,
		present: false,
		delete: false,
		move: false,
	});
	const [edit, setEdit] = useState(false);
	const [more, setMore] = useState(false);
	const [date, setDate] = useState<Date>(new Date());
	const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
	const [columnVisibilityModel, setColumnVisibilityModel] =
		useState<GridColumnVisibilityModel>({
			phoneNumber: false,
			actions: false,
			payment: false,
			note: false,
			regulamin: false,
			active: false,
			info: false,
			parentFirstName: false,
			parentLastName: false,
			move: false,
		});
	const [snackbar, setSnackbar] = useState<Pick<
		AlertProps,
		"children" | "severity"
	> | null>(null);
	const [optimisticParticipants, updateOptymisticParticipants] = useOptimistic(
		participants,
		(state, updatedParticipants: Participant[]) => {
			return updatedParticipants;
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

	const handleCloseSnackbar = () => setSnackbar(null);
	const shouldDisableDay = (date: Date) => {
		return getShouldDisableDate(date, group.terms);
	};
	useEffect(() => {
		if (!group || !group.terms || !group.firstLesson) {
			return;
		}

		const firstLessonDate = parse(group.firstLesson, "dd-MM-yyyy", new Date());

		const setNearestPreviousDayOfWeek = (terms: Term[]) => {
			const today = new Date();
			let nearestDate: Date | null = null;

			// Przeszukiwanie w przeszłości
			terms.forEach((term) => {
				const targetDayOfWeek = term.dayOfWeek;
				const effectiveDate = new Date(term.effectiveDate);
				const currentDayOfWeek = today.getDay();

				let diffDays = currentDayOfWeek - targetDayOfWeek;

				if (diffDays < 0) {
					diffDays += 7; // Uwzględnij najbliższy poprzedni dzień
				}

				const nearestPreviousDay = new Date(today);
				nearestPreviousDay.setDate(today.getDate() - diffDays);

				// Sprawdzenie, czy nearestPreviousDay jest późniejszy niż effectiveDate i firstLesson
				if (
					nearestPreviousDay >= effectiveDate &&
					nearestPreviousDay >= firstLessonDate &&
					(nearestDate === null || nearestPreviousDay > nearestDate)
				) {
					nearestDate = nearestPreviousDay;
				}
			});

			// Jeśli nearestDate jest null, spróbuj wybrać najbliższą przyszłą datę, która spełnia warunki
			if (!nearestDate) {
				terms.forEach((term) => {
					const targetDayOfWeek = term.dayOfWeek;
					const effectiveDate = new Date(term.effectiveDate);

					let i = 0;
					while (!nearestDate) {
						// Kontynuujemy, dopóki nie znajdziemy odpowiedniej daty
						const possibleDate = new Date(today);
						possibleDate.setDate(today.getDate() + i);
						if (
							possibleDate.getDay() === targetDayOfWeek &&
							possibleDate >= effectiveDate &&
							possibleDate >= firstLessonDate
						) {
							nearestDate = possibleDate;
						}

						i++;
					}
				});
			}
			if (nearestDate) {
				setDate(nearestDate);
			}
		};

		setNearestPreviousDayOfWeek(group.terms);
	}, [group]);

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
		setDialogsOpen({ ...dialogsOpen, pay: true });
	};
	const handleMoveDialogOpen = (row: GridRowModel) => () => {
		setSelectedRow(row);
		setDialogsOpen({ ...dialogsOpen, move: true });
	};
	const handlePresentDialogOpen = () => {
		setDialogsOpen({ ...dialogsOpen, present: true });
	};
	const handlePresentDialogChoice = () => {
		setDialogsOpen({ ...dialogsOpen, present: false });
	};
	const handleMoveDialogChoice = (close: string) => {
		setDialogsOpen({ ...dialogsOpen, move: false });
		if (close === "no") {
			setSelectedRow(null);
		} else {
			const updatedRows = participants.filter(
				(row) => row.id !== parseInt(close, 10)
			);
			updateParticipantsOptimisticallyTransition(updatedRows);
		}
	};
	const handleAddPayment = async (
		form: FormPay | null,
		row: GridRowModel | null,
		action: "save" | "delete" | null
	) => {
		//console.log(form, row);
		setDialogsOpen({ ...dialogsOpen, pay: false });
		if (form !== null && row !== null && action !== null) {
			let updatedRows = [...optimisticParticipants];
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
				try {
					const message = await modifyPayment(data);
					if (!("error" in message)) {
						//console.log(message);
						setSnackbar({
							children:
								action === "save"
									? "Udało się dodać płatność"
									: "Udało się usunąć płatność",
							severity: "success",
						});
					} else {
						setSnackbar({ children: message.error, severity: "error" });
					}
				} catch (error) {
					console.error("Błąd podczas aktualizacji płatności:", error);
					setSnackbar({
						children: "Wystąpił bład podczas komunikacją z bazą danych",
						severity: "error",
					});
				} finally {
					setSelectedRow(null);
				}
			}
		}
	};
	const handleDeleteClick = (row: GridRowModel) => () => {
		setSelectedRow(row);
		setDialogsOpen({ ...dialogsOpen, delete: true });
		//setRows(rows.filter((row) => row.id !== id));
		//console.log(row);
	};
	const handleChoice = async (value: string) => {
		//console.log(value);
		setDialogsOpen({ ...dialogsOpen, delete: false });
		if (value === "yes" && selectedRow !== null) {
			const copyRows = [...participants];
			const updatedRows = copyRows.filter((row) => row.id !== selectedRow.id);
			updateParticipantsOptimisticallyTransition(updatedRows);
			try {
				const message = await deleteParticipant(selectedRow.id);
				if (!("error" in message)) {
					setSnackbar({
						children: message.message,
						severity: "success",
					});
				} else {
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
		const copyRows = [...participants];
		const updatedRows = copyRows.map((row) =>
			row.id === newRow.id ? updatedRow : row
		);
		const findRow = updatedRows.find((row) => row.id === newRow.id);
		if (findRow) {
			updateParticipantsOptimisticallyTransition(updatedRows as Participant[]);
			try {
				const message = await updateParticipant(updatedRow as Participant);
				if (!message.error) {
					setSnackbar({
						children: message.message,
						severity: "success",
					});
				} else {
					setSnackbar({ children: message.error, severity: "error" });
				}
			} catch (error) {
				setSnackbar({
					children: "Wystąpił bład podczas komunikacją z bazą danych",
					severity: "error",
				});
			}
			return newRow;
		}
	};
	const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
		setRowModesModel(newRowModesModel);
	};
	const CustomToolbar = () => {
		return (
			<Grid
				container
				width={"100%"}
				paddingTop={2}
				justifyContent='center'
				alignItems={"center"}
				mx={0}
				pb={2}
				spacing={1}
				borderBottom={1}
				borderColor={"rgba(224, 224, 224, 1)"}>
				{!edit && (
					<>
						<Grid size={{ xs: 12 }}>
							<Typography
								align='center'
								variant='h6'>
								{group.name} - {PolishDayName(getDay(date))}-{" "}
								{group.locationName}
							</Typography>
						</Grid>
						<Grid size={{ xs: isOwner || clubInfo.coachEditPrt ? 4 : 6 }}>
							<Button
								fullWidth
								variant='contained'
								size='medium'
								sx={{ height: "37px" }}
								onClick={() => {
									setColumnVisibilityModel((prev) => ({
										...prev,
										phoneNumber: !prev.phoneNumber,
										payment: !prev.payment,
										note: !prev.note,
										regulamin: !prev.regulamin,
										active: !prev.active,
										info: !prev.info,
										parentLastName: !prev.parentLastName,
										parentFirstName: !prev.parentFirstName,
										move: !prev.move,
									}));
									gridRef.current.scroll({ left: 0 });
									setMore((prev) => !prev);
								}}>
								<MoreVertIcon />
								{more ? "Mniej" : "Więcej"}
							</Button>
						</Grid>
						<Grid size={{ xs: isOwner || clubInfo.coachEditPrt ? 4 : 6 }}>
							<LocalizationProvider
								dateAdapter={AdapterDateFns}
								adapterLocale={pl}>
								<MobileDatePicker
									label='Wybierz dzień'
									value={date}
									minDate={parse(group.firstLesson, "dd-MM-yyyy", new Date())}
									maxDate={parse(group.lastLesson, "dd-MM-yyyy", new Date())}
									onChange={(value) => {
										if (value) setDate(value);
									}}
									sx={{ width: "100%" }}
									slotProps={{ textField: { size: "small" } }}
									shouldDisableDate={shouldDisableDay}
								/>
							</LocalizationProvider>
						</Grid>
						{(isOwner || clubInfo.coachEditPrt) && (
							<Grid size={{ xs: 4 }}>
								<Button
									fullWidth
									variant='contained'
									size='medium'
									sx={{ height: "37px" }}
									onClick={() => {
										setEdit(true);
										setColumnVisibilityModel({
											phoneNumber: true,
											actions: true,
											payment: true,
											note: true,
											regulamin: true,
											info: true,
											parentFirstName: true,
											parentLastName: true,
											move: true,
										});
									}}>
									<EditIcon />
									Edytuj
								</Button>
							</Grid>
						)}
					</>
				)}
				{edit && (
					<Grid size={{ xs: 12 }}>
						<Button
							fullWidth
							variant='outlined'
							size='medium'
							onClick={() => {
								setEdit(false),
									setColumnVisibilityModel({
										actions: false,
										phoneNumber: false,
										payment: false,
										note: false,
										regulamin: false,
										active: false,
										info: false,
										parentFirstName: false,
										parentLastName: false,
										move: false,
									});
								setMore(false);
								gridRef.current.scroll({ left: 0 });
							}}>
							<CheckIcon />
							Zakończ edycje
						</Button>
					</Grid>
				)}
			</Grid>
		);
	};
	const CustomFooter = () => {
		const attendance = optimisticParticipants.map((row) => row.attendance);
		const countMatchingDates = attendance.reduce((total, innerArray) => {
			// Sprawdź, czy w tablicy wewnętrznej istnieje element o danej dacie
			if (innerArray && Array.isArray(innerArray)) {
				const datePresent = innerArray.some(
					(item: Attendance) =>
						item.date === formatDate(date) && item.groupId === groupId
				);
				// Jeśli istnieje, zwiększ licznik
				if (datePresent) {
					return total + 1;
				}
				// W przeciwnym razie, zwróć aktualną wartość licznika
				return total;
			}
			return total;
		}, 0);
		const active = Array.isArray(optimisticParticipants)
			? optimisticParticipants.filter(
					(participant) => participant.active === true
			  ).length
			: 0;
		return (
			<Grid
				container
				height={25}
				width={"100%"}
				my={1}
				mx={0}
				py={0.5}
				borderTop={1}
				borderColor={"rgba(224, 224, 224, 1)"}
				spacing={0}>
				<Grid size={{ xs: 4 }}>
					<Typography
						variant='body1'
						align='center'>
						Obecnych:{" "}
						<span style={{ fontWeight: "bold" }}>
							{isNaN(countMatchingDates) ? 0 : countMatchingDates}
						</span>
						/{optimisticParticipants.length}
					</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography
						variant='body1'
						align='center'>
						Aktywnych:{" "}
						<span style={{ fontWeight: "bold" }}>
							{isNaN(active) ? 0 : active}
						</span>
						/{optimisticParticipants.length}
					</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Button
						onClick={handlePresentDialogOpen}
						fullWidth
						endIcon={<SearchIcon />}
						sx={{ p: 0 }}>
						Odrabianie
					</Button>
				</Grid>
			</Grid>
		);
	};
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
			minWidth: 90,
			editable: edit,
			flex: 1,
		},
		{
			field: "birthday",
			headerName: edit || more ? "Urodzony" : "",
			minWidth: more ? (edit ? 140 : 110) : 40,
			editable: edit,
			hideable: true,
			flex: 1,
			sortable: false,
			renderEditCell: (props: GridRenderCellParams) => (
				<PickDate
					{...props}
					gridRef={gridRef}
				/>
			),
			renderCell: (params) => {
				const year = params.value ? params.value.split("-")[2] : "";
				return (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							height: "100%",
						}}>
						{more ? (params.value ? params.value : "") : year}
					</Box>
				);
			},
		},
		{
			field: "attendance",
			headerName: "Obecność",
			maxWidth: 74,
			renderCell: (params) => {
				const participantAttendance = params.row.attendance;

				const isPresent = participantAttendance.find(
					(item: Attendance) =>
						item.date === formatDate(date) && item.groupId === groupId
				);
				const handlePresenceChange = async (event: any) => {
					const isChecked = event.target.checked;
					const updatedRows = [...participants];
					const rowIndex = updatedRows.findIndex(
						(row) => row.id === params.row.id
					);
					if (updatedRows[rowIndex].attendance) {
						try {
							const data = {
								groupId: groupId,
								participantId: params.row.id,
								date: formatDate(date),
								isChecked: isChecked,
							};
							if (isChecked) {
								updatedRows[rowIndex].attendance.push({
									date: formatDate(date),
									groupId: groupId,
									id: Math.random(),
									participant: params.row.id,
									belongs: true,
								});
							} else {
								updatedRows[rowIndex].attendance = updatedRows[
									rowIndex
								].attendance.filter(
									(item: Attendance) => item.date !== formatDate(date)
								);
							}
							updateParticipantsOptimisticallyTransition(updatedRows);
							const message = await updateAttendance(data);
							if (!("error" in message)) {
								setSnackbar({ children: message.message, severity: "success" });
							} else {
								setSnackbar({ children: message.error, severity: "error" });
							}
						} catch (error) {
							console.error("Błąd podczas aktualizacji danych:", error);
							setSnackbar({
								children: "Wystąpił bład podczas komunikacją z bazą danych",
								severity: "error",
							});
						}
					}
				};

				return (
					<Checkbox
						id={params.row.id}
						sx={{ width: "100%" }}
						checked={!!isPresent}
						onChange={(event) => handlePresenceChange(event)}
					/>
				);
			},

			sortable: false,
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

				return (
					<>
						{clubInfo.coachPayments || isOwner ? (
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
						) : (
							<>
								{Payed ? (
									<Box
										sx={{
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
											height: "100%",
										}}>
										<CheckIcon
											color='success'
											fontSize='small'
										/>
									</Box>
								) : (
									<Box
										sx={{
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
											height: "100%",
										}}>
										<CancelIcon
											color='error'
											fontSize='small'
										/>
									</Box>
								)}
							</>
						)}
					</>
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
			field: "info",
			headerName: "Info",
			width: 15,
			editable: false,
			sortable: false,
			hideable: true,
			renderCell: (params) => {
				return (
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							alignContent: "center",
							height: "100%",
						}}>
						<InfoOutlinedIcon
							onClick={() => router.push(`/participant/${params.row.id}`)}
						/>
					</div>
				);
			},
		},
		{
			field: "move",
			headerName: "Przenieś",
			width: 70,
			editable: false,
			sortable: false,
			hideable: true,
			renderCell: (params) => {
				return (
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							alignContent: "center",
							height: "100%",
							width: "100%",
						}}>
						<EditCalendarIcon onClick={handleMoveDialogOpen(params.row)} />
					</div>
				);
			},
		},
		{
			field: "regulamin",
			headerName: "Umowa",
			width: 70,
			editable: true,
			hideable: true,
			type: "boolean",
			sortable: false,
		},
		{
			field: "note",
			headerName: "Notatka",
			minWidth: 200,
			editable: edit,
			hideable: true,
			flex: 1,
			sortable: false,
		},
		{
			field: "active",
			headerName: "Aktywny",
			width: 70,
			editable: false,
			hideable: true,
			type: "boolean",
			sortable: false,
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
	];
	return (
		<>
			<StyledDataGrid
				key={optimisticParticipants.length}
				apiRef={gridRef}
				columns={columns}
				density='standard'
				rows={optimisticParticipants}
				//localeText={plPL.components.MuiDataGrid.defaultProps.localeText}
				disableColumnMenu
				editMode='row'
				slots={{ toolbar: CustomToolbar, footer: CustomFooter }}
				columnVisibilityModel={columnVisibilityModel}
				initialState={{
					columns: {
						columnVisibilityModel: {
							phoneNumber: false,
							actions: false,
							payment: false,
							note: false,
							active: false,
							info: false,
							parentFirstName: false,
							parentLastName: false,
						},
					},
				}}
				processRowUpdate={processRowUpdate}
				rowModesModel={rowModesModel}
				onRowModesModelChange={handleRowModesModelChange}
				onRowEditStop={handleRowEditStop}
				//getRowClassName={(params) => `row-${params.row.status}`}
			/>
			{!!snackbar && (
				<Snackbar
					open
					anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
					autoHideDuration={2000}
					sx={{ position: "absolute", bottom: 90, zIndex: 20 }}
					onClose={handleCloseSnackbar}>
					<Alert
						{...snackbar}
						onClose={handleCloseSnackbar}
					/>
				</Snackbar>
			)}
			{selectedRow && (
				<DialogMoveToGroup
					open={dialogsOpen.move}
					row={selectedRow}
					onClose={handleMoveDialogChoice}
					locWithGroups={locWithGroups}
					groupId={groupId}
				/>
			)}
			{selectedRow && (
				<DialogDelete
					open={dialogsOpen.delete}
					row={selectedRow}
					onClose={handleChoice}
				/>
			)}
			{selectedRow && (
				<DialogPay
					open={dialogsOpen.pay}
					row={selectedRow}
					onClose={handleAddPayment}
				/>
			)}
			<DialogPresent
				open={dialogsOpen.present}
				onClose={handlePresentDialogChoice}
				groupId={groupId}
				group={group}
			/>
		</>
	);
};

export default ParticipantList;

/*		
	onCellDoubleClick={() => {
		if (isOwner || clubInfo.coachEditPrt) {
			setEdit(true);
			setColumnVisibilityModel({
				actions: true,
			});
		}
	}}
*/
