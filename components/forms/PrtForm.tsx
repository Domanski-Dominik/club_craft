"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import CelebrationIcon from "@mui/icons-material/Celebration";
import {
	Box,
	Typography,
	Container,
	Grid,
	Link,
	CssBaseline,
	TextField,
	Button,
	Avatar,
	Fade,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AccountBox from "@mui/icons-material/AccountBox";

const ParticipantForm = () => {
	const router = useRouter();
	const [succes, setSucces] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		name: "",
		surname: "",
		club: "",
		tel: "",
	});
	const [errors, setErrors] = useState({
		email: "",
		tel: "",
		name: "",
		surname: "",
		serverError: "",
	});
	const validateForm = () => {
		let valid = true;
		const newErrors = { ...errors };

		if (formData.name.trim() === "") {
			newErrors.name = "Podaj swoje imię";
			valid = false;
		} else {
			newErrors.name = "";
		}

		if (formData.surname.trim() === "") {
			newErrors.surname = "Podaj swoje nazwisko";
			valid = false;
		} else {
			newErrors.surname = "";
		}
		if (formData.tel !== "") {
			const hasOnlyDigits = /^\d+$/; // Sprawdzenie czy składa się tylko z cyfr
			if (!hasOnlyDigits.test(formData.tel.replace(/\s/g, ""))) {
				newErrors.tel = "Numer telefonu powinien składać się tylko z cyfr";
				valid = false;
			} else if (formData.tel.replace(/\s/g, "").length !== 9) {
				newErrors.tel = "Numer telefonu powinien składać się z 9 cyfr";
				valid = false;
			} else {
				newErrors.tel = "";
			}
		} else {
			newErrors.tel = "";
		}

		// Walidacja pola email za pomocą wyrażenia regularnego
		if (formData.email !== "") {
			const emailRegex = /^\S+@\S+\.\S+$/;
			if (!emailRegex.test(formData.email)) {
				newErrors.email = "Niepoprawny format adresu email";
				valid = false;
			} else {
				newErrors.email = "";
			}
		} else {
			newErrors.email = "";
		}

		setErrors(newErrors);
		return valid;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log(formData);
		if (validateForm()) {
			try {
				const response = await fetch("/api/participants", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				});
				console.log(response);
				//const userInfo = await response.json();
				const errorData = await response.json();
				console.log(errorData);
				if (!response.ok) {
					setErrors({
						...errors,
						serverError: `${errorData.error}`,
					});
				} else {
					setSucces(true);
				}
			} catch (error) {
				console.error(error);
				setErrors({
					...errors,
					serverError: "Wystąpił błąd podczas rejestracji",
				});
			}
		} else {
			console.log("Formularz zawiera błędy, proszę poprawić dane");
		}

		//router.push("/login");
	};
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};
	return (
		<Container
			component='main'
			maxWidth='xs'>
			<CssBaseline />
			{succes === false && (
				<Fade
					in={!succes}
					timeout={1000}>
					<Box
						sx={{
							marginTop: 1,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}>
						<Avatar sx={{ m: 2, bgcolor: "secondary.main" }}>
							<PersonIcon />
						</Avatar>
						<Typography
							component='h1'
							variant='h4'>
							Dodaj Uczestnika
						</Typography>
						<Typography color='error'>{errors.serverError}</Typography>
						<Box
							component='form'
							noValidate
							onSubmit={handleSubmit}
							sx={{ mt: 3 }}>
							<Grid
								container
								spacing={2}>
								<Grid
									item
									xs={12}
									sm={12}>
									<TextField
										autoComplete='given-name'
										name='name'
										required
										fullWidth
										id='name'
										label='Imię'
										onChange={handleInputChange}
									/>
									<Typography color='error'>{errors.name}</Typography>
								</Grid>
								<Grid
									item
									xs={12}
									sm={12}>
									<TextField
										required
										fullWidth
										id='surname'
										label='Nazwisko'
										name='surname'
										autoComplete='family-name'
										onChange={handleInputChange}
									/>
									<Typography color='error'>{errors.surname}</Typography>
								</Grid>
								<Grid
									item
									xs={12}>
									<TextField
										fullWidth
										id='tel'
										label='Numer Telefonu'
										name='tel'
										onChange={handleInputChange}
									/>
									<Typography color='error'>{errors.tel}</Typography>
								</Grid>
								<Grid
									item
									xs={12}>
									<TextField
										fullWidth
										id='email'
										label='Adres Email'
										name='email'
										autoComplete='email'
										onChange={handleInputChange}
									/>
									<Typography color='error'>{errors.email}</Typography>
								</Grid>
							</Grid>
							<Grid
								container
								justifyContent={"space-around"}
								sx={{ marginY: "3rem" }}>
								<Button
									variant='contained'
									onClick={() => router.push("/locations")}
									color='warning'
									type='button'>
									Anuluj
								</Button>
								<Button
									type='submit'
									variant='contained'>
									Dodaj uczestnika
								</Button>
							</Grid>
						</Box>
					</Box>
				</Fade>
			)}
			{succes && (
				<Fade
					in={succes}
					timeout={1000}>
					<Box textAlign='center'>
						<CelebrationIcon
							color='primary'
							sx={{ fontSize: "8rem" }}
						/>

						<Typography
							variant='h3'
							mt={4}
							color='blueviolet'
							textAlign='center'>
							Udało ci się zarejestrować!
						</Typography>
						<Button
							fullWidth
							variant='contained'
							onClick={() => router.push("/login")}
							sx={{ mt: 6, mb: 2 }}>
							Przejdź do strony logowania
						</Button>
					</Box>
				</Fade>
			)}
		</Container>
	);
};

export default ParticipantForm;
