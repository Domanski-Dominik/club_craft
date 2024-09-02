import React from "react";
import { DialogDeleteGroupType } from "@/types/type";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import PolishDayName from "@/functions/PolishDayName";

const DialogDeleteGroup: React.FC<DialogDeleteGroupType> = ({
	onClose,
	open,
	group,
}) => {
	const handleClose = () => {
		onClose("no");
	};
	const handleOptionClick = (value: string) => {
		onClose(value);
	};
	if (group === null) {
		return null;
	}
	return (
		<Dialog
			open={open}
			onClose={handleClose}>
			<DialogTitle>Czy chcesz usunąć grupę?</DialogTitle>
			<DialogContent dividers>
				<Typography>
					Usuń <span style={{ fontWeight: "bold" }}>{group.name}</span>
					<br />
					{group.terms.map((t, index) => (
						<React.Fragment key={index}>
							({t.timeS}-{t.timeE} {PolishDayName(t.dayOfWeek)})
						</React.Fragment>
					))}
					<br />z bazy danych
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button
					variant='outlined'
					startIcon={<CloseIcon />}
					onClick={() => handleOptionClick("no")}>
					Nie
				</Button>
				<Button
					variant='contained'
					endIcon={<DeleteIcon />}
					onClick={() => handleOptionClick("yes")}>
					Tak
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DialogDeleteGroup;
