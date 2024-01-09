import PolishDayName from "@/context/PolishDayName";
import { useState } from "react";
import { DialogGroupsType } from "@/types/type";
import { ReversePolishName } from "@/context/PolishDayName";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
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
} from "@mui/material";
import type { LocWithGroups, Group } from "@/types/type";

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
	const [days, setDays] = useState<string[]>([]);
	const [groups, setGroups] = useState<Group[] | null>();
	const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string>("");
	const [selectedGroupId, setSelectedGroupId] = useState<string>("");
	const [error, setError] = useState("");

	const handleOptionClick = (value: string) => {
		if (value === "yes") {
			// Tutaj dodaj logikę zapisywania zmienionych danych
			console.log("Zapisano zmiany dla grupy o id:", editedGroupId);
		}
		setEditedGroupId(null);
		onClose(value);
	};

	const handleEditClick = (groupId: string) => {
		setAddingGroup(false);
		console.log(groupId);
		setEditedGroupId(groupId);
		const loc = locWithGroups.find((loc) =>
			loc.locationschedule.find((group) => group.id === Number(groupId))
		);
		if (loc) setSelectedLocation(loc);
		const day = row.coachedGroups.find((obj: any) => obj.id === groupId);
		const daysOfWeek = loc?.locationschedule.map(
			(schedule) => schedule.dayOfWeek
		);
		if (daysOfWeek) {
			const sortedDaysOfWeek = daysOfWeek.slice().sort((a, b) => {
				if (a === 0) return 1;
				if (b === 0) return -1;
				return a - b;
			});
			const uniqueDaysOfWeek = sortedDaysOfWeek.filter(
				(value, index, array) => {
					return index === array.indexOf(value);
				}
			);
			//console.log(uniqueDaysOfWeek);
			setDays(uniqueDaysOfWeek.map((day) => PolishDayName(day)));
		}
		if (day) setSelectedDayOfWeek(PolishDayName(day.day));
		const groupsInLoc = loc?.locationschedule.filter(
			(group) => group.dayOfWeek === day.day
		);
		groupsInLoc?.sort((a, b) => {
			const timeA = a.timeS.split(":").map(Number);
			const timeB = b.timeS.split(":").map(Number);
			if (timeA[0] !== timeB[0]) {
				return Number(timeA[0]) - Number(timeB[0]);
			} else {
				return Number(timeA[1]) - Number(timeB[1]);
			}
		});
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
		setSelectedDayOfWeek("");
		setGroups([]);
		setDays([]);
	};

	const handleLocationChange = (event: SelectChangeEvent) => {
		//console.log(event.target.value);
		const id = parseInt(event.target.value, 10);
		const selectedLocationData = locWithGroups.find(
			(location) => location.id === id
		);
		//console.log(selectedLocationData);
		setSelectedLocation(selectedLocationData);
		const daysOfWeek = selectedLocationData?.locationschedule.map(
			(schedule) => schedule.dayOfWeek
		);
		if (daysOfWeek) {
			const sortedDaysOfWeek = daysOfWeek.slice().sort((a, b) => {
				if (a === 0) return 1;
				if (b === 0) return -1;
				return a - b;
			});
			const uniqueDaysOfWeek = sortedDaysOfWeek.filter(
				(value, index, array) => {
					return index === array.indexOf(value);
				}
			);
			//console.log(uniqueDaysOfWeek);
			setDays(uniqueDaysOfWeek.map((day) => PolishDayName(day)));
		}
		setGroups([]);
		setSelectedDayOfWeek("");
		setSelectedGroupId("");
	};

	const handleDayOfWeekChange = (
		event: React.ChangeEvent<{ value: string }>
	) => {
		//console.log(event.target.value);
		setSelectedDayOfWeek(event.target.value);
		const dayId = ReversePolishName(event.target.value);
		//console.log(dayId);
		const groupsInLoc = selectedLocation?.locationschedule.filter(
			(group) => group.dayOfWeek === dayId
		);
		groupsInLoc?.sort((a, b) => {
			const timeA = a.timeS.split(":").map(Number);
			const timeB = b.timeS.split(":").map(Number);
			if (timeA[0] !== timeB[0]) {
				return Number(timeA[0]) - Number(timeB[0]);
			} else {
				return Number(timeA[1]) - Number(timeB[1]);
			}
		});
		//console.log(groupsInLoc);
		setGroups(groupsInLoc);
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
		try {
			const response = await fetch(`/api/coaches/${row.club}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					coachId: coachId,
					groupId: groupId,
				}),
			});
			const newGroup = await response.json();
			console.log(newGroup);
			if (newGroup.name) {
				row.coachedGroups.push(newGroup);
				setEditedGroupId(null);
				setAddingGroup(false);
				setError("");
			}
			setError(newGroup.error);
		} catch (error: any) {
			console.error(error);
			setError(error.error);
		}
	};
	const handleDelete = async () => {
		const coachId = row.id;
		const groupId = parseInt(selectedGroupId, 10);
		try {
			const response = await fetch(`/api/coaches/${row.club}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					coachId: coachId,
					groupId: groupId,
				}),
			});
			if (response.ok) {
				const groups = row.coachedGroups;
				const newGroups = groups?.filter((g: any) => g.id !== groupId);
				row.coachedGroups = newGroups;
				setEditedGroupId(null);
				setError("");
			}
		} catch (error: any) {
			console.error(error);
			setError(error.error);
		}
	};
	const handleEditSave = async () => {
		if (editedGroupId !== null && selectedGroupId !== "") {
			const coachId = row.id;
			const groupIdToRemove = parseInt(editedGroupId, 10);
			const groupToAdd = parseInt(selectedGroupId, 10);
			try {
				const response = await fetch(`/api/coaches/${row.club}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						coachId: coachId,
						groupIdToRemove: groupIdToRemove,
						groupIdToAdd: groupToAdd,
					}),
				});
				const newGroup = await response.json();
				console.log(newGroup);
				if (newGroup.name) {
					row.coachedGroups.push(newGroup);
					const removedGroup = row.coachedGroups;
					const updatedGroups = removedGroup?.filter(
						(g: any) => g.id !== editedGroupId
					);
					row.coachedGroups = updatedGroups;
					setEditedGroupId(null);
					setAddingGroup(false);
					setError("");
				}
				setError(newGroup.error);
			} catch (error: any) {
				console.error(error);
				setError(error.error);
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
						<Grid
							container
							spacing={2}>
							<Grid xs={10}>
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
													value={`${loc.id}`}>
													{loc.name}
												</MenuItem>
											))}
									</Select>
								</FormControl>
							</Grid>
							<Grid xs={10}>
								<FormControl
									fullWidth
									size='small'>
									<InputLabel id='day'>Dzień tygodnia</InputLabel>
									<Select
										labelId='day'
										id='day'
										label='Dzień tygodnia'
										defaultValue=''
										value={selectedDayOfWeek || ""}
										onChange={handleDayOfWeekChange as any}>
										{days.map((day) => (
											<MenuItem
												key={day}
												value={day}>
												{day}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
							<Grid xs={10}>
								<FormControl
									fullWidth
									size='small'>
									<InputLabel id='group'>Grupa</InputLabel>
									<Select
										labelId='group'
										id='group'
										label='Grupa'
										defaultValue=''
										value={selectedGroupId || ""}
										onChange={handleGroupChange as any}>
										{groups &&
											groups !== null &&
											groups.map((group) => (
												<MenuItem
													key={group.timeS}
													value={group.id}>
													{group.name}
												</MenuItem>
											))}
									</Select>
								</FormControl>
							</Grid>
						</Grid>
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
				{row.coachedGroups.map((group: any) => (
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
								<Grid xs={10}>
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
														value={`${loc.id}`}>
														{loc.name}
													</MenuItem>
												))}
										</Select>
									</FormControl>
								</Grid>
								<Grid xs={10}>
									<FormControl
										fullWidth
										size='small'>
										<InputLabel id='day'>Dzień tygodnia</InputLabel>
										<Select
											labelId='day'
											id='day'
											label='Dzień tygodnia'
											defaultValue=''
											value={selectedDayOfWeek || ""}
											onChange={handleDayOfWeekChange as any}>
											{days.map((day) => (
												<MenuItem
													key={day}
													value={day}>
													{day}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>
								<Grid xs={10}>
									<FormControl
										fullWidth
										size='small'>
										<InputLabel id='group'>Grupa</InputLabel>
										<Select
											labelId='group'
											id='group'
											label='Grupa'
											defaultValue=''
											value={selectedGroupId || ""}
											onChange={handleGroupChange as any}>
											{groups &&
												groups !== null &&
												groups.map((group) => (
													<MenuItem
														key={group.timeS}
														value={group.id}>
														{group.name}
													</MenuItem>
												))}
										</Select>
									</FormControl>
								</Grid>
							</Grid>
						) : (
							<Typography sx={{ my: 1.5 }}>
								<span style={{ color: "darkviolet" }}>{group.location}, </span>
								{PolishDayName(group.day)}:{" "}
								<span style={{ fontWeight: "bold" }}>{group.name}</span>
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
				<Button onClick={handleAddGroupClick}>Dodaj grupę</Button>
				<Button
					onClick={() => handleOptionClick("no")}
					color='warning'>
					Zamknij
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DialogCoachGroups;
