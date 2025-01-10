"use client";
import React, { useState } from "react";
import {
	StyledAccordion,
	StyledAccordionDetails,
	StyledAccordionSummary,
	StyledAccordionSummaryNoExpand,
	StyledDataGrid,
} from "../styled/StyledComponents";
import DeleteIcon from "@mui/icons-material/Delete";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import { Box, Button, Typography } from "@mui/material";
import {
	GridActionsCellItem,
	GridColDef,
	GridFooter,
	GridFooterContainer,
	GridPagination,
	GridRenderCellParams,
	GridRowModel,
	GridToolbar,
	GridToolbarContainer,
	GridValidRowModel,
} from "@mui/x-data-grid";
import PolishDayName from "@/functions/PolishDayName";
import DialogAwaitingMoveToGroup from "../dialogs/DialogAwaitingGroups";
import ResponsiveSnackbar from "../Snackbars/Snackbar";
import {
	AcceptAwaitingParticipantToParticipants,
	DeleteAwaitingParticipant,
} from "@/server/participant-actions";
import DialogDelete from "../dialogs/DialogDelete";

interface AwaitingProps {
	participants: any;
	locWithGroups: any;
}

const Awaiting = (props: AwaitingProps) => {
	const [selectedRow, setSelectedRow] = useState<GridValidRowModel | null>();
	const [openDialog, setOpenDialog] = useState(false);
	const [deleteDialog, setDeleteDialog] = useState(false);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "error" | "warning" | "info" | "success";
	}>({ open: false, message: "", severity: "info" });
	const handleCloseSnackbar = () => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	};
	const getGroupDetails = (groupId: number) => {
		for (const location of props.locWithGroups) {
			const group = location.groups.find((group: any) => group.id === groupId);
			if (group) {
				const terms = location.terms
					.filter((term: any) => term.groupId === groupId)
					.map((term: any) => ({
						dayOfWeek: term.dayOfWeek,
						timeS: term.timeS,
						timeE: term.timeE,
						locationName: location.name,
					}));
				return { name: group.name, terms };
			}
		}
		return null;
	};
	const handleMoveDialogOpen = (row: GridRowModel) => () => {
		setSelectedRow(row);
		setOpenDialog(true);
	};
	const handleCloseMoveDialog = (message: string) => {
		setOpenDialog(false);
		setSnackbar({
			open: true,
			message: message,
			severity: "success",
		});
	};
	const AcceptAwaitingParticipant = async (id: number) => {
		try {
			const message = await AcceptAwaitingParticipantToParticipants(id);
			if ("error" in message) {
				setSnackbar({
					open: true,
					message: `${message.error}`,
					severity: "error",
				});
			} else {
				setSnackbar({
					open: true,
					message: message.message,
					severity: "success",
				});
			}
		} catch (error) {}
	};
	const handleDeleteClick = (row: GridRowModel) => () => {
		setSelectedRow(row);
		setDeleteDialog(true);
	};
	const handleChoice = async (value: string) => {
		//console.log(value);
		setDeleteDialog(false);
		if (value === "yes" && selectedRow !== null) {
			try {
				const message = await DeleteAwaitingParticipant(selectedRow?.id);
				if (!("error" in message)) {
					setSnackbar({
						open: true,
						message: message.message,
						severity: "success",
					});
				} else {
					setSnackbar({
						open: true,
						message: `${message.error}`,
						severity: "error",
					});
				}
			} catch (error) {
				setSnackbar({
					open: true,
					message: "Wystąpił bład podczas komunikacją z bazą danych",
					severity: "error",
				});
			}
		} else {
			setSelectedRow(null);
		}
	};
	const CustomToolbar = () => {
		return (
			<GridToolbarContainer>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<Box
						sx={{
							width: 10,
							height: 10,
							ml: 1,
							borderRadius: "50%",
							backgroundColor: "#00c853",
							display: "inline-block",
						}}
					/>
					<Typography
						variant='body2'
						ml={2}>
						Uczestnik gotowy do zaakceptowania
					</Typography>
				</Box>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<Box
						sx={{
							width: 10,
							height: 10,
							ml: 1,
							borderRadius: "50%",
							backgroundColor: "#ffc107",
							display: "inline-block",
						}}
					/>
					<Typography
						variant='body2'
						ml={2}>
						Uczestnik musi zaakceptować lub wybrać inną grupę
					</Typography>
				</Box>
			</GridToolbarContainer>
		);
	};

	const col: GridColDef[] = [
		{
			field: "edit",
			headerName: "#",
			width: 60,
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
						{rowIndex}{" "}
						<Box
							sx={{
								width: 10,
								height: 10,
								ml: 1,
								borderRadius: "50%",
								backgroundColor: params.value ? "#ffc107" : "#00c853",
								display: "inline-block",
							}}
						/>
					</Box>
				);
			},
		},
		{
			field: "firstName",
			headerName: "Nazwisko",
			minWidth: 100,
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
			field: "lastName",
			headerName: "Nazwisko",
			minWidth: 100,
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
			headerName: "Data urodzenia",
			minWidth: 100,
			flex: 1,
			sortComparator: (v1, v2) => {
				// Parse the date strings in dd-mm-yyyy format
				const date1 = new Date(v1.split("-").reverse().join("-"));
				const date2 = new Date(v2.split("-").reverse().join("-"));
				return date1.getTime() - date2.getTime(); // Compare the timestamps
			},
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
			field: "groupId",
			headerName: "Wybrana grupa",
			minWidth: 300,
			sortable: false,
			flex: 2,
			renderCell: (params: GridRenderCellParams) => {
				const groupDetails = getGroupDetails(params.row.groupId);

				const groupText = groupDetails ? (
					<Typography
						sx={{ my: 0.5 }}
						variant='body2'>
						<span style={{ fontWeight: "bold" }}>{groupDetails.name}, </span>
						{groupDetails.terms.map((term: any, index: number) => (
							<React.Fragment key={index}>
								<br />
								<span style={{ color: "darkviolet" }}>{term.locationName}</span>
								{", "}
								{PolishDayName(term.dayOfWeek)} {term.timeS}-{term.timeE}
							</React.Fragment>
						))}
					</Typography>
				) : (
					<Typography color='error'>Nie znaleziono grupy</Typography>
				);

				return (
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							height: "100%",
						}}>
						<Box
							sx={{
								width: 265,
								whiteSpace: "pre-wrap",
							}}>
							{groupText}
						</Box>

						<GridActionsCellItem
							icon={<EditCalendarIcon />}
							label='Dodaj grupy'
							onClick={handleMoveDialogOpen(params.row)}
							color='inherit'
						/>
					</Box>
				);
			},
		},
		{
			field: "allow",
			headerName: "Przymij",
			sortable: false,
			renderCell: (params) => (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						height: "100%",
					}}>
					<Button
						variant='outlined'
						disabled={params.row.edit}
						onClick={() => AcceptAwaitingParticipant(params.row.id)}>
						Zaakceptuj
					</Button>
				</Box>
			),
		},
		{
			field: "deny",
			headerName: "Odrzuć",
			sortable: false,
			renderCell: (params) => (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						height: "100%",
					}}>
					<Button
						variant='outlined'
						disabled={params.row.edit}
						startIcon={<DeleteIcon />}
						color='error'
						onClick={handleDeleteClick(params.row)}>
						Odrzuć
					</Button>
				</Box>
			),
		},

		{
			field: "phoneNumber",
			headerName: "Telefon",
			minWidth: 100,
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
			field: "sended",
			headerName: "Data zgłoszenia",
			minWidth: 140,
			sortComparator: (v1, v2) => {
				// Parse the date strings in dd-mm-yyyy format
				const date1 = new Date(v1.split("-").reverse().join("-"));
				const date2 = new Date(v2.split("-").reverse().join("-"));
				return date1.getTime() - date2.getTime(); // Compare the timestamps
			},
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
			minWidth: 150,
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
			field: "email",
			headerName: "Email",
			minWidth: 200,
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
			<StyledAccordion
				sx={{
					width: "100%",
					height: {
						xs: "calc(100vh - 75px - 100px)",
						sm: "calc(100vh - 90px - 25px)",
					},
				}}
				expanded>
				<StyledAccordionSummaryNoExpand>
					<Typography
						color='white'
						variant='h6'>
						Oczekujący uczestnicy
					</Typography>
				</StyledAccordionSummaryNoExpand>
				<StyledAccordionDetails>
					<Box
						sx={{
							maxHeight: {
								xs: "calc(100vh - 75px - 100px - 80px)",
								sm: "calc(100vh - 90px - 25px - 80px)",
							},
							display: "flex",
							flexDirection: "column",
						}}>
						<StyledDataGrid
							columns={col}
							rows={props.participants}
							disableColumnMenu
							getRowHeight={() => "auto"}
							slots={{
								toolbar: CustomToolbar,
							}}
							pagination
							pageSizeOptions={[10, 20, 50, 100]} // Opcjonalne: Rozmiary stron
							initialState={{
								pagination: {
									paginationModel: { page: 0, pageSize: 100 },
								},
							}}
						/>
					</Box>
				</StyledAccordionDetails>
			</StyledAccordion>
			{selectedRow && (
				<DialogAwaitingMoveToGroup
					locWithGroups={props.locWithGroups}
					open={openDialog}
					row={selectedRow}
					onClose={(message) => handleCloseMoveDialog(message)}
				/>
			)}
			<ResponsiveSnackbar
				open={snackbar.open}
				onClose={handleCloseSnackbar}
				message={snackbar.message}
				severity={snackbar.severity}
			/>
			{selectedRow && (
				<DialogDelete
					open={deleteDialog}
					row={selectedRow}
					onClose={handleChoice}
				/>
			)}
		</>
	);
};

export default Awaiting;
