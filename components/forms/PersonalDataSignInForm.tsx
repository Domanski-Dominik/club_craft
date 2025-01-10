"use client";
import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	TextField,
	Typography,
	Grid2,
	Checkbox,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { pl } from "date-fns/locale";
import { differenceInYears } from "date-fns";
import DialogRegulamin from "../dialogs/DialogRegulamin";

interface Props {
	formData: any;
	clubInfo: any;
	onChange: (formData: any) => void;
	onBack: () => void;
}

const PersonalDataForm = ({ formData, onChange, onBack, clubInfo }: Props) => {
	const [localFormData, setLocalFormData] = useState(formData);
	const [isFormValid, setIsFormValid] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [touched, setTouched] = useState({
		childFirstName: false,
		childLastName: false,
		parentFirstName: false,
		parentLastName: false,
		email: false,
		phone: false,
		birthDate: false,
		regulamin: false,
	});
	const [errors, setErrors] = useState({
		childFirstName: false,
		childLastName: false,
		parentFirstName: false,
		parentLastName: false,
		email: false,
		phone: false,
		birthDate: false,
		regulamin: false,
	});

	const validateForm = () => {
		const newErrors = {
			childFirstName: localFormData.childFirstName.trim() === "",
			childLastName: localFormData.childLastName.trim() === "",
			parentFirstName: localFormData.parentFirstName.trim() === "",
			parentLastName: localFormData.parentLastName.trim() === "",
			email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localFormData.email),
			phone: !/^\d{9,15}$/.test(localFormData.phone),
			birthDate:
				!localFormData.birthDate ||
				differenceInYears(new Date(), localFormData.birthDate) < 3,
			regulamin: clubInfo.regulamin && localFormData.regulamin === false,
		};

		setErrors(newErrors);

		// Check if all fields are valid
		const isValid = Object.values(newErrors).every((error) => !error);
		setIsFormValid(isValid);
	};

	useEffect(() => {
		validateForm();
	}, [localFormData]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLocalFormData({ ...localFormData, [e.target.name]: e.target.value });
	};

	const handleDateChange = (date: Date | null) => {
		setLocalFormData({ ...localFormData, birthDate: date });
		setTouched({ ...touched, birthDate: true }); // Oznacz pole jako "dotknięte"
	};

	const handleBlur = (field: keyof typeof touched) => {
		setTouched({ ...touched, [field]: true });
	};

	const handleSubmit = () => {
		if (isFormValid) {
			onChange(localFormData);
		}
	};

	return (
		<Box>
			<Typography
				variant='h5'
				align='center'
				my={2}>
				Formularz danych osobowych
			</Typography>
			<Grid2
				container
				spacing={2}>
				<Grid2 size={6}>
					<TextField
						fullWidth
						label='Imię dziecka'
						name='childFirstName'
						value={localFormData.childFirstName}
						onChange={handleInputChange}
						onBlur={() => handleBlur("childFirstName")}
						error={touched.childFirstName && errors.childFirstName}
						helperText={
							touched.childFirstName && errors.childFirstName
								? "To pole jest wymagane"
								: ""
						}
					/>
				</Grid2>
				<Grid2 size={6}>
					<TextField
						fullWidth
						label='Nazwisko dziecka'
						name='childLastName'
						value={localFormData.childLastName}
						onChange={handleInputChange}
						onBlur={() => handleBlur("childLastName")}
						error={touched.childLastName && errors.childLastName}
						helperText={
							touched.childLastName && errors.childLastName
								? "To pole jest wymagane"
								: ""
						}
					/>
				</Grid2>
				<Grid2 size={6}>
					<TextField
						fullWidth
						label='Email'
						name='email'
						value={localFormData.email}
						onChange={handleInputChange}
						onBlur={() => handleBlur("email")}
						error={touched.email && errors.email}
						helperText={
							touched.email && errors.email ? "Podaj poprawny adres email" : ""
						}
					/>
				</Grid2>
				<Grid2 size={6}>
					<TextField
						fullWidth
						label='Numer telefonu'
						name='phone'
						value={localFormData.phone}
						onChange={handleInputChange}
						onBlur={() => handleBlur("phone")}
						error={touched.phone && errors.phone}
						helperText={
							touched.phone && errors.phone
								? "Podaj poprawny numer telefonu"
								: ""
						}
					/>
				</Grid2>
				<Grid2 size={6}>
					<TextField
						fullWidth
						label='Imię rodzica'
						name='parentFirstName'
						value={localFormData.parentFirstName}
						onChange={handleInputChange}
						onBlur={() => handleBlur("parentFirstName")}
						error={touched.parentFirstName && errors.parentFirstName}
						helperText={
							touched.parentFirstName && errors.parentFirstName
								? "To pole jest wymagane"
								: ""
						}
					/>
				</Grid2>
				<Grid2 size={6}>
					<TextField
						fullWidth
						label='Nazwisko rodzica'
						name='parentLastName'
						value={localFormData.parentLastName}
						onChange={handleInputChange}
						onBlur={() => handleBlur("parentLastName")}
						error={touched.parentLastName && errors.parentLastName}
						helperText={
							touched.parentLastName && errors.parentLastName
								? "To pole jest wymagane"
								: ""
						}
					/>
				</Grid2>
				<Grid2 size={12}>
					<LocalizationProvider
						dateAdapter={AdapterDateFns}
						adapterLocale={pl}>
						<DatePicker
							label='Data urodzenia dziecka'
							value={localFormData.birthDate || null}
							onChange={handleDateChange}
							slotProps={{
								textField: {
									fullWidth: true,
									error: touched.birthDate && errors.birthDate,
									helperText:
										touched.birthDate && errors.birthDate
											? "Data musi być dalsza niż 3 lata od teraz"
											: "",
								},
							}}
						/>
					</LocalizationProvider>
				</Grid2>
				{clubInfo.regulamin && (
					<Grid2
						size={12}
						sx={{ display: "flex", alignItems: "center" }}>
						<Checkbox
							value={localFormData.regulamin}
							checked={localFormData.regulamin}
							onChange={(e) => {
								setLocalFormData({
									...localFormData,
									regulamin: e.target.checked,
								});
								setTouched((prev) => ({ ...prev, regulamin: true }));
							}}
						/>{" "}
						<Typography>Akceptuję regulamin</Typography>
						<Button onClick={() => setDialogOpen(true)}>Pokaż</Button>
					</Grid2>
				)}

				{clubInfo.regulamin && errors.regulamin && touched.regulamin && (
					<Typography color='red'>
						Proszę zaakceptować regulamin klubu
					</Typography>
				)}
			</Grid2>
			<Box
				display='flex'
				justifyContent='space-between'
				mt={3}>
				<Button
					variant='outlined'
					onClick={onBack}>
					Cofnij
				</Button>
				<Button
					variant='contained'
					color='primary'
					onClick={handleSubmit}
					disabled={!isFormValid}>
					Dalej
				</Button>
			</Box>
			<DialogRegulamin
				onClose={() => setDialogOpen(false)}
				open={dialogOpen}
				clubInfo={clubInfo}
			/>
		</Box>
	);
};

export default PersonalDataForm;
