import { useState, useEffect } from "react";
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
  Checkbox,
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
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import DialogPresent from "../dialogs/DialogPresent";
import { darken, lighten, styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { useMutation } from "@tanstack/react-query";

type Props = {
	participants: Participant[];
	groupId: number;
	workOutPrt: Participant[] | [];
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
		return { ...row, num: index + 1, groupId: groupId, status: "normal" };
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
const getBackgroundColor = (color: string, mode: string) =>
	mode === "dark" ? darken(color, 0.7) : lighten(color, 0.7);

const getHoverBackgroundColor = (color: string, mode: string) =>
	mode === "dark" ? darken(color, 0.7) : lighten(color, 0.6);

const getSelectedBackgroundColor = (color: string, mode: string) =>
	mode === "dark" ? darken(color, 0.5) : lighten(color, 0.5);

const getSelectedHoverBackgroundColor = (color: string, mode: string) =>
	mode === "dark" ? darken(color, 0.4) : lighten(color, 0.4);

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
	"& .row-info": {
		backgroundColor: getBackgroundColor(
			theme.palette.info.main,
			theme.palette.mode
		),
		"&:hover": {
			backgroundColor: getHoverBackgroundColor(
				theme.palette.info.main,
				theme.palette.mode
			),
		},
		"&.Mui-selected": {
			backgroundColor: getSelectedBackgroundColor(
				theme.palette.info.main,
				theme.palette.mode
			),
			"&:hover": {
				backgroundColor: getSelectedHoverBackgroundColor(
					theme.palette.info.main,
					theme.palette.mode
				),
			},
		},
	},
	"& .row-external": {
		backgroundColor: getBackgroundColor(
			theme.palette.warning.main,
			theme.palette.mode
		),
		"&:hover": {
			backgroundColor: getHoverBackgroundColor(
				theme.palette.warning.main,
				theme.palette.mode
			),
		},
		"&.Mui-selected": {
			backgroundColor: getSelectedBackgroundColor(
				theme.palette.warning.main,
				theme.palette.mode
			),
			"&:hover": {
				backgroundColor: getSelectedHoverBackgroundColor(
					theme.palette.warning.main,
					theme.palette.mode
				),
			},
		},
	},
	"& .row-error": {
		backgroundColor: getBackgroundColor(
			theme.palette.error.main,
			theme.palette.mode
		),
		"&:hover": {
			backgroundColor: getHoverBackgroundColor(
				theme.palette.error.main,
				theme.palette.mode
			),
		},
		"&.Mui-selected": {
			backgroundColor: getSelectedBackgroundColor(
				theme.palette.error.main,
				theme.palette.mode
			),
			"&:hover": {
				backgroundColor: getSelectedHoverBackgroundColor(
					theme.palette.error.main,
					theme.palette.mode
				),
			},
		},
	},
}));

