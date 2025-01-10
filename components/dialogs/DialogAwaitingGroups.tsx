import PolishDayName, { ReversePolishName } from "@/functions/PolishDayName";
import React, { useEffect, useState } from "react";
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
	Box,
	Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import type { LocWithGroups, Group, Term } from "@/types/type";
import { Stack2, TypographyStack } from "../styled/StyledComponents";
import {
	updateAwaitingParticipantGroup,
	updateParticipantGroup,
} from "@/server/participant-actions";

const DialogAwaitingMoveToGroup: React.FC<DialogGroupsType> = ({
	onClose,
	open,
	row,
	locWithGroups,
}) => {
	if (row === null) {
		return null;
	}
	const [selectedLocation, setSelectedLocation] = useState<
		LocWithGroups | null | undefined
	>(null);
	const [groups, setGroups] = useState<Group[] | null | undefined>();
	const [selectedGroupId, setSelectedGroupId] = useState<string>("");
	const [error, setError] = useState("");

	const handleOptionClick = (value: string) => {
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
		onClose("");
	};
	const handleMoveToGroup = async () => {
		if (!selectedGroupId || !selectedLocation) {
			setError("Wybierz grupę i lokalizację przed zapisaniem.");
			return;
		}

		const group = groups?.find((g) => g.id === parseInt(selectedGroupId, 10));
		if (!group) {
			setError("Nie znaleziono wybranej grupy.");
			return;
		}

		const info = {
			participantId: row.id,
			row: row,
			groupIdToAdd: parseInt(selectedGroupId, 10),
			groupName: group.name,
			terms: group.terms.map(
				(t: any) =>
					`${PolishDayName(t.dayOfWeek)} ${t.timeS}-${t.timeE} (${
						t.location.name
					})`
			),
		};
		const message = await updateAwaitingParticipantGroup(info);
		if (!("error" in message)) {
			setError("");
			onClose(String(message.message));
		} else {
			setError(`${message.error}`);
		}
	};
	console.log(locWithGroups);
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
					onClick={handleMoveToGroup}
					variant='contained'
					endIcon={<SaveIcon />}>
					Przenieś
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DialogAwaitingMoveToGroup;
