import React, { useState } from "react";
import { DialogLocType, Location } from "@/types/type";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
	Button,
	TextField,
	Divider,
	FormHelperText,
	CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import {
	Stack2,
	StyledDialogTitle,
	TypographyStack,
} from "../styled/StyledComponents";
import { useQueryClient } from "@tanstack/react-query";
import { useAddLoc } from "@/hooks/scheduleHooks";

const DialogLoc: React.FC<DialogLocType> = ({ onClose, open, club }) => {
	const addLoc = useAddLoc();
	const queryClient = useQueryClient();
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

			const message = await addLoc.mutateAsync(formData);
			if (!message.error) {
				console.log(message);
				setIsSending(false);
				queryClient.invalidateQueries({
					queryKey: ["locs"],
					refetchType: "all",
				});
				queryClient.invalidateQueries({
					queryKey: ["locWithGroups"],
					refetchType: "all",
				});
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
					<TextField
						required
						sx={{ width: "50%" }}
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
					<TextField
						sx={{ width: "50%" }}
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
					<TextField
						sx={{ width: "50%" }}
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
					<TextField
						sx={{ width: "50%" }}
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
					<TextField
						sx={{ width: "50%" }}
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
