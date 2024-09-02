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
	AccordionSummary,
	AccordionDetails,
	AccordionProps,
	AccordionSummaryProps,
	Stack,
} from "@mui/material";

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
		queryKey: ["ManageGroups"],
		enabled: !!session,
		queryFn: () =>
			fetch(`/api/loc/withGroups/${session?.user.club}`).then((res) =>
				res.json()
			),
	});
	const locs = useQuery({
		queryKey: ["ManageGroupsLocations"],
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
			minWidth: 120,
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
			field: "terms",
			headerName: "Terminy",
			flex: 1,
			minWidth: 220,
			renderCell: (params) => {
				return (
					<Box
						sx={{
							whiteSpace: "normal",
							wordWrap: "break-word",
							overflowWrap: "break-word",
							my: 1,
						}}>
						{params.row.terms.map((t: any, index: any) => (
							<div key={index}>
								<span style={{ color: "blueviolet", fontSize: "15px" }}>
									{t.location.name}
								</span>
								,{" "}
								<span style={{ fontSize: "15px" }}>
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
			field: "actions",
			headerName: "Akcje",
			flex: 1,
			minWidth: 90,
			renderCell: (params) => {
				return (
					<Stack
						sx={{
							display: "flex",
							alignItems: "center",
							height: "100%",
						}}
						direction={"row"}
						spacing={3}>
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
	if (status === "loading" || groups.isFetching) return <Loading />;
	if (groups.isError || groups.data === undefined) {
		<>
			<WarningAmberIcon
				color='error'
				sx={{ width: 100, height: 100, m: 4 }}
			/>
			<Typography
				color={"red"}
				variant='h4'>
				{groups.isError ? groups.error.message : "Nie udało się pobrać grup"}
			</Typography>
			<Fab
				onClick={() => window.location.reload()}
				sx={{ mt: 4, mb: 1 }}
				color='primary'
				variant='extended'
				size='small'>
				<CachedOutlinedIcon sx={{ mr: 1 }} />
				Odśwież stronę
			</Fab>
		</>;
	}
	if (groups.data)
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
						<DataGrid
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
						<DataGrid
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
