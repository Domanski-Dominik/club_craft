import PolishDayName from "@/functions/PolishDayName";
import React, { useState } from "react";
import { DialogGroupsType } from "@/types/type";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {
	Box,
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
} from "@mui/material";
import type { LocWithGroups, Group } from "@/types/type";
import {
	addCoachGroup,
	deleteCoachGroup,
	updateCoachGroup,
} from "@/server/coaches-actions";

const DialogCoachGroups: React.FC<DialogGroupsType> = ({
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
	const [groups, setGroups] = useState<Group[] | null>();
	const [selectedGroupId, setSelectedGroupId] = useState<string>("");
	const [error, setError] = useState("");
	const handleOptionClick = (value: string) => {
		if (value === "yes") {
			// Tutaj dodaj logikę zapisywania zmienionych danych
			//console.log("Zapisano zmiany dla grupy o id:", editedGroupId);
		}
		setEditedGroupId(null);
		onClose(value);
	};

	const handleEditClick = (groupId: string) => {
		setAddingGroup(false);
		//console.log(groupId);
		setEditedGroupId(groupId);
		const loc = locWithGroups.find((loc) =>
			loc.groups.find((group) => group.id === Number(groupId))
		);
		if (loc) setSelectedLocation(loc);
		const groupsInLoc = loc?.groups;
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
		}
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
		const coachId = row.id;
		const groupId = parseInt(selectedGroupId, 10);
		const message = await addCoachGroup({
			club: row.club,
			coachId: coachId,
			groupId: groupId,
		});
		if (!("error" in message)) {
			row.coachedGroups.push(message);
			setEditedGroupId(null);
			setAddingGroup(false);
			setError("");
		} else {
			setError(message.error);
		}
	};
	const handleDelete = async () => {
		const coachId = row.id;
		const groupId = parseInt(selectedGroupId, 10);
		const message = await deleteCoachGroup({
			coachId: coachId,
			groupId: groupId,
		});
		if (!("error" in message)) {
			const groups = row.coachedGroups;
			const newGroups = groups?.filter((g: any) => g.id !== groupId);
			row.coachedGroups = newGroups;
			setEditedGroupId(null);
			setError("");
		} else {
			setError(message.error);
		}
	};
	const handleEditSave = async () => {
		if (editedGroupId !== null && selectedGroupId !== "") {
			const coachId = row.id;
			const groupIdToRemove = parseInt(editedGroupId, 10);
			const groupToAdd = parseInt(selectedGroupId, 10);
			const message = await updateCoachGroup({
				club: row.club,
				coachId: coachId,
				groupIdToRemove: groupIdToRemove,
				groupIdToAdd: groupToAdd,
			});
			if (!("error" in message)) {
				row.coachedGroups.push(message);
				const removedGroup = row.coachedGroups;
				const updatedGroups = removedGroup?.filter(
					(g: any) => g.id !== editedGroupId
				);
				row.coachedGroups = updatedGroups;
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
			onClose={handleClose}>
			<DialogTitle>
				<Typography sx={{ fontSize: 20 }}>
					{" "}
					Zarządzaj grupami: <br />
					<span style={{ fontWeight: "bold" }}>
						{" "}
						{row.name} {row.surname}
					</span>
					{error !== "" && (
						<>
							<br />
							<span style={{ fontSize: 15, color: "red" }}>{error}</span>
						</>
					)}
				</Typography>
			</DialogTitle>
			<DialogContent dividers>
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
									value={selectedLocation?.id || ""}
									onChange={handleLocationChange as any}>
									{locWithGroups.length > 0 &&
										locWithGroups.map((loc) => (
											<MenuItem
												key={loc.id}
												divider
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
									defaultValue=''
									MenuProps={{
										slotProps: {
											paper: {
												sx: { maxHeight: { xs: 150, sm: 300 } },
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
								onClick={() => {
									setAddingGroup(false);
									setError("");
								}}
								variant='outlined'
								color='warning'
								sx={{ marginBottom: 2 }}>
								Anuluj
							</Button>
							<Button
								onClick={handleAddGroup}
								variant='outlined'>
								Zapisz
							</Button>
						</div>
					</div>
				)}
				{row.role !== "owner" &&
					row.coachedGroups.map((group: any) => (
						<div
							key={group.id}
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}>
							{editedGroupId === group.id ? (
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
														sx: { maxHeight: { xs: 150, sm: 300 } },
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
																	{PolishDayName(t.dayOfWeek)} {t.timeS}-
																	{t.timeE}
																</Typography>
															))}
														</Box>
													</MenuItem>
												))}
										</Select>
									</FormControl>
								</Stack>
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
										onClick={handleCancelClick}
										variant='outlined'
										color='warning'
										sx={{ marginBottom: 2 }}>
										Anuluj
									</Button>
									<Button
										onClick={handleDelete}
										variant='outlined'
										color='error'
										sx={{ marginBottom: 2 }}>
										Usuń
									</Button>
									<Button
										onClick={handleEditSave}
										variant='outlined'>
										Zapisz
									</Button>
								</div>
							) : (
								<div>
									<Button
										onClick={() => handleEditClick(group.id)}
										variant='outlined'>
										Edytuj
									</Button>
								</div>
							)}
						</div>
					))}
				{row.coachedGroups.length === 0 && row.role !== "owner" && (
					<Typography
						sx={{ mt: 1 }}
						variant='h6'
						color='red'
						align='center'>
						Trener nie przypisany do żadnej grupy
					</Typography>
				)}
				{row.role === "owner" && (
					<Typography
						sx={{ mt: 1 }}
						variant='h6'
						color='green'
						align='center'>
						Pełen dostęp
					</Typography>
				)}
			</DialogContent>
			<DialogActions>
				<Button
					startIcon={<AddIcon />}
					onClick={handleAddGroupClick}
					disabled={row.role === "owner" || addingGroup}
					variant='contained'>
					Dodaj grupę
				</Button>
				<Button
					startIcon={<CloseIcon />}
					onClick={() => handleOptionClick("no")}
					variant='outlined'>
					Zamknij
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DialogCoachGroups;
