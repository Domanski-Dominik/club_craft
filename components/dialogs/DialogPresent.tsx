import { useState } from "react";
import React from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { DialogPresentType } from "@/types/type";
import { Participant } from "@/types/type";
import { useQuery } from "@tanstack/react-query";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAttendance } from "@/hooks/participantHooks";
import { MobileDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { pl } from "date-fns/locale/pl";
import { format } from "date-fns/format";
import { parse } from "date-fns";
import { getShouldDisableDate } from "@/functions/dates";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Autocomplete,
	Box,
	Typography,
	List,
	ListItem,
	ListItemText,
	ListSubheader,
	IconButton,
} from "@mui/material";

interface Option {
	label: string;
	id: number;
}
const formatDate = (date: Date) => {
	return format(date, "dd-MM-yyyy");
};

const DialogPresent: React.FC<DialogPresentType> = ({
	onClose,
	open,
	groupId,
	group,
}) => {
	const [selected, setSelected] = useState<Option | null>(null);
	const [editMode, setEditMode] = useState<number | null>(null);
	const [error, setError] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const [changeDate, setChangeDate] = useState<Date>(new Date());
	const [addDate, setAddDate] = useState<Date>(new Date());
	const [editDate, setEditDate] = useState<Date>(new Date());
	const shouldDisableDay = (date: Date) => {
		return getShouldDisableDate(date, group.terms);
	};
	const { data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const allPrt = useQuery({
		queryKey: ["allParticipants"],
		queryFn: () =>
			fetch(`/api/participant/all/owner/${session?.user.club}`).then((res) =>
				res.json()
			),
	});
	const workOutPrt = useQuery({
		queryKey: ["workout", groupId],
		queryFn: () =>
			fetch(`/api/participant/presence/${groupId}`).then((res) => res.json()),
		select: (data) => {
			if (Array.isArray(data) && data.length !== 0) {
				const filtered: Participant[] = data.flatMap((participant) =>
					(participant.attendance || [])
						.filter(
							(attendance: any) =>
								attendance.belongs === false && attendance.groupId === groupId
						)
						.map((attendance: any) => ({
							...participant,
							attendanceDate: attendance.date,
						}))
				);

				const grouped = filtered.reduce<Record<string, Participant[]>>(
					(acc, participant) => {
						const date = participant.attendanceDate as string;
						if (!acc[date]) {
							acc[date] = [];
						}
						acc[date].push(participant);
						return acc;
					},
					{}
				);

				// Sortowanie dat w porządku malejącym
				const sortedDates = Object.keys(grouped).sort((a, b) => {
					const [dayA, monthA, yearA] = a.split("-").map(Number);
					const [dayB, monthB, yearB] = b.split("-").map(Number);
					const dateA = new Date(yearA, monthA - 1, dayA);
					const dateB = new Date(yearB, monthB - 1, dayB);
					return dateB.getTime() - dateA.getTime(); // Odwrócenie porządku do malejącego
				});

				// Zwrócenie posortowanego obiektu
				const sortedGrouped = sortedDates.reduce<Record<string, Participant[]>>(
					(acc, date) => {
						acc[date] = grouped[date];
						return acc;
					},
					{}
				);

				return sortedGrouped;
			} else {
				return {};
			}
		},
	});
	const updateAttendance = useAttendance();
	const handleClose = () => {
		onClose(null);
	};
	const handleOptionClick = (value: string) => {
		if (value === "yes") {
		} else {
			onClose(null);
		}
	};
	const handleAutocompleteChange = (event: any, newValue: Option | null) => {
		setSelected(newValue);
		//console.log(selected);
	};
	const handleAddClick = async () => {
		const info = {
			groupId: groupId,
			participantId: selected?.id,
			date: formatDate(addDate),
			isChecked: true,
		};
		const message = await updateAttendance.mutateAsync(info);
		if (message.error) {
			setError(message.error);
		} else {
			setError("");
		}
		workOutPrt.refetch();
		setIsAdding((prev) => !prev);
	};
	const handleSaveClick = async (
		participantId: number,
		dateToRemove: string
	) => {
		const info = {
			groupId: groupId,
			participantId: participantId,
			date: formatDate(changeDate),
			isChecked: true,
			dateToRemove: dateToRemove,
		};
		const message = await updateAttendance.mutateAsync(info);
		if (!message.error) {
			setError(message.error);
		} else {
			setError("");
		}
		workOutPrt.refetch();
		setEditMode(null);
		setEditDate(new Date());
	};

	const handleDeleteClick = async (participantId: number) => {
		const info = {
			groupId: groupId,
			participantId: participantId,
			date: formatDate(editDate),
			isChecked: false,
		};
		const message = await updateAttendance.mutateAsync(info);
		if (!message.error) {
			setError(message.error);
		} else {
			setError("");
		}
		workOutPrt.refetch();
		setEditMode(null);
		setEditDate(new Date());
	};
	const handleCancelClick = (participantId: number) => {
		setEditMode(null);
		setEditDate(new Date());
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}>
			<DialogTitle>Uczestnicy odrabiający w tej grupie</DialogTitle>
			<DialogContent dividers>
				{error !== "" && <Typography>{error}</Typography>}
				{isAdding ? (
					<>
						<Autocomplete
							value={selected}
							//multiple
							isOptionEqualToValue={(option, value) => option.id === value.id}
							onChange={handleAutocompleteChange}
							options={
								allPrt.isSuccess
									? allPrt.data
											.map((p: Participant) => {
												return {
													label: `${p.lastName} ${p.firstName}`,
													id: p.id,
												};
											})
											.sort((a: any, b: any) => -b.label.localeCompare(a.label))
									: []
							}
							groupBy={(option) => option.label[0]}
							getOptionLabel={(option) => option.label}
							renderInput={(params) => (
								<TextField
									{...params}
									label='Uczestnicy'
								/>
							)}
						/>
						<LocalizationProvider
							dateAdapter={AdapterDateFns}
							adapterLocale={pl}>
							<MobileDatePicker
								label='Wybierz dzień'
								value={addDate}
								minDate={parse(group.firstLesson, "dd-MM-yyyy", new Date())}
								maxDate={parse(group.lastLesson, "dd-MM-yyyy", new Date())}
								onChange={(value) => {
									if (value) setAddDate(value);
								}}
								sx={{ width: "100%", my: 2 }}
								//slotProps={{ textField: { size: "small" } }}
								shouldDisableDate={shouldDisableDay}
							/>
						</LocalizationProvider>
					</>
				) : (
					<List
						sx={{
							width: "100%",
							bgcolor: "background.paper",
							position: "relative",
							overflow: "auto",
							maxHeight: 300,
							"& ul": { padding: 0 },
						}}
						subheader={<li />}>
						{workOutPrt.data &&
							Object.keys(workOutPrt.data).map((date) => (
								<React.Fragment key={date}>
									<ListSubheader color='primary'>{date}</ListSubheader>
									{workOutPrt.data[date].map((participant) => (
										<ListItem key={participant.id}>
											{editMode === participant.id &&
											formatDate(editDate) === date ? (
												<Box
													display='flex'
													alignItems='center'
													width='100%'
													sx={{
														flexWrap: "wrap",
														flexDirection: "column",
													}}>
													<ListItemText
														primary={`${participant.firstName} ${participant.lastName}`}
													/>
													<LocalizationProvider
														dateAdapter={AdapterDateFns}
														adapterLocale={pl}>
														<MobileDatePicker
															label='Wybierz dzień'
															value={changeDate}
															//disableFuture
															onChange={(value) => {
																if (value) setChangeDate(value);
															}}
															sx={{ width: "80%", my: 1 }}
															slotProps={{ textField: { size: "small" } }}
															shouldDisableDate={shouldDisableDay}
														/>
													</LocalizationProvider>

													<Box>
														<IconButton
															edge='end'
															color='success'
															onClick={() =>
																handleSaveClick(participant.id, date)
															}
															sx={{ mr: 1 }}>
															<CheckIcon />
														</IconButton>
														<IconButton
															edge='end'
															color='error'
															onClick={() => handleDeleteClick(participant.id)}
															sx={{ mr: 1 }}>
															<DeleteIcon />
														</IconButton>
														<IconButton
															edge='end'
															onClick={() => handleCancelClick(participant.id)}
															sx={{ mr: 1 }}>
															<CloseIcon />
														</IconButton>
													</Box>
												</Box>
											) : (
												<>
													<ListItemText
														primary={`${participant.firstName} ${participant.lastName}`}
													/>
													<IconButton
														edge='end'
														onClick={() => {
															setEditMode(participant.id);
															setEditDate(
																parse(
																	participant.attendanceDate || "",
																	"dd-MM-yyyy",
																	new Date()
																)
															); // Ustawienie aktualnej daty
														}}>
														<EditIcon />
													</IconButton>
												</>
											)}
										</ListItem>
									))}
								</React.Fragment>
							))}
					</List>
				)}
			</DialogContent>
			<DialogActions>
				{isAdding ? (
					<>
						<Button
							startIcon={<AddIcon />}
							onClick={handleAddClick}
							variant='contained'>
							Dodaj
						</Button>
						<Button
							startIcon={<ArrowBackIcon />}
							onClick={() => setIsAdding((prev) => !prev)}
							variant='outlined'>
							Anuluj
						</Button>
					</>
				) : (
					<>
						<Button
							startIcon={<AddIcon />}
							onClick={() => setIsAdding((prev) => !prev)}
							variant='contained'>
							dodaj
						</Button>
						<Button
							startIcon={<CloseIcon />}
							onClick={() => handleOptionClick("no")}
							variant='outlined'>
							Zamknij
						</Button>
					</>
				)}
			</DialogActions>
		</Dialog>
	);
};

