"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Loading from "@/context/Loading";
import {
	useDeleteGroup,
	useDeleteLoc,
	useUpdateGroup,
} from "@/hooks/scheduleHooks";
import {
	DataGrid,
	GridColDef,
	useGridApiContext,
	GridRenderCellParams,
	GridRowModel,
} from "@mui/x-data-grid";
import PolishDayName, { ColorName } from "@/functions/PolishDayName";
import {
	Box,
	Select,
	SelectChangeEvent,
	AlertProps,
	Alert,
	Snackbar,
	Typography,
	Fab,
	Accordion,
	Stack,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CachedOutlinedIcon from "@mui/icons-material/CachedOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	StyledAccordionDetails,
	StyledAccordionSummary,
} from "@/components/styled/StyledComponents";
import { Group, Location } from "@/types/type";
import DialogDeleteLoc from "@/components/dialogs/DialogDeleteLoc";
import DialogDeleteGroup from "@/components/dialogs/DialogDeleteGroup";
import { StyledDataGrid } from "@/components/styled/StyledDataGrid";
import StandardError from "@/components/errors/Standard";

function SelectColorInputCell(props: GridRenderCellParams) {
	const { id, value, field } = props;
	const apiRef = useGridApiContext();

	const handleChange = async (event: SelectChangeEvent) => {
		await apiRef.current.setEditCellValue({
			id,
			field,
			value: event.target.value,
		});
		apiRef.current.stopCellEditMode({ id, field });
	};

	return (
		<Select
			value={value}
			onChange={handleChange}
			size='small'
			sx={{ height: 1 }}
			native
			autoFocus>
			<option value='#3788d8'>Niebieski</option>
			<option value='#228B22'>Zielony</option>
			<option value='#9400D3'>Fioletowy</option>
			<option value='#DC143C'>Czerwony</option>
			<option value='#FFD700'>Złoty</option>
			<option value='#FF8C00'>Pomarańczowy</option>
			<option value='#00ffc8'>Cyjan</option>
			<option value='#f200ff'>Różowy</option>
		</Select>
	);
}

const renderColorInputCell: GridColDef["renderCell"] = (params) => {
	return <SelectColorInputCell {...params} />;
};

