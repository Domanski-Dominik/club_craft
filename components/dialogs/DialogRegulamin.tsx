import React, { useState } from "react";
import { DialogRegulaminType } from "@/types/type";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
	TextField,
	useTheme,
	useMediaQuery,
} from "@mui/material";
import { updateClubInfo } from "@/server/club-actions";
const DialogRegulamin: React.FC<DialogRegulaminType> = ({
	open,
	onClose,
	clubInfo,
	settings,
	onSaveSuccess,
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editedRegulamin, setEditedRegulamin] = useState(
		clubInfo.regulamin || ""
	);
	const theme = useTheme();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
	const handleSave = async () => {
		const info = {
			regulamin: editedRegulamin,
			clubId: clubInfo.id,
		};
		const message = await updateClubInfo(info);
		if (!("error" in message)) {
			onSaveSuccess({
				message: "Udało się zaktualizować regulamin!",
				severity: "success",
			});
		} else {
			console.error(message.error);
			onSaveSuccess({
				message: "Nie udało się zaktualizować regulaminu!",
				severity: "error",
			});
		}

		setIsEditing(false);
	};
	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth={isSmallScreen ? "xs" : "md"} // Ustawia szerokość w zależności od ekranu
			PaperProps={{
				sx: {
					width: isSmallScreen ? "90%" : "70%", // Dodatkowe kontrolowanie szerokości
					maxHeight: "90vh", // Ograniczenie maksymalnej wysokości
				},
			}}>
			<DialogTitle>
				<Typography sx={{ fontSize: 20 }}>
					Regulamin klubu <strong>{clubInfo.name}</strong>
				</Typography>
			</DialogTitle>
			<DialogContent
				dividers
				sx={{
					minWidth: "300px",
				}}>
				{isEditing ? (
					<TextField
						value={editedRegulamin}
						onChange={(e) => setEditedRegulamin(e.target.value)}
						fullWidth
						multiline
						rows={14}
						variant='outlined'
						placeholder='Wpisz regulamin klubu...'
					/>
				) : (
					<Typography>
						{clubInfo.regulamin
							? clubInfo.regulamin
							: "Klub nie udostępnił regulaminu"}
					</Typography>
				)}
			</DialogContent>
			<DialogActions>
				{settings && !isEditing && (
					<Button
						variant='outlined'
						onClick={() => setIsEditing(true)}>
						Edytuj
					</Button>
				)}
				{isEditing && (
					<Button
						variant='outlined'
						onClick={handleSave}>
						Zapisz
					</Button>
				)}
				<Button
					onClick={onClose}
					variant='contained'>
					Zamknij
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DialogRegulamin;
