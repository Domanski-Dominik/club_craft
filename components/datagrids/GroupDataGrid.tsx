"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GridColDef } from "@mui/x-data-grid";
import {
	Box,
	AlertProps,
	Alert,
	Snackbar,
	Typography,
	Accordion,
	Stack,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	StyledAccordionDetails,
	StyledAccordionSummary,
	StyledSwitch,
} from "@/components/styled/StyledComponents";
import { Group } from "@/types/type";
import DialogDeleteGroup from "@/components/dialogs/DialogDeleteGroup";
import { StyledDataGrid } from "@/components/styled/StyledDataGrid";
import PolishDayName, { ColorName } from "@/functions/PolishDayName";
import { deleteGroup, updateGroupSignIn } from "@/server/group-actions";
import ResponsiveSnackbar from "../Snackbars/Snackbar";

const GroupDataGrid = (groups: any) => {
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "error" | "warning" | "info" | "success";
	}>({ open: false, message: "", severity: "info" });
	const handleCloseSnackbar = () => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	};
	const router = useRouter();
	const [deletedGroup, setDeletedGroup] = useState<Group | null>(null);
	const [dialogGroupOpen, setDialogGroupOpen] = useState(false);
	const handleChoiceGroup = async (value: string) => {
		if (value === "yes" && deletedGroup !== null) {
			const message = await deleteGroup(deletedGroup.id);
			if (!("error" in message)) {
				setSnackbar({
					open: true,
					message: `Udało się usunąć grupę ${message.name}`,
					severity: "success",
				});
			} else {
				setSnackbar({ open: true, message: message.error, severity: "error" });
			}
		} else {
			setDeletedGroup(null);
		}
		setDialogGroupOpen(false);
		setDeletedGroup(null);
	};
	const handleSwitchChange = async (groupId: string, newValue: boolean) => {
		try {
			// Wywołanie funkcji serwerowej do aktualizacji
			const response = await updateGroupSignIn({
				id: groupId,
				signin: newValue,
			});

			if (!("error" in response)) {
				setSnackbar({
					open: true,
					message: `${response.message}`,
					severity: "success",
				});
			} else {
				setSnackbar({
					open: true,
					message: `${response.error}`,
					severity: "error",
				});
			}
		} catch (error) {
			setSnackbar({
				open: true,
				message: "Wystąpił błąd podczas aktualizacji zapisów.",
				severity: "error",
			});
		}
	};
	const colsGroup: GridColDef[] = [
		{
			field: "name",
			headerName: "Nazwa grupy",
			type: "string",
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
			minWidth: 120,
			flex: 1,
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
			field: "signin",
			headerName: "Zapisy",
			flex: 2,
			minWidth: 100,
			renderCell: (params) => {
				const { id, signin } = params.row;
				return (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							height: "100%",
						}}>
						<StyledSwitch
							checked={signin}
							onChange={(e) => handleSwitchChange(id, e.target.checked)}
							sx={{ ml: -2 }}
						/>
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
									{index + 1}.{p.lastName} {p.firstName}
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
								setDeletedGroup(params.row);
							}}
						/>
					</Stack>
				);
			},
		},
	];
	return (
		<>
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
						rows={groups.groups}
						disableColumnMenu
					/>
				</StyledAccordionDetails>
			</Accordion>
			{deletedGroup && (
				<DialogDeleteGroup
					onClose={handleChoiceGroup}
					group={deletedGroup}
					open={dialogGroupOpen}
				/>
			)}
			<ResponsiveSnackbar
				open={snackbar.open}
				onClose={handleCloseSnackbar}
				message={snackbar.message}
				severity={snackbar.severity}
			/>
		</>
	);
};

export default GroupDataGrid;
