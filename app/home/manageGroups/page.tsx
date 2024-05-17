"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Loading from "@/context/Loading";
import { useUpdateGroup } from "@/hooks/scheduleHooks";
import {
	DataGrid,
	GridColDef,
	useGridApiContext,
	GridRenderCellParams,
	GridRowModel,
} from "@mui/x-data-grid";
import PolishDayName, { ColorName } from "@/context/PolishDayName";
import {
	Box,
	Select,
	SelectChangeEvent,
	AlertProps,
	Alert,
	Snackbar,
	Typography,
	Fab,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { plPL } from "@mui/x-date-pickers/locales";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CachedOutlinedIcon from "@mui/icons-material/CachedOutlined";

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
const renderColorInputCell: GridColDef["renderCell"] = (params) => {
	return <SelectColorInputCell {...params} />;
};
const renderTimeInputCell: GridColDef["renderCell"] = (params) => {
	return <SelectTimeInputCell {...params} />;
};
const ManageGroups = () => {
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
	const updateGr = useUpdateGroup();
	const [snackbar, setSnackbar] = useState<Pick<
		AlertProps,
		"children" | "severity"
	> | null>(null);
	const handleCloseSnackbar = () => setSnackbar(null);
	const queryClient = useQueryClient();
	console.log(groups.data);
	const processRowUpdate = async (
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
					dayOfWeek: updatedRow.dayOfWeek,
					timeS: updatedRow.timeS,
					timeE: updatedRow.timeE,
					id: updatedRow.id,
					color: updatedRow.color,
					price: updatedRow.price,
					locationschedule: updatedRow.locationschedule,
					club: updatedRow.club,
					locations: locs.data,
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
	const cols: GridColDef[] = [
		{
			field: "name",
			headerName: "Nazwa grupy",
			type: "string",
			editable: true,
			minWidth: 150,
			flex: 1,
		},
		{
			field: "dayOfWeek",
			headerName: "Dzień tygodnia",
			type: "singleSelect",
			sortable: false,
			editable: true,
			minWidth: 100,
			valueOptions: [
				{ value: 1, label: "Poniedziałek" },
				{ value: 2, label: "Wtorek" },
				{ value: 3, label: "Środa" },
				{ value: 4, label: "Czwartek" },
				{ value: 5, label: "Piątek" },
				{ value: 6, label: "Sobota" },
				{ value: 0, label: "Niedziela" },
			],
			renderCell: (params) => {
				return PolishDayName(params.row.dayOfWeek);
			},
		},
		{
			field: "locationschedule",
			headerName: "Lokalizacja",
			editable: true,
			type: "singleSelect",
			valueOptions: locs.isSuccess ? locs.data.map((l: any) => l.name) : [],
			minWidth: 150,
			flex: 1,
		},
		{
			field: "timeS",
			headerName: "Od",
			width: 70,
			editable: true,
			renderEditCell: renderTimeInputCell,
		},
		{
			field: "timeE",
			headerName: "Do",
			width: 70,
			editable: true,
			renderEditCell: renderTimeInputCell,
		},
		{
			field: "price",
			headerName: "Cena",
			type: "number",
			editable: true,
			width: 80,
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
					<>
						<div
							style={{
								width: "12px",
								height: "12px",
								marginRight: "8px",
								backgroundColor: params.row.color,
								display: "inline-block",
							}}></div>
						{ColorName(params.row.color)}
					</>
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
				}}>
				<DataGrid
					columns={cols}
					rows={groups.data}
					disableColumnMenu
					processRowUpdate={processRowUpdate}
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
			</Box>
		);
};

export default ManageGroups;
