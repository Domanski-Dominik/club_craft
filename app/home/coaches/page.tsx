"use client";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
	DataGrid,
	GridColDef,
	GridValidRowModel,
	GridActionsCellItem,
	GridRowModel,
} from "@mui/x-data-grid";
import {
	Box,
	Button,
	Typography,
	TextField,
	IconButton,
	InputAdornment,
	Snackbar,
	Alert,
} from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import PolishDayName from "@/context/PolishDayName";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import DialogCoachGroups from "@/components/dialogs/DialogCoachGroups";
import SecurityIcon from "@mui/icons-material/Security";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import type { LocWithGroups } from "@/types/type";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import Loading from "@/context/Loading";

const sortAndAddNumbers = (rows: GridValidRowModel[]) => {
	const sortedRows = [...rows];
	sortedRows.sort((a, b) => {
		if (a.surname === b.surname) {
			return a.name.localeCompare(b.name);
		}
		return a.surname.localeCompare(b.surname);
	});

	// Dodaj numery do posortowanych uczestników
	const rowsWithNumbers = sortedRows.map((row, index) => {
		return { ...row, num: index + 1 };
	});

	// Zaktualizuj stan z posortowaną i ponumerowaną listą uczestników
	return rowsWithNumbers;
};

const CoachesManage = () => {
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState("");
	const [showlink, setShowLink] = React.useState(false);
	const [rows, setRows] = React.useState<GridValidRowModel[] | []>([]);
	const [openSnackbar, setOpenSnackbar] = React.useState(false);
	const [newCoachLink, setNewCoachLink] = React.useState("");
	const [locWithGroups, setLocWithGroups] = React.useState<LocWithGroups[]>([]);
	const { data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const [selectedRow, setSelectedRow] = React.useState<GridRowModel | null>(
		null
	);
	const addCoach = () => {
		setShowLink(true);
	};
	const copyToClipboard = () => {
		navigator.clipboard.writeText(newCoachLink);
		setOpenSnackbar(true);
	};
	const handleCloseSnackbar = () => {
		setOpenSnackbar(false);
	};
	const [groupsDialogOpen, setGroupsDialogOpen] = React.useState(false);
	const pages = [
		{ id: 1, title: "Klub", path: "/home" },
		{
			id: 2,
			title: "Trenerzy",
			path: "/home/coaches",
		},
	];
	const handleGroupsDialogOpen = (row: GridRowModel) => () => {
		setSelectedRow(row);
		setGroupsDialogOpen(true);
	};
	const columns: GridColDef[] = [
		{
			field: "num",
			headerName: "#",
			width: 40,
			sortable: false,
		},
		{
			field: "surname",
			headerName: "Nazwisko",
			minWidth: 100,
			sortable: true,
			flex: 1,
		},

		{ field: "name", headerName: "Imię", minWidth: 100, flex: 1 },
		{
			field: "coachedGroups",
			headerName: "Przypisane grupy",
			minWidth: 300,
			sortable: false,
			flex: 2,
			renderCell: (params) => {
				const groups = params.row.coachedGroups;
				const groupText = groups.map((gr: any) => (
					<Typography
						sx={{ my: 0.5 }}
						variant='body2'
						key={gr.id}>
						<span style={{ color: "darkviolet" }}>{gr.location},</span>
						{"  "}
						<span style={{ fontWeight: "normal" }}>
							{PolishDayName(gr.day)}:
						</span>
						{"  "}
						<span style={{ fontWeight: "bolder" }}>{gr.name}</span>
					</Typography>
				));
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
							{params.row.role === "owner" ? (
								<Typography
									sx={{ mt: 1 }}
									variant='body1'
									color='green'>
									Pełen dostęp
								</Typography>
							) : groups.length > 0 ? (
								groupText
							) : (
								<Typography color='error'>
									Nie przypisany do żadnej grupy
								</Typography>
							)}
						</Box>
						{params.row.role === "owner" ? (
							<GridActionsCellItem
								icon={<SecurityIcon />}
								label='Dodaj płatność'
								onClick={handleGroupsDialogOpen(params.row)}
								color='inherit'
							/>
						) : (
							<GridActionsCellItem
								icon={<EditCalendarIcon />}
								label='Dodaj płatność'
								onClick={handleGroupsDialogOpen(params.row)}
								color='inherit'
							/>
						)}
					</Box>
				);
			},
		},
		{ field: "email", headerName: "Email", minWidth: 200, flex: 1 },
	];
	const fetchCoaches = async () => {
		if (session?.user.role === "owner") {
			const response = await fetch(`/api/coaches/${session.user.club}`);
			const data = await response.json();
			//console.log(session.user);
			//console.log(data);
			if (!data.error) {
				/*const filteredRows = data.filter(
					(user: any) => user.id !== session.user.id
				);*/
				setRows(sortAndAddNumbers(data));
				//console.log(data);
			} else {
				setError(data.error);
			}
			const response2 = await fetch(`/api/form/${session?.user.club}`, {
				method: "GET",
			});
			const data2: LocWithGroups[] | { error: string } = await response2.json();
			if (Array.isArray(data2)) {
				//console.log(data2);
				setLocWithGroups(data2);
				setLoading(false);
			} else {
				setError(data.error);
				setLoading(false);
			}
			setError("");
			setNewCoachLink(`clubcraft.pl/register/${session?.user.club}`);
		} else {
			setError("Nie masz uprawnień do tej strony");
			setLoading(false);
		}
	};

	React.useEffect(() => {
		fetchCoaches();
	}, [session]);
	if (loading) return <Loading />;
	return (
		<>
			<MobileNavigation pages={pages} />
			{error !== "" ? (
				<>
					<WarningAmberIcon
						color='error'
						sx={{ width: 100, height: 100, m: 5 }}
					/>
					<Typography
						variant='h5'
						align='center'
						color='red'>
						{error}
					</Typography>
				</>
			) : (
				<Box sx={{ width: "100%", mt: 3 }}>
					<DataGrid
						autoHeight
						loading={loading}
						rows={rows}
						columns={columns}
						disableColumnMenu
						getRowHeight={() => "auto"}
					/>
					{selectedRow && (
						<DialogCoachGroups
							open={groupsDialogOpen}
							row={selectedRow}
							onClose={() => {
								setGroupsDialogOpen(false);
								setSelectedRow(null);
							}}
							locWithGroups={locWithGroups}
						/>
					)}
					<Grid
						container
						sx={{
							mt: 2,
							width: "100%",
							justifyContent: "center",
							justifyItems: "center",
						}}>
						<Grid
							xs={10}
							sx={{ mb: 2 }}>
							<Button
								fullWidth
								variant='contained'
								onClick={addCoach}>
								Dodaj trenera
							</Button>
						</Grid>

						{showlink && (
							<>
								<Grid xs={12}>
									<TextField
										fullWidth
										label='Link dla trenera'
										value={newCoachLink}
										InputProps={{
											endAdornment: (
												<InputAdornment position='end'>
													<IconButton onClick={copyToClipboard}>
														<FileCopyIcon />
													</IconButton>
													<IconButton onClick={() => setShowLink(false)}>
														<CloseIcon color='warning' />
													</IconButton>
												</InputAdornment>
											),
										}}
									/>
								</Grid>
							</>
						)}
					</Grid>
					<Snackbar
						open={openSnackbar}
						autoHideDuration={3000}
						onClose={handleCloseSnackbar}
						anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
						sx={{ position: "absolute", bottom: 90 }}>
						<Alert
							onClose={handleCloseSnackbar}
							severity='success'>
							Skopiowano!
						</Alert>
					</Snackbar>
				</Box>
			)}
		</>
	);
};

export default CoachesManage;
