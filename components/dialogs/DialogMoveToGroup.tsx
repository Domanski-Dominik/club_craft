import PolishDayName, { ReversePolishName } from "@/functions/PolishDayName";
import React, { useEffect, useState } from "react";
import { DialogGroupsType } from "@/types/type";
import Grid from "@mui/material/Grid2";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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
	Box,
	Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import type {
	LocWithGroups,
	Group,
	Term,
	DialogMoveToGroupType,
} from "@/types/type";
import {
	useUpdatePrtGr,
	useDeletePrtGr,
	useEditPrtGr,
} from "@/hooks/participantHooks";
import { useQueryClient } from "@tanstack/react-query";
import { Stack2, TypographyStack } from "../styled/StyledComponents";
import {
	deleteParticipantGroup,
	updateParticipantGroup,
} from "@/server/participant-actions";

const DialogMoveToGroup: React.FC<DialogMoveToGroupType> = ({
	onClose,
	open,
	row,
	locWithGroups,
	groupId,
}) => {
	if (row === null) {
		return null;
	}
	const editGr = useEditPrtGr();
	const queryClient = useQueryClient();
	const [editedGroupId, setEditedGroupId] = useState<string | null>(null);
	const [selectedLocation, setSelectedLocation] = useState<
		LocWithGroups | null | undefined
	>(null);
	const [groups, setGroups] = useState<Group[] | null | undefined>();
	const [selectedGroupId, setSelectedGroupId] = useState<string>("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (locWithGroups && groupId) {
			// Find the location that contains the group
			const location = locWithGroups.find((loc: any) =>
				loc.terms.some((term: Term) => term.groupId === groupId)
			);

			if (location) {
				const sortedGroups = location.groups.sort((a, b) => {
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
				setSelectedLocation(location);
				setSelectedGroupId(String(groupId));
			}
		}
	}, [locWithGroups, groupId]);

	const handleOptionClick = (value: string) => {
		setEditedGroupId(null);
		onClose(value);
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
		if (locWithGroups && groupId) {
			// Find the location that contains the group
			const location = locWithGroups.find((loc: any) =>
				loc.terms.some((term: Term) => term.groupId === groupId)
			);

			if (location) {
				setSelectedLocation(location);
				setSelectedGroupId(String(groupId));
				setGroups(location.groups); // Set available groups in that location
			}
		}
		onClose("no");
	};
	const handleMoveToGroup = async () => {
		const info = {
			participantId: row.id,
			groupIdToRemove: groupId,
			groupIdToAdd: parseInt(selectedGroupId, 10),
		};
		const message = await updateParticipantGroup(info);
		if (!("error" in message)) {
			setError("");
			onClose(String(row.id));
		} else {
			setError(message.error);
		}
	};
	const handleDeleteFromGroup = async () => {
		const info = {
			participantId: row.id,
			groupId: groupId,
		};
		const message = await deleteParticipantGroup(info);
		if (!("error" in message)) {
			setError("");
			onClose(String(row.id));
		} else {
			setError(message.error);
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
					Przenieś do innej grupy: <br />
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
				<Stack2 mb={2}>
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
										sx: { maxHeight: { xs: 150, sm: 300 } },
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
				</Stack2>
				<Divider variant='middle' />
				<Stack2 mt={2}>
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
													{PolishDayName(t.dayOfWeek)} {t.timeS}-{t.timeE}
												</Typography>
											))}
										</Box>
									</MenuItem>
								))}
						</Select>
					</FormControl>
				</Stack2>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={() => handleOptionClick("no")}
					color='primary'
					variant='outlined'
					startIcon={<CloseIcon />}>
					Anuluj
				</Button>
				<Button
					onClick={handleDeleteFromGroup}
					color='error'
					variant='outlined'
					startIcon={<DeleteOutlineIcon />}>
					Wypisz
				</Button>
				<Button
					onClick={handleMoveToGroup}
					variant='contained'
					endIcon={<SaveIcon />}>
					Przenieś
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DialogMoveToGroup;
