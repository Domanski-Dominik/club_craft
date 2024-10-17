"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	GridAddIcon,
	GridColDef,
	GridFooterContainer,
	GridPagination,
} from "@mui/x-data-grid";
import {
	AlertProps,
	Alert,
	Snackbar,
	Typography,
	Accordion,
	Stack,
	Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	StyledAccordionDetails,
	StyledAccordionSummary,
} from "@/components/styled/StyledComponents";
import { Location } from "@/types/type";
import DialogDeleteLoc from "@/components/dialogs/DialogDeleteLoc";
import { StyledDataGrid } from "@/components/styled/StyledDataGrid";
import { deleteLoc } from "@/server/loc-action";

const LocsDataGrid = (locs: any) => {
	const [dialogLocOpen, setDialogLocOpen] = useState(false);
	const [deleteLocation, setDeleteLocation] = useState<Location | null>(null);
	const [snackbar, setSnackbar] = useState<Pick<
		AlertProps,
		"children" | "severity"
	> | null>(null);
	const handleCloseSnackbar = () => setSnackbar(null);
	const router = useRouter();

	const handleChoice = async (value: string) => {
		if (value === "yes" && deleteLocation !== null) {
			const message = await deleteLoc(Number(deleteLocation.id));
			if (!("error" in message)) {
				//console.log(message);
				setSnackbar({
					children: "Udało się usunąć lokalizacje",
					severity: "success",
				});
				//TODO: zaktualizować dane
			} else {
				//console.log(message);
				setSnackbar({ children: message.error, severity: "error" });
			}
		} else {
			setDeleteLocation(null);
		}
		setDialogLocOpen(false);
		setDeleteLocation(null);
	};
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
								setDeleteLocation(params.row);
							}}
						/>
					</Stack>
				);
			},
		},
	];
	const CustomFooter = () => {
		return (
			<GridFooterContainer>
				<Button
					startIcon={<GridAddIcon />}
					onClick={() => router.push("/locations/new")}>
					Dodaj nową
				</Button>
				<GridPagination />
			</GridFooterContainer>
		);
	};
	return (
		<>
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
						rows={locs.locs}
						disableColumnMenu
						slots={{ footer: CustomFooter }}
					/>
				</StyledAccordionDetails>
			</Accordion>
			{deleteLocation && (
				<DialogDeleteLoc
					onClose={handleChoice}
					loc={deleteLocation}
					open={dialogLocOpen}
				/>
			)}
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
		</>
	);
};

export default LocsDataGrid;
