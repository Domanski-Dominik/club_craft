import PolishDayName from "@/functions/PolishDayName";
import React, { useState } from "react";
import { DialogGroupsType } from "@/types/type";
import Grid from "@mui/material/Grid2";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
	Select,
	MenuItem,
	SelectChangeEvent,
	FormControl,
	InputLabel,
	Stack,
	Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import type { LocWithGroups, Group } from "@/types/type";
import {
	addParticipantGroup,
	deleteParticipantGroup,
	updateParticipantGroup,
} from "@/server/participant-actions";

const DialogGroups: React.FC<DialogGroupsType> = ({
	onClose,
	open,
	row,
	locWithGroups,
}) => {
	if (row === null) {
		return null;
	}
	const [addingGroup, setAddingGroup] = useState(false);
	const [editedGroupId, setEditedGroupId] = useState<string | null>(null);
	const [selectedLocation, setSelectedLocation] = useState<
		LocWithGroups | null | undefined
	>(null);
	const [groups, setGroups] = useState<Group[] | null | undefined>();
	const [selectedGroupId, setSelectedGroupId] = useState<string>("");
	const [error, setError] = useState("");

	const handleOptionClick = (value: string) => {
		setEditedGroupId(null);
		onClose(value);
	};

	const handleEditClick = (groupId: string) => {
		setAddingGroup(false);
		//console.log(locWithGroups);
		setEditedGroupId(groupId);
		const loc = locWithGroups.find((schedule) =>
			schedule.groups.find((group) => group.id === Number(groupId))
		);
		if (loc) setSelectedLocation(loc);
		const groupsInLoc = loc?.groups;
		setGroups(groupsInLoc);
		setSelectedGroupId(groupId);
	};

	const handleCancelClick = () => {
		setEditedGroupId(null);
		setError("");
	};

	const handleAddGroupClick = () => {
		setAddingGroup(true);
		setEditedGroupId(null);
		setSelectedLocation(null);
		setSelectedGroupId("");
		setGroups([]);
	};

	const handleLocationChange = (event: SelectChangeEvent) => {
		//console.log(event.target.value);
		const id = parseInt(event.target.value, 10);
		const selectedLocationData = locWithGroups.find(
			(location) => location.id === id
		);
		//console.log(selectedLocationData);
		setSelectedLocation(selectedLocationData);
		const groupsInLoc = selectedLocationData?.groups.filter((group) =>
			group.terms.filter((t) => t.locationId === id)
		);
		if (groupsInLoc) {
			const sortedGroups = groupsInLoc.sort((a, b) => {
				// Sprawdź, czy grupy mają przypisane terminy (zakładam, że każda grupa ma przynajmniej jeden termin)
				const dayOfWeekA = a.terms?.[0]?.dayOfWeek || 0; // Jeśli brak terminu, domyślnie ustaw na 0 (np. niedziela)
				const dayOfWeekB = b.terms?.[0]?.dayOfWeek || 0;

				// Jeśli dni tygodnia są różne, sortuj według dnia tygodnia
				if (dayOfWeekA !== dayOfWeekB) {
					return dayOfWeekA - dayOfWeekB;
				}

				// Jeśli dni tygodnia są takie same, sortuj według nazwy grupy
				return a.name.localeCompare(b.name);
			});
			setGroups(sortedGroups);
		} else {
			setGroups(groupsInLoc);
		}
		setSelectedGroupId("");
	};

	const handleGroupChange = (event: React.ChangeEvent<{ value: string }>) => {
		//console.log(event.target.value);
		setSelectedGroupId(event.target.value);
	};

	const handleClose = () => {
		onClose("no");
	};
	const handleAddGroup = async () => {
		const info = {
			participantId: row.id,
			groupId: parseInt(selectedGroupId, 10),
		};
		const message = await addParticipantGroup(info);
		if (!("error" in message)) {
			row.participantgroup.push(message);
			setEditedGroupId(null);
			setAddingGroup(false);
			setError("");
		} else {
			setError(message.error);
		}
	};
	const handleDelete = async () => {
		const info = {
			participantId: row.id,
			groupId: parseInt(selectedGroupId, 10),
		};
		const message = await deleteParticipantGroup(info);
		if (!("error" in message)) {
			const groups = row.participantgroup;
			const newGroups = groups?.filter((g: any) => g.id !== info.groupId);
			row.participantgroup = newGroups;
			setEditedGroupId(null);
			setError("");
		} else {
			setError(message.error);
		}
	};
	const handleEditSave = async () => {
		if (editedGroupId !== null && selectedGroupId !== "") {
			const info = {
				participantId: row.id,
				groupIdToRemove: parseInt(editedGroupId, 10),
				groupIdToAdd: parseInt(selectedGroupId, 10),
			};
			const message = await updateParticipantGroup(info);
			if (!("error" in message)) {
				row.participantgroup.push(message);
				const removedGroup = row.participantgroup;
				const updatedGroups = removedGroup?.filter(
					(g: any) => g.id !== editedGroupId
				);
				row.participantgroup = updatedGroups;
				setEditedGroupId(null);
				setAddingGroup(false);
				setError("");
			} else {
				setError(message.error);
			}
		}
	};
	return (
		<Dialog
			open={open}
			onClose={handleClose}
			scroll='paper'>
			<DialogTitle>
				<Typography sx={{ fontSize: 20 }}>
					{" "}
					Zarządzaj grupami: <br />
					<span style={{ fontWeight: "bold" }}>
						{" "}
						{row.firstName} {row.lastName}
					</span>
					{error !== "" && (
						<>
							<br />
							<span style={{ fontSize: 15, color: "red" }}>{error}</span>
						</>
					)}
				</Typography>
			</DialogTitle>
			<DialogContent
				dividers
				sx={{ px: 2 }}>
				{addingGroup && (
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}>
						<Stack
							direction={"column"}
							width={"100%"}
							pr={2}
							spacing={2}>
							<FormControl
								fullWidth
								size='small'>
								<InputLabel id='loc'>Lokalizacja</InputLabel>
								<Select
									labelId='loc'
									id='loc'
									label='Lokalizacja'
									defaultValue=''
									MenuProps={{
										slotProps: {
											paper: {
												style: {
													maxHeight: 350,
												},
											},
										},
									}}
									value={selectedLocation?.id || ""}
									onChange={handleLocationChange as any}>
									{locWithGroups.length > 0 &&
										locWithGroups.map((loc) => (
											<MenuItem
												divider
												key={loc.id}
												value={`${loc.id}`}>
												{loc.name}
											</MenuItem>
										))}
								</Select>
							</FormControl>

							<FormControl
								fullWidth
								size='small'>
								<InputLabel id='group'>Grupa</InputLabel>
								<Select
									labelId='group'
									id='group'
									label='Grupa'
									MenuProps={{
										slotProps: {
											paper: {
												style: {
													maxHeight: 350,
												},
											},
										},
									}}
									defaultValue=''
									value={selectedGroupId || ""}
									onChange={handleGroupChange as any}>
									{groups &&
										groups !== null &&
										groups.map((group, index) => (
											<MenuItem
												key={index}
												divider
												value={group.id}>
												<Box>
													<Typography
														variant='body1'
														component='div'
														sx={{ fontWeight: "bold" }}>
														{group.name}
													</Typography>
													{group.terms.map((t, index) => (
														<Typography
															key={index}
															variant='body2'
															component='div'
															sx={{ paddingLeft: "8px" }}>
															{PolishDayName(t.dayOfWeek)} {t.timeS}-{t.timeE}
														</Typography>
													))}
												</Box>
											</MenuItem>
										))}
								</Select>
							</FormControl>
						</Stack>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "flex-end",
								alignItems: "center",
							}}>
							<Button
								onClick={() => setAddingGroup(false)}
								variant='outlined'
								color='warning'
								sx={{ marginBottom: 2 }}
								endIcon={<CloseIcon />}>
								Anuluj
							</Button>
							<Button
								onClick={handleAddGroup}
								variant='outlined'
								endIcon={<SaveIcon />}>
								Zapisz
							</Button>
						</div>
					</div>
				)}
				{row.participantgroup.map((group: any) => (
					<div
						key={group.id}
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}>
						{editedGroupId === group.id ? (
							<Grid
								container
								spacing={2}
								sx={{ my: 1 }}>
								<Grid size={10}>
									<FormControl
										fullWidth
										size='small'>
										<InputLabel id='loc'>Lokalizacja</InputLabel>
										<Select
											labelId='loc'
											id='loc'
											label='Lokalizacja'
											defaultValue=''
											MenuProps={{
												slotProps: {
													paper: {
														style: {
															maxHeight: 350,
														},
													},
												},
											}}
											value={selectedLocation?.id || ""}
											onChange={handleLocationChange as any}>
											{locWithGroups.length > 0 &&
												locWithGroups.map((loc) => (
													<MenuItem
														divider
														key={loc.id}
														value={`${loc.id}`}>
														{loc.name}
													</MenuItem>
												))}
										</Select>
									</FormControl>
								</Grid>
								<Grid size={10}>
									<FormControl
										fullWidth
										size='small'>
										<InputLabel id='group'>Grupa</InputLabel>
										<Select
											labelId='group'
											id='group'
											label='Grupa'
											defaultValue=''
											MenuProps={{
												slotProps: {
													paper: {
														style: {
															maxHeight: 350,
														},
													},
												},
											}}
											value={selectedGroupId || ""}
											onChange={handleGroupChange as any}>
											{groups &&
												groups !== null &&
												groups.map((group, index) => (
													<MenuItem
														key={index}
														divider
														value={group.id}>
														<Box>
															<Typography
																variant='body1'
																component='div'
																sx={{ fontWeight: "bold" }}>
																{group.name}
															</Typography>
															{group.terms.map((t, index) => (
																<Typography
																	key={index}
																	variant='body2'
																	component='div'
																	sx={{ paddingLeft: "8px" }}>
																	{PolishDayName(t.dayOfWeek)} {t.timeS}-
																	{t.timeE}
																</Typography>
															))}
														</Box>
													</MenuItem>
												))}
										</Select>
									</FormControl>
								</Grid>
							</Grid>
						) : (
							<Typography sx={{ my: 1.5 }}>
								<span style={{ fontWeight: "bold" }}>{group.name}, </span>
								{group.terms.map((t: any) => (
									<React.Fragment key={t.id}>
										<br />
										<span style={{ color: "darkviolet" }}>
											{t.location.name}
										</span>
										<br />
										{PolishDayName(t.dayOfWeek)} {t.timeS}-{t.timeE}
									</React.Fragment>
								))}
							</Typography>
						)}
						{editedGroupId === group.id ? (
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									justifyContent: "flex-end",
									alignItems: "center",
								}}>
								<Button
									fullWidth
									onClick={handleCancelClick}
									variant='outlined'
									sx={{ marginBottom: 2 }}
									endIcon={<CloseIcon />}>
									Anuluj
								</Button>
								<Button
									fullWidth
									onClick={handleDelete}
									variant='outlined'
									color='error'
									endIcon={<DeleteIcon />}
									sx={{ marginBottom: 2 }}>
									Usuń
								</Button>
								<Button
									fullWidth
									onClick={handleEditSave}
									endIcon={<SaveIcon />}
									variant='contained'>
									Zapisz
								</Button>
							</div>
						) : (
							<div style={{ marginLeft: 6 }}>
								<Button
									fullWidth
									onClick={() => handleEditClick(group.id)}
									variant='outlined'
									endIcon={<EditIcon />}>
									Edytuj
								</Button>
							</div>
						)}
					</div>
				))}
				{row.participantgroup.length === 0 && (
					<Typography
						sx={{ mt: 1 }}
						variant='h6'
						color='red'
						align='center'>
						Uczestnik nie przypisany do żadnej grupy
					</Typography>
				)}
			</DialogContent>
			<DialogActions>
				<Button
					onClick={handleAddGroupClick}
					variant='outlined'
					startIcon={<AddIcon />}>
					Dodaj grupę
				</Button>
				<Button
					onClick={() => handleOptionClick("no")}
					color='primary'
					variant='contained'
					startIcon={<CloseIcon />}>
					Zamknij
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DialogGroups;
