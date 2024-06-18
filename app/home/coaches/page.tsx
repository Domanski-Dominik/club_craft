"use client";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
	DataGrid,
	GridColDef,
	GridValidRowModel,
	GridActionsCellItem,
	GridRowModel,
} from "@mui/x-data-grid";
import {
	Box,
	Fab,
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
import DialogAdmin from "@/components/dialogs/DialogAdmin";
import DialogCoachGroups from "@/components/dialogs/DialogCoachGroups";
import SecurityIcon from "@mui/icons-material/Security";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import Loading from "@/context/Loading";

//TODO:  dodawanie/usuwanie praw aministratora
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
	const [showlink, setShowLink] = useState(false);
	const [openSnackbar, setOpenSnackbar] = useState(false);
	const { data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const coaches = useQuery<GridValidRowModel[]>({
		queryKey: ["coaches"],
		enabled: !!session,
		queryFn: async () => {
			const res = await fetch(`/api/coaches/${session?.user.club}`);
			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Nieznany błąd");
			}
			return res.json();
		},
		select: (data) => {
			return sortAndAddNumbers(data);
		},
	});
	const locWithGr = useQuery({
		queryKey: ["locWithGr"],
		enabled: !!session,
		queryFn: async () => {
			const res = await fetch(`/api/form/${session?.user.club}`);
			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Nieznany błąd");
			}
			return res.json();
		},
	});
	const [selectedRow, setSelectedRow] = useState<GridRowModel | null>(null);
	const addCoach = () => {
		setShowLink(true);
	};
	const copyToClipboard = () => {
		navigator.clipboard.writeText(
			`clubcraft.pl/register/${session?.user.club}`
		);
		setOpenSnackbar(true);
	};
	const handleCloseSnackbar = () => {
		setOpenSnackbar(false);
	};
	const [groupsDialogOpen, setGroupsDialogOpen] = useState(false);
	const [adminDialogOpen, setAdminDialogOpen] = useState(false);
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
	const handleAdminDialogOpen = (row: GridRowModel) => () => {
		setSelectedRow(row);
		setAdminDialogOpen(true);
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

						<GridActionsCellItem
							icon={<EditCalendarIcon />}
							label='Dodaj płatność'
							onClick={handleGroupsDialogOpen(params.row)}
							color='inherit'
						/>
					</Box>
				);
			},
		},
		{ field: "email", headerName: "Email", minWidth: 200, flex: 1 },
		{
			field: "role",
			headerName: "Uprawnienia",
			minWidth: 140,
			renderCell: (params) => {
				return (
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}>
						<Box
							sx={{
								width: 100,
								whiteSpace: "pre-wrap",
							}}>
							<Typography
								sx={{ mt: 1 }}
								variant='body1'
								color={params.row.role === "owner" ? "green" : "black"}>
								{params.row.role === "owner" ? "Administrator" : "Trener"}
							</Typography>
						</Box>
						<GridActionsCellItem
							icon={<SecurityIcon />}
							label='Dodaj płatność'
							onClick={handleAdminDialogOpen(params.row)}
							color='inherit'
						/>
					</Box>
				);
			},
		},
	];

	if (coaches.isError || locWithGr.isError) {
		return (
			<>
				<MobileNavigation pages={pages} />
				<WarningAmberIcon
					color='error'
					sx={{ width: 100, height: 100, m: 5 }}
				/>
				<Typography
					variant='h5'
					align='center'
					color='red'>
					{coaches.isError
						? coaches.error.message
						: locWithGr.isError
						? locWithGr.error.message
						: "Nieznany błąd"}
				</Typography>
			</>
		);
	}
	if (coaches.isLoading || locWithGr.isLoading || session === undefined)
		return <Loading />;
	return (
		<Box
			sx={{
				width: "100%",
				mt: 3,
			}}>
			<MobileNavigation pages={pages} />
			<DataGrid
				autoHeight
				rows={coaches.isSuccess ? coaches.data : []}
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
					locWithGroups={locWithGr.data}
				/>
			)}
			{selectedRow && (
				<DialogAdmin
					open={adminDialogOpen}
					row={selectedRow}
					onClose={() => {
						setAdminDialogOpen(false);
						setSelectedRow(null);
					}}
				/>
			)}
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					mt: 3,
					mb: 3,
				}}>
				<Fab
					size='large'
					color='primary'
					variant='extended'
					onClick={addCoach}>
					<AddIcon sx={{ mr: 1, mb: 1 }} />
					Dodaj trenera
				</Fab>
			</Box>
			{showlink && (
				<>
					<TextField
						fullWidth
						label='Link dla trenera'
						value={`clubcraft.pl/register/${session?.user.club}`}
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
				</>
			)}

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
	);
};

export default CoachesManage;
/*
<Grid
				container
				sx={{
					mt: 2,
					width: "100%",
					justifyContent: "center",
					justifyItems: "center",
				}}>
				<Grid
					xs={12}
					sx={{ mb: 2 }}>

					</Grid>
<Grid xs={12}>
</Grid>
</Grid>
*/
