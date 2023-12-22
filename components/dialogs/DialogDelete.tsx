import { DialogDeleteType } from "@/types/type";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";

const DialogDelete: React.FC<DialogDeleteType> = ({ onClose, open, row }) => {
	const handleClose = () => {
		onClose("no");
	};
	const handleOptionClick = (value: string) => {
		onClose(value);
	};
	if (row === null) {
		return null;
	}
	return (
		<Dialog
			open={open}
			onClose={handleClose}>
			<DialogTitle>Czy chcesz usunąć uczestnika?</DialogTitle>
			<DialogContent
				dividers>{`Usuń ${row.firstName} ${row.lastName} z bazy danych`}</DialogContent>
			<DialogActions>
				<Button onClick={() => handleOptionClick("no")}>No</Button>
				<Button onClick={() => handleOptionClick("yes")}>Yes</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DialogDelete;