export default DialogPresent;
/*
const groupedParticipants = filterAndGroupParticipants(
		workOutPrt.data,
		groupId
	);

				useEffect(() => {
		const fetchParticipants = async () => {
			if (session?.user && status === "authenticated") {
				const response = await fetch(
					`/api/participant/all/owner/${session.user.club}`,
					{
						method: "GET",
					}
				);
				const data: Participant[] | { error: string } = await response.json();

				if (Array.isArray(data)) {
					if (data.length > 0) {
						const opt = data.map((p: Participant) => {
							return {
								label: `${p.lastName} ${p.firstName}`,
								id: p.id,
							};
						});

						setOptions(opt);
						setError("");
						setParticipants(data);
					} else {
						setError("Pobrana tablica jest pusta");
					}
				} else {
					setError(data.error);
				}
			}
		};
		fetchParticipants();
	}, [session]);useEffect(() => {
		const fetchParticipants = async () => {
			if (session?.user && status === "authenticated") {
				const response = await fetch(
					`/api/participant/all/owner/${session.user.club}`,
					{
						method: "GET",
					}
				);
				const data: Participant[] | { error: string } = await response.json();

				if (Array.isArray(data)) {
					if (data.length > 0) {
						const opt = data.map((p: Participant) => {
							return {
								label: `${p.lastName} ${p.firstName}`,
								id: p.id,
							};
						});

						setOptions(opt);
						setError("");
						setParticipants(data);
					} else {
						setError("Pobrana tablica jest pusta");
					}
				} else {
					setError(data.error);
				}
			}
		};
		fetchParticipants();
	}, [session]);
*/
