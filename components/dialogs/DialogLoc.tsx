import React, { useState } from "react";
import { DialogLocType } from "@/types/type";
import {
	Dialog,
	DialogActions,
	DialogContent,
	Typography,
	Button,
	TextField,
	Divider,
	CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import {
	Stack2,
	StyledDialogTitle,
	TextFieldStack,
	TypographyStack,
} from "../styled/StyledComponents";
import { addLoc } from "@/server/loc-action";

const DialogLoc: React.FC<DialogLocType> = ({ onClose, open, club }) => {
	const [isSending, setIsSending] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		street: "",
		city: "",
		postalCode: "",
		streetNr: "",
		club: club,
	});
	const [errors, setErrors] = useState({
		name: "",
		postalCode: "",
		server: "",
	});
	const handleClose = () => {
		clearForm();
		onClose();
	};
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};
	const validCheck = () => {
		let valid = true;
		const newErrors = { ...errors };

		if (formData.name.trim() === "") {
			newErrors.name = "Podaj nazwę lokalizacji";
			valid = false;
		} else if (formData.name !== "") {
			newErrors.name = "";
		}
		if (formData.postalCode !== "") {
			const postalregex = /^\d{2}-\d{3}$/;
			if (!postalregex.test(formData.postalCode)) {
				newErrors.postalCode = "Kod pocztowy powinien być w formacie XX-YYY";
				valid = false;
			} else {
				newErrors.postalCode = "";
			}
		} else {
			newErrors.postalCode = "";
		}

		setErrors(newErrors);
		return valid;
	};
	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const isOk = validCheck();
		if (isOk) {
			setIsSending(true);
			const message = await addLoc(formData);
			if (!("error" in message)) {
				setIsSending(false);
				handleClose();
			} else {
				console.error("Wystąpił błąd podczas tworzenia nowej lokalizacji.");
				setErrors({ ...errors, server: message.error });
				setIsSending(false);
			}
		} else {
			setIsSending(false);
		}
	};
	const clearForm = () => {
		setFormData({
			name: "",
			street: "",
			city: "",
			postalCode: "",
			streetNr: "",
			club: club,
		});
		setIsSending(false);
		setErrors({ name: "", postalCode: "", server: "" });
	};
	return (
		<Dialog
			open={open}
			onClose={handleClose}>
			<StyledDialogTitle>
				<Typography
					variant='h6'
					component='div'
					color='white'>
					Nowa lokalizacja
				</Typography>
				<CloseIcon
					onClick={handleClose}
					color='action'
				/>
			</StyledDialogTitle>
			<DialogContent dividers>
				<Typography color='red'>{errors.server}</Typography>
				<Stack2>
					<TypographyStack>Nazwa:</TypographyStack>
					<TextFieldStack
						required
						autoComplete='off'
						id='name'
						label='Nazwa'
						name='name'
						onChange={handleInputChange}
					/>
				</Stack2>
				<Typography color='red'>{errors.name}</Typography>
				<Divider variant='middle' />
				<Stack2>
					<TypographyStack>Ulica:</TypographyStack>
					<TextFieldStack
						autoComplete='off'
						id='street'
						label='Ulica'
						name='street'
						onChange={handleInputChange}
					/>
				</Stack2>
				<Divider variant='middle' />
				<Stack2>
					<TypographyStack>Numer:</TypographyStack>
					<TextFieldStack
						autoComplete='off'
						id='streetNr'
						label='Numer'
						name='streetNr'
						onChange={handleInputChange}
					/>
				</Stack2>
				<Divider variant='middle' />
				<Stack2>
					<TypographyStack>Miasto:</TypographyStack>
					<TextFieldStack
						autoComplete='off'
						id='city'
						label='Miasto'
						name='city'
						onChange={handleInputChange}
					/>
				</Stack2>
				<Divider variant='middle' />
				<Stack2>
					<TypographyStack>Kod pocztowy:</TypographyStack>
					<TextFieldStack
						autoComplete='off'
						id='postalCode'
						label='Kod pocztowy'
						name='postalCode'
						onChange={handleInputChange}
					/>
				</Stack2>
				<Typography color='red'>{errors.postalCode}</Typography>
			</DialogContent>
			<DialogActions sx={{ justifyContent: "space-between", mt: 1 }}>
				<Button onClick={handleClose}>Anuluj</Button>
				{isSending && <CircularProgress />}
				<Button
					variant='contained'
					endIcon={<AddIcon />}
					disabled={isSending}
					onClick={handleSubmit}>
					Dodaj
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DialogLoc;
