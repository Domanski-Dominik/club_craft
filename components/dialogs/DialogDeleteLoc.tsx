import { DialogDeleteLocType } from "@/types/type";
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

const DialogDeleteLoc: React.FC<DialogDeleteLocType> = ({
	onClose,
	open,
	loc,
}) => {
	const handleClose = () => {
		onClose("no");
	};
	const handleOptionClick = (value: string) => {
		onClose(value);
	};
	if (loc === null) {
		return null;
	}
	return (
		<Dialog
			open={open}
			onClose={handleClose}>
			<DialogTitle>Czy chcesz usunąć lokalizacje?</DialogTitle>
			<DialogContent dividers>
				<Typography>
					Usuń <span style={{ fontWeight: "bold" }}>{loc.name}</span>z bazy
					danych
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

export default DialogDeleteLoc;
