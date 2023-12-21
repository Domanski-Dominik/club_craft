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
} from "@mui/material";
import type { Attendance, Participant } from "@/types/type";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SaveIcon from "@mui/icons-material/Save";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import pl from "date-fns/locale/pl";
import format from "date-fns/format";
import { MobileDatePicker, LocalizationProvider } from "@mui/x-date-pickers";

type Props = {
	participants: Participant[];
	groupId: number;
};

export interface DialogD {
	open: boolean;
	row: GridRowModel | null;
	onClose: (value: string) => void;
}
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
function DialogD(props: DialogD) {
	const { onClose, open, row } = props;

	const handleClose = () => {
		onClose("no");
	};
	const handleOptionClick = (value: string) => {
		onClose(value);
	};
	if (row === null) {
		return null;
	}
	return (
		<Dialog
			open={open}
			onClose={handleClose}>
			<DialogTitle>Czy chcesz usunąć uczestnika?</DialogTitle>
			<DialogContent
				dividers>{`Usuń ${row.firstName} ${row.lastName} z bazy danych`}</DialogContent>
			<DialogActions>
				<Button onClick={() => handleOptionClick("no")}>No</Button>
				<Button onClick={() => handleOptionClick("yes")}>Yes</Button>
			</DialogActions>
		</Dialog>
	);
}

const ParticipantList = ({ participants, groupId }: Props) => {
	const [selectedRow, setSelectedRow] = React.useState<GridRowModel | null>(
		null
	);
	const gridRef = useGridApiRef();
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [edit, setEdit] = useState(false);
	const [date, setDate] = useState<Date>(new Date());
	const [rows, setRows] = React.useState<(Participant | GridValidRowModel)[]>(
		sortAndAddNumbers(participants, groupId)
	);
	const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
		{}
	);
	const [columnVisibilityModel, setColumnVisibilityModel] =
		useState<GridColumnVisibilityModel>({
			phoneNumber: false,
			actions: false,
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

	const handleDeleteClick = (id: GridRowId, row: GridRowModel) => () => {
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
	const CustomFooter = () => {
		return (
			<Box
				borderTop={1}
				height={60}
				paddingTop={2}
				borderColor='#e0e0e0'>
				{!edit && (
					<>
						<Button
							variant='outlined'
							size='medium'
							sx={{ marginLeft: 1, marginRight: 1 }}
							onClick={() => {
								setEdit(true);
								setColumnVisibilityModel({ phoneNumber: true, actions: true });
							}}>
							<EditIcon />
							Edytuj
						</Button>
						<Button
							variant='outlined'
							size='medium'
							sx={{ marginRight: 1 }}
							onClick={() => {
								setColumnVisibilityModel((prev) => ({
									...prev,
									phoneNumber: !prev.phoneNumber,
								}));
								gridRef.current.scroll({ left: 0 });
							}}>
							<MoreVertIcon />
							Więcej
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
										console.log(newDate);
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
									});
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
						onClick={handleDeleteClick(id, row)}
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
			field: "phoneNumber",
			headerName: "Telefon",
			minWidth: 100,
			editable: edit,
			hideable: true,
			flex: 1,
			sortable: false,
		},
		{
			field: "attendance",
			headerName: "Obecność",
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
							console.log(message);
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
						checked={!!isPresent}
						onChange={(event) => handlePresenceChange(event)}
					/>
				);
			},
			maxWidth: 100,
			sortable: false,
		},
	];
	return (
		<>
			<DataGrid
				apiRef={gridRef}
				columns={columns}
				rows={rows}
				localeText={plPL.components.MuiDataGrid.defaultProps.localeText}
				disableColumnMenu
				autoHeight
				editMode='row'
				slots={{ footer: CustomFooter }}
				columnVisibilityModel={columnVisibilityModel}
				initialState={{
					columns: {
						columnVisibilityModel: {
							phoneNumber: false,
							actions: false,
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
					autoHideDuration={5000}
					sx={{ position: "absolute", bottom: 90, zIndex: 20 }}
					onClose={handleCloseSnackbar}>
					<Alert
						{...snackbar}
						onClose={handleCloseSnackbar}
					/>
				</Snackbar>
			)}
			{selectedRow && (
				<DialogD
					open={dialogOpen}
					row={selectedRow}
					onClose={handleChoice}
				/>
			)}
		</>
	);
};

export default ParticipantList;
