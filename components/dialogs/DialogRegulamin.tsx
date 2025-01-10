import React from "react";
import { DialogRegulaminType } from "@/types/type";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
} from "@mui/material";
const DialogRegulamin: React.FC<DialogRegulaminType> = ({
	open,
	onClose,
	clubInfo,
}) => {
	return (
		<Dialog
			open={open}
			onClose={onClose}>
			<DialogTitle>
				<Typography sx={{ fontSize: 20 }}>
					Regulamin klubu <strong>{clubInfo.name}</strong>
				</Typography>
			</DialogTitle>
			<DialogContent dividers>
				<Typography>
					{clubInfo.regulamin
						? clubInfo.regulamin
						: "Klub nie udostępnił regulaminu"}
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={onClose}
					variant='outlined'>
					Zamknij
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DialogRegulamin;