const ManageGroups = () => {
	const [deleteLoc, setDeleteLoc] = useState<Location | null>(null);
	const [dialogLocOpen, setDialogLocOpen] = useState(false);
	const [dialogGroupOpen, setDialogGroupOpen] = useState(false);
	const [deleteGroup, setDeleteGroup] = useState<Group | null>(null);
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const groups = useQuery({
		queryKey: ["groups"],
		enabled: !!session,
		queryFn: () =>
			fetch(
				`/api/groups/calendar/${session?.user.role}/${session?.user.club}/${session?.user.id}`
			).then((res) => res.json()),
	});
	const locs = useQuery({
		queryKey: ["locs"],
		enabled: !!session,
		queryFn: () =>
			fetch(`/api/loc/club/${session?.user.club}/owner`).then((res) =>
				res.json()
			),
	});
	const deleteLocation = useDeleteLoc();
	const updateGr = useUpdateGroup();
	const deleteGr = useDeleteGroup();
	const [snackbar, setSnackbar] = useState<Pick<
		AlertProps,
		"children" | "severity"
	> | null>(null);
	const handleCloseSnackbar = () => setSnackbar(null);
	const queryClient = useQueryClient();
	const router = useRouter();
	console.log(groups.data);
	const processRowUpdateGroup = async (
		newRow: GridRowModel,
		oldRow: GridRowModel
	) => {
		const updatedRow = { ...newRow };
		const updatedRows = groups.data.map((row: any) =>
			row.id === newRow.id ? updatedRow : row
		);
		//console.log(newRow, oldRow);
		const findRow = updatedRows.find((row: any) => row.id === newRow.id);
		if (findRow) {
			try {
				//console.log(updatedRow);
				const data = {
					name: updatedRow.name,
					id: updatedRow.id,
					color: updatedRow.color,
				};
				const message = await updateGr.mutateAsync(data);
				if (!message.error) {
					//console.log(message);
					setSnackbar({
						children: message.message,
						severity: "success",
					});

					queryClient.invalidateQueries({
						queryKey: ["days", `${updatedRow.locationId}`],
						refetchType: "all",
					});
					queryClient.invalidateQueries({
						queryKey: ["allGroups", `${updatedRow.locationId}`],
						refetchType: "all",
					});
					//setRows(sortAndAddNumbers(updatedRows, groupId));
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
	const handleChoice = async (value: string) => {
		if (value === "yes" && deleteLoc !== null) {
			const message = await deleteLocation.mutateAsync(deleteLoc);
			if (!message.error) {
				//console.log(message);
				setSnackbar({
					children: message.message,
					severity: "success",
				});
				queryClient.invalidateQueries({ queryKey: ["locations"] });
				locs.refetch();
			} else {
				//console.log(message);
				setSnackbar({ children: message.error, severity: "error" });
			}
		} else {
			setDeleteLoc(null);
		}
		setDialogLocOpen(false);
		setDeleteLoc(null);
	};
	const handleChoiceGroup = async (value: string) => {
		if (value === "yes" && deleteGroup !== null) {
			const message = await deleteGr.mutateAsync(deleteGroup);
			if (!message.error) {
				//console.log(message);
				setSnackbar({
					children: message.message,
					severity: "success",
				});
				groups.refetch();
			} else {
				//console.log(message);
				setSnackbar({ children: message.error, severity: "error" });
			}
		} else {
			setDeleteGroup(null);
		}
		setDialogGroupOpen(false);
		setDeleteGroup(null);
	};
	const colsGroup: GridColDef[] = [
		{
			field: "name",
			headerName: "Nazwa grupy",
			type: "string",
			editable: true,
			minWidth: 150,
			flex: 1,
			renderCell: (params) => (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						height: "100%",
					}}>
					<Typography
						my={2}
						fontWeight={500}>
						{params.value}
					</Typography>
				</Box>
			),
		},
		{
			field: "terms",
			headerName: "Terminy",
			flex: 1,
			minWidth: 250,
			renderCell: (params) => {
				return (
					<Box
						sx={{
							whiteSpace: "normal",
							wordWrap: "break-word",
							overflowWrap: "break-word",
							display: "flex",
							flexDirection: "column", // Zapewnia pionowe ułożenie elementów wewnątrz
							justifyContent: "center", // Wyśrodkowanie w pionie
							alignItems: "flex-start", // Wyśrodkowanie w pionie
							height: "100%",
						}}>
						{params.row.terms.map((t: any, index: any) => (
							<div key={index}>
								<span style={{ color: "blueviolet", fontSize: "13px" }}>
									{t.location.name}
								</span>
								,{" "}
								<span style={{ fontSize: "13px" }}>
									{PolishDayName(t.dayOfWeek)} {t.timeS}-{t.timeE}
								</span>
							</div>
						))}
					</Box>
				);
			},
		},
		{
			field: "color",
			headerName: "Kolor",
			editable: true,
			minWidth: 120,
			flex: 1,
			renderEditCell: renderColorInputCell,
			renderCell: (params) => {
				return (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							height: "100%",
						}}>
						<div
							style={{
								width: "12px",
								height: "12px",
								marginRight: "8px",
								backgroundColor: params.row.color,
								display: "inline-block",
								borderRadius: "50%",
							}}></div>
						{ColorName(params.row.color)}
					</Box>
				);
			},
		},
		{
			field: "participantgroup",
			headerName: "Uczestnicy",
			flex: 2,
			minWidth: 200,
			renderCell: (params) => {
				if (params.row.participantgroup.length > 0) {
					const sorted = params.row.participantgroup.sort((a: any, b: any) => {
						// Sort by last name
						if (a.lastName.toLowerCase() > b.lastName.toLowerCase()) return 1;
						if (a.lastName.toLowerCase() < b.lastName.toLowerCase()) return -1;

						// If last names are the same, sort by first name
						if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) return 1;
						if (a.firstName.toLowerCase() < b.firstName.toLowerCase())
							return -1;

						// If first names are the same, sort by id
						return a.id - b.id;
					});
					return (
						<Box
							sx={{
								whiteSpace: "normal",
								wordWrap: "break-word",
								overflowWrap: "break-word",
								display: "flex",
								flexDirection: "column", // Zapewnia pionowe ułożenie elementów wewnątrz
								justifyContent: "center", // Wyśrodkowanie w pionie
								alignItems: "flex-start", // Wyśrodkowanie w pionie
								height: "100%",
								py: 1,
							}}>
							{sorted.map((p: any, index: number) => (
								<div key={index}>
									{p.lastName} {p.firstName}
								</div>
							))}
						</Box>
					);
				} else
					return (
						<Box
							sx={{
								whiteSpace: "normal",
								wordWrap: "break-word",
								overflowWrap: "break-word",
								display: "flex",
								flexDirection: "column", // Zapewnia pionowe ułożenie elementów wewnątrz
								justifyContent: "center", // Wyśrodkowanie w pionie
								alignItems: "flex-start", // Wyśrodkowanie w pionie
								height: "100%",
								py: 1,
							}}>
							Brak uczestników
						</Box>
					);
			},
		},
		{
			field: "coaches",
			headerName: "Prowadzący",
			flex: 2,
			minWidth: 200,
			renderCell: (params) => {
				if (params.row.coaches.length > 0) {
					return (
						<Box
							sx={{
								whiteSpace: "normal",
								wordWrap: "break-word",
								overflowWrap: "break-word",
								display: "flex",
								flexDirection: "column", // Zapewnia pionowe ułożenie elementów wewnątrz
								justifyContent: "center", // Wyśrodkowanie w pionie
								alignItems: "flex-start", // Wyśrodkowanie w pionie
								height: "100%",
								py: 1,
							}}>
							{params.row.coaches.map((c: any, index: number) => (
								<div key={index}>
									{c.name} {c.surname}
								</div>
							))}
						</Box>
					);
				} else {
					return (
						<Box
							sx={{
								whiteSpace: "normal",
								wordWrap: "break-word",
								overflowWrap: "break-word",
								display: "flex",
								flexDirection: "column", // Zapewnia pionowe ułożenie elementów wewnątrz
								justifyContent: "center", // Wyśrodkowanie w pionie
								alignItems: "flex-start", // Wyśrodkowanie w pionie
								height: "100%",
								py: 1,
							}}>
							Brak prowadzących
						</Box>
					);
				}
			},
		},
		{
			field: "actions",
			headerName: "Akcje",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Stack
						sx={{
							display: "flex",
							alignItems: "center",
							height: "100%",
							justifyContent: "space-between",
						}}
						direction={"row"}
						spacing={3}>
						<ContentCopyIcon
							onClick={() => router.push(`/add/group/${params.id}`)}
						/>
						<EditIcon
							color='primary'
							onClick={() => router.push(`/edit/group/${params.id}`)}
						/>
						<DeleteIcon
							color='error'
							onClick={() => {
								setDialogGroupOpen(true);
								setDeleteGroup(params.row);
							}}
						/>
					</Stack>
				);
			},
		},
	];
	const colsLocs: GridColDef[] = [
		{
			field: "name",
			headerName: "Nazwa lokalizacji",
			type: "string",
			editable: false,
			minWidth: 150,
			flex: 1,
		},
		{
			field: "city",
			headerName: "Miasto",
			type: "string",
			editable: false,
			minWidth: 150,
			flex: 1,
		},

		{
			field: "street",
			headerName: "Ulica",
			type: "string",
			editable: false,
			minWidth: 150,
			flex: 1,
		},
		{
			field: "streetNr",
			headerName: "Numer",
			type: "string",
			editable: false,
			minWidth: 150,
			flex: 1,
		},
		{
			field: "postalCode",
			headerName: "Kod pocztowy",
			type: "string",
			editable: false,
			minWidth: 150,
			flex: 1,
		},
		{
			field: "actions",
			headerName: "Akcje",
			flex: 1,
			minWidth: 90,
			renderCell: (params) => {
				return (
					<Stack
						direction={"row"}
						spacing={3}>
						<EditIcon
							color='primary'
							onClick={() => router.push(`/locations/edit/${params.id}`)}
						/>
						<DeleteIcon
							color='error'
							onClick={() => {
								setDialogLocOpen(true);
								setDeleteLoc(params.row);
							}}
						/>
					</Stack>
				);
			},
		},
	];
	if (session?.user.role === "coach") {
		redirect("/home");
	}
	if (status === "loading" || groups.isFetching || locs.isFetching)
		return <Loading />;
	if (groups.isError || groups.data === undefined) {
		return (
			<StandardError
				message={
					groups.isError ? groups.error.message : "Nie udało się pobrać grup"
				}
				addParticipants={false}
			/>
		);
	}
	if (locs.isError || locs.data === undefined) {
		return (
			<StandardError
				message={
					locs.isError ? locs.error.message : "Nie udało się pobrać lokalizacji"
				}
				addParticipants={false}
			/>
		);
	}
	return (
		<Box
			sx={{
				height: "100%",
				width: "100%",
				px: 1,
			}}>
			<Accordion defaultExpanded>
				<StyledAccordionSummary>
					<Typography
						variant='h6'
						color={"white"}>
						Zarządzaj lokalizacjami
					</Typography>
				</StyledAccordionSummary>
				<StyledAccordionDetails>
					<StyledDataGrid
						columns={colsLocs}
						rows={locs.data}
						disableColumnMenu
					/>
				</StyledAccordionDetails>
			</Accordion>
			<Accordion defaultExpanded>
				<StyledAccordionSummary>
					<Typography
						variant='h6'
						color={"white"}>
						Zarządzaj grupami
					</Typography>
				</StyledAccordionSummary>
				<StyledAccordionDetails>
					<StyledDataGrid
						getRowHeight={() => "auto"}
						columns={colsGroup}
						rows={groups.data}
						disableColumnMenu
						processRowUpdate={processRowUpdateGroup}
					/>
				</StyledAccordionDetails>
			</Accordion>

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
			{deleteLoc && (
				<DialogDeleteLoc
					onClose={handleChoice}
					loc={deleteLoc}
					open={dialogLocOpen}
				/>
			)}
			{deleteGroup && (
				<DialogDeleteGroup
					onClose={handleChoiceGroup}
					group={deleteGroup}
					open={dialogGroupOpen}
				/>
			)}
		</Box>
	);
};