const ParticipantList = ({ participants, groupId, workOutPrt }: Props) => {
	const [selectedRow, setSelectedRow] = useState<GridRowModel | null>(null);
	const gridRef = useGridApiRef();
	const [workOutParticipants, setWorkOutParticpants] = useState<
		Participant[] | []
	>(workOutPrt);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [payDialogOpen, setPayDialogOpen] = useState(false);
	const [presentDiaolgOpen, setPresentDialogOpen] = useState(false);
	const [edit, setEdit] = useState(false);
	const [more, setMore] = useState(false);
	const [date, setDate] = useState<Date>(new Date());
	const [rows, setRows] = useState<(Participant | GridValidRowModel)[]>(
		sortAndAddNumbers(participants, groupId)
	);
	const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
	const [columnVisibilityModel, setColumnVisibilityModel] =
		useState<GridColumnVisibilityModel>({
			phoneNumber: false,
			actions: false,
			payment: false,
			note: false,
			regulamin: false,
			active: false,
		});
	const [snackbar, setSnackbar] = useState<Pick<
		AlertProps,
		"children" | "severity"
	> | null>(null);

	const handleCloseSnackbar = () => setSnackbar(null);

	useEffect(() => {
		if (workOutParticipants.length > 0) {
			// Znajdź uczestników, którzy są obecni w danym dniu
			const participantsToAdd = workOutParticipants.filter((p) =>
				p.attendance?.some(
					(a) => a.date === formatDate(date) && a.groupId === groupId
				)
			);

			// Znajdź unikalnych uczestników, którzy jeszcze nie są w tablicy rows
			const uniqueParticipantsToAdd = participantsToAdd.filter(
				(participant) => !rows.some((row) => row.id === participant.id)
			);
			console.log(uniqueParticipantsToAdd);
			// Zaktualizuj tablicę rows, dodając nowych uczestników
			setRows((prevRows) => [
				...prevRows,
				...uniqueParticipantsToAdd.map((p) => ({
					...p,
					status: "info",
				})),
			]);
		}
	}, [workOutParticipants]);

	const handleDateChange = (newDate: Date | null) => {
		if (newDate) {
			if (workOutParticipants.length > 0) {
				const updatedRows = [...rows];
				const participantsToRemove = workOutParticipants.filter((p) => {
					return !p.attendance?.some(
						(a) => a.date === formatDate(newDate) && a.groupId === groupId
					);
				});
				participantsToRemove.forEach((p) => {
					const indexToRemove = rows.findIndex((row) => row.id === p.id);
					if (indexToRemove !== -1) {
						updatedRows.splice(indexToRemove, 1);
					}
				});
				const participantsToAdd = workOutParticipants.filter((p) => {
					return p.attendance?.some(
						(a) => a.date === formatDate(newDate) && a.groupId === groupId
					);
				});
				participantsToAdd.forEach((p) => {
					// Sprawdź, czy uczestnik już istnieje w updatedRows
					const exists = updatedRows.some((row) => row.id === p.id);

					if (!exists) {
						// Jeśli nie istnieje, dodaj uczestnika
						updatedRows.push({
							...p,
							status: "info", // Ustaw dowolny status
						});
					}
				});

				setRows(updatedRows);
			}
			setDate(newDate);
		}
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
  const updateAttendaceMutation = useMutation({
    mutationKey: ["attendance"],
    mutationFn: updateAttendance,
    onSuccess: (data) => console.log("Updated", data),
  });
  async function updateAttendance(info: any) {
    console.log(info);
    fetch(`/api/presence/${groupId}/${info.participantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: formatDate(date),
        isChecked: info.isChecked,
      }), // Przekaż zaktualizowane dane uczestnika
    }).then((res) => res.json());
  }
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
	const handlePresentDialogOpen = () => {
		setPresentDialogOpen(true);
	};
	const handlePresentDialogChoice = (participant: Participant | null) => {
		console.log(participant);
		setPresentDialogOpen(false);

		if (participant !== null) {
			setRows([...rows, { ...participant, status: "info" }]);
		}
	};
	const handleAddPayment = async (
		form: FormPay | null,
		row: GridRowModel | null,
		action: "save" | "delete" | null
	) => {
		//console.log(form, row);
		setPayDialogOpen(false);
		if (form !== null && row !== null && action !== null) {
			try {
				if (selectedRow) {
					const response = await fetch(`/api/payment/${selectedRow.id}`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							form,
							action,
						}), // Przekaż zaktualizowane dane uczestnika
					});
					const message = await response.json();
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
    row: GridRowModel | null,
    action: "save" | "delete" | null
  ) => {
    //console.log(form, row);
    setPayDialogOpen(false);
    if (form !== null && row !== null && action !== null) {
      try {
        if (selectedRow) {
          const response = await fetch(`/api/payment/${selectedRow.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              form,
              action,
            }), // Przekaż zaktualizowane dane uczestnika
          });
          const message = await response.json();
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
							console.log(updatedRows);
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
				const response = await fetch(`/api/participant/${selectedRow.id}`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(selectedRow), // Przekaż zaktualizowane dane uczestnika
				});
				const message = await response.json();
				if (response.ok) {
					//console.log(message);
					setSnackbar({
						children: message.message,
						severity: "success",
					});
					setRows(rows.filter((row) => row.id !== selectedRow.id));
				} else {
					//console.log(message);
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
				const response = await fetch(`/api/participant/${newRow.id}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(updatedRow), // Przekaż zaktualizowane dane uczestnika
				});
				const message = await response.json();
				if (response.ok) {
					//console.log(message);
					setSnackbar({
						children: message.message,
						severity: "success",
					});
					setRows(sortAndAddNumbers(updatedRows, groupId));
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
	const CustomToolbar = () => {
		return (
			<Grid
				container
				height={60}
				width={"100%"}
				paddingTop={2}
				justifyContent='center'
				alignItems={"center"}
				mx={0}
				mb={1}
				spacing={1}>
				{!edit && (
					<>
						<Grid xs={4}>
							<Button
								fullWidth
								variant='outlined'
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
									});
								}}>
								<EditIcon />
								Edytuj
							</Button>
						</Grid>
						<Grid xs={4}>
							<Button
								fullWidth
								variant='outlined'
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
									}));
									gridRef.current.scroll({ left: 0 });
									setMore((prev) => !prev);
								}}>
								<MoreVertIcon />
								{more ? "Mniej" : "Więcej"}
							</Button>
						</Grid>
						<Grid xs={4}>
							<LocalizationProvider
								dateAdapter={AdapterDateFns}
								adapterLocale={pl}>
								<MobileDatePicker
									label='Wybierz dzień'
									value={date}
									disableFuture
									onChange={handleDateChange}
									sx={{ width: "100%" }}
									slotProps={{ textField: { size: "small" } }}
								/>
							</LocalizationProvider>
						</Grid>
					</>
				)}
				{edit && (
					<Grid xs={12}>
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
		const attendance = rows.map((row) => row.attendance);
		const countMatchingDates = attendance.reduce((total, innerArray) => {
			// Sprawdź, czy w tablicy wewnętrznej istnieje element o danej dacie
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
		}, 0);
		const active = rows.filter(
			(participant) => participant.active === true
		).length;
		return (
			<Grid
				container
				height={20}
				width={"100%"}
				my={1}
				mx={0}
				py={0.5}
				borderTop={1}
				borderColor={"rgba(224, 224, 224, 1)"}
				spacing={0.1}>
				<Grid xs={4}>
					<Typography
						variant='body1'
						align='center'>
						Obecnych:{" "}
						<span style={{ fontWeight: "bold" }}>{countMatchingDates}</span>/
						{rows.length}
					</Typography>
				</Grid>
				<Grid xs={4}>
					<Typography
						variant='body1'
						align='center'>
						Aktywnych: <span style={{ fontWeight: "bold" }}>{active}</span>/
						{rows.length}
					</Typography>
				</Grid>
				<Grid xs={4}>
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
		},
		{
			field: "actions",
			type: "actions",
			headerName: "Akcje",
			width: 80,
			cellClassName: "actions",
			getActions: ({ id, row }) => {
				const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
                    return {
                      ...row,
                      payments: updatedPayments,
                    };
                  }
                }
                return row;
              });
              console.log(updatedRows);
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
        const response = await fetch(`/api/participant/${selectedRow.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedRow), // Przekaż zaktualizowane dane uczestnika
        });
        const message = await response.json();
        if (response.ok) {
          //console.log(message);
          setSnackbar({
            children: message.message,
            severity: "success",
          });
          setRows(rows.filter((row) => row.id !== selectedRow.id));
        } else {
          //console.log(message);
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
        const response = await fetch(`/api/participant/${newRow.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedRow), // Przekaż zaktualizowane dane uczestnika
        });
        const message = await response.json();
        if (response.ok) {
          //console.log(message);
          setSnackbar({
            children: message.message,
            severity: "success",
          });
          setRows(sortAndAddNumbers(updatedRows, groupId));
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
  const CustomToolbar = () => {
    return (
      <Box height={60} paddingTop={2} mb={1}>
        {!edit && (
          <>
            <Button
              variant="outlined"
              size="medium"
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
              variant="outlined"
              size="medium"
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
                label="Wybierz dzień"
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
              variant="outlined"
              size="medium"
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
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(row)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
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
                <Typography variant="body2" fontWeight="bold">
                  {Payed.amount}
                </Typography>
              ) : (
                <Typography variant="body2" fontWeight="bold" color="error">
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
			field: "regulamin",
			headerName: "Umowa",
			width: 70,
			editable: true,
			hideable: true,
			type: "boolean",
			sortable: false,
		},
		{
			field: "attendance",
			headerName: "Obecność",
			maxWidth: 74,
			renderCell: (params) => {
				const participantAttendance = params.row.attendance;
            {Payed ? (
              <GridActionsCellItem
                icon={<CreditCardIcon />}
                label="Dodaj płatność"
                onClick={handlePayDialogOpen(params.row)}
                color="inherit"
              />
            ) : (
              <GridActionsCellItem
                icon={<AddCardIcon />}
                label="Dodaj płatność"
                onClick={handlePayDialogOpen(params.row)}
                color="inherit"
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
					(item: Attendance) =>
						item.date === formatDate(date) && item.groupId === groupId
				);
        const isPresent = participantAttendance.find(
          (item: Attendance) => item.date === formatDate(date)
        );

				const handlePresenceChange = async (event: any) => {
					//console.log(event.target.checked);
					const isChecked = event.target.checked;
					const updatedRows = [...rows];
					// Znajdź indeks wiersza dla którego chcesz zaktualizować attendance
					const rowIndex = updatedRows.findIndex(
						(row) => row.id === params.row.id
					);

					if (isChecked) {
						// Jeśli isChecked to true, dodaj nowy obiekt Attendance
						updatedRows[rowIndex].attendance.push({
							date: formatDate(date),
							groupId: groupId,
						});
					} else {
						// Jeśli isChecked to false, usuń obiekt Attendance o określonej dacie
						updatedRows[rowIndex].attendance = updatedRows[
							rowIndex
						].attendance.filter(
							(item: Attendance) => item.date !== formatDate(date)
						);
						if (updatedRows[rowIndex].status === "info") {
							// Usuń uczestnika z workOutPrt
							const updatedWorkOutPrt = workOutPrt.filter(
								(participant) => participant.id !== updatedRows[rowIndex].id
							);

							// Usuń uczestnika z rows
							updatedRows.splice(rowIndex, 1);

							// Ustaw zaktualizowane wartości
							setRows(updatedRows);
							setWorkOutParticpants(updatedWorkOutPrt);
						}
					}
					try {
						const response = await fetch(
							`/api/presence/${groupId}/${params.row.id}`,
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
							setSnackbar({
								children: message.message,
								severity: "success",
							});
						} else {
							//console.log(message);
							const updatedRows = [...rows];
							// Znajdź indeks wiersza dla którego chcesz zaktualizować attendance
							const rowIndex = updatedRows.findIndex(
								(row) => row.id === params.row.id
							);
        const handlePresenceChange = async (event: any) => {
          //console.log(event.target.checked);
          const isChecked = event.target.checked;
          /*updateAttendaceMutation.mutate({
            participantId: params.row.id,
            isChecked: isChecked,
          });*/
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

							if (!isChecked) {
								// Jeśli isChecked to true, dodaj nowy obiekt Attendance
								updatedRows[rowIndex].attendance.push({
									date: formatDate(date),
									groupId: groupId,
								});
							} else {
								// Jeśli isChecked to false, usuń obiekt Attendance o określonej dacie
								updatedRows[rowIndex].attendance = updatedRows[
									rowIndex
								].attendance.filter(
									(item: Attendance) => item.date !== formatDate(date)
								);
							}
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
              //console.log(message);
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
		{
			field: "active",
			headerName: "Aktywny",
			width: 70,
			editable: false,
			hideable: true,
			type: "boolean",
			sortable: false,
		},
	];
	return (
		<>
			<StyledDataGrid
				apiRef={gridRef}
				columns={columns}
				density='compact'
				rows={rows}
				localeText={plPL.components.MuiDataGrid.defaultProps.localeText}
				disableColumnMenu
				getRowHeight={() => "auto"}
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
						},
					},
				}}
				onCellDoubleClick={() => {
					setEdit(true);
					gridRef.current.scroll({ left: 0 });
					setColumnVisibilityModel({
						actions: true,
					});
				}}
				processRowUpdate={processRowUpdate}
				rowModesModel={rowModesModel}
				onRowModesModelChange={handleRowModesModelChange}
				onRowEditStop={handleRowEditStop}
				getRowClassName={(params) => `row-${params.row.status}`}
			/>
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
        density="compact"
        rows={rows}
        localeText={plPL.components.MuiDataGrid.defaultProps.localeText}
        disableColumnMenu
        getRowHeight={() => "auto"}
        editMode="row"
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
        onCellDoubleClick={() => {
          setEdit(true);
          gridRef.current.scroll({ left: 0 });
          setColumnVisibilityModel({
            actions: true,
          });
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
					onClose={handleAddPayment}
				/>
			)}
			<DialogPresent
				open={presentDiaolgOpen}
				onClose={handlePresentDialogChoice}
			/>
		</>
	);
      {!!snackbar && (
        <Snackbar
          open
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          autoHideDuration={2000}
          sx={{ position: "absolute", bottom: 0, zIndex: 20 }}
          onClose={handleCloseSnackbar}>
          <Alert {...snackbar} onClose={handleCloseSnackbar} />
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