export default ManageGroups;
/*
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { plPL } from "@mui/x-date-pickers/locales";
const renderTimeInputCell: GridColDef["renderCell"] = (params) => {
	return <SelectTimeInputCell {...params} />;
};
function SelectTimeInputCell(props: GridRenderCellParams) {
	const { id, value, field, row } = props;
	const apiRef = useGridApiContext();

	const handleChange = async (time: string) => {
		await apiRef.current.setEditCellValue({
			id,
			field,
			value: time,
		});

		//apiRef.current.stopCellEditMode({ id, field });
	};

	return (
		<LocalizationProvider
			dateAdapter={AdapterDateFns}
			localeText={
				plPL.components.MuiLocalizationProvider.defaultProps.localeText
			}>
			<MobileTimePicker
				minTime={
					new Date(`2000-01-01T${field === "timeE" ? `${row.timeS}` : "6:00"}`)
				}
				maxTime={
					new Date(`2000-01-01T${field === "timeS" ? `${row.timeE}` : ""}`)
				}
				ampm={false}
				slotProps={{ textField: { size: "small" } }}
				value={new Date(`2000-01-01T${value}:00`)}
				onChange={(newValue) => {
					if (newValue !== null && newValue !== undefined) {
						const hours = newValue.getHours().toString().padStart(2, "0");
						const minutes = newValue.getMinutes().toString().padStart(2, "0");
						const newTimeE = `${hours}:${minutes}`;

						handleChange(newTimeE);
					}
				}}
			/>
		</LocalizationProvider>
	);
}
{
			field: "locationschedule",
			headerName: "Lokalizacja",
			editable: true,
			type: "singleSelect",
			valueOptions: locs.isSuccess ? locs.data.map((l: any) => l.name) : [],
			minWidth: 120,
			flex: 1,
		},
*/
