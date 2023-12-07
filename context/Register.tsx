"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
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

const Register = () => {
	const router = useRouter();
	const [succes, setSucces] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		name: "",
		surname: "",
		club: "",
		role: "owner",
	});
	const [errors, setErrors] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		name: "",
		surname: "",
		club: "",
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
		// Walidacja pola email za pomocą wyrażenia regularnego
		const emailRegex = /^\S+@\S+\.\S+$/;
		if (!emailRegex.test(formData.email)) {
			newErrors.email = "Niepoprawny format adresu email";
			valid = false;
		} else {
			newErrors.email = "";
		}

		// Walidacja pola klubu - tylko litery i cyfry bez znaków białych
		const clubRegex = /^[a-zA-Z0-9]+$/;
		if (!clubRegex.test(formData.club)) {
			newErrors.club =
				"Nazwa klubu powinna zawierać tylko litery i cyfry bez znaków białych";
			valid = false;
		} else {
			newErrors.club = "";
		}

		// Walidacja pola hasła - co najmniej jedna duża litera i jedna cyfra
		const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
		if (!passwordRegex.test(formData.password)) {
			newErrors.password =
				"Hasło powinno zawierać co najmniej jedną dużą literę i jedną cyfrę (minimum 6 znaków)";
			valid = false;
		} else {
			newErrors.password = "";
		}

		// Walidacja pola powtórz hasło
		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Hasła nie są zgodne";
			valid = false;
		} else {
			newErrors.confirmPassword = "";
		}
		setErrors(newErrors);
		return valid;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log(formData);
		if (validateForm()) {
			try {
				const response = await fetch("/api/register", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ formData }),
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
						<Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
							<LockOutlinedIcon />
						</Avatar>
						<Typography
							component='h1'
							variant='h4'>
							Zarejestruj się
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
									xs={6}
									sm={6}>
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
									xs={6}
									sm={6}>
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
									xs={12}
									sm={12}>
									<TextField
										autoComplete='given-name'
										name='club'
										required
										fullWidth
										id='club'
										label='Nazwa klubu'
										onChange={handleInputChange}
									/>
									<Typography color='error'>{errors.club}</Typography>
								</Grid>
								<Grid
									item
									xs={12}>
									<TextField
										required
										fullWidth
										id='email'
										label='Adres Email'
										name='email'
										autoComplete='email'
										onChange={handleInputChange}
									/>
									<Typography color='error'>{errors.email}</Typography>
								</Grid>
								<Grid
									item
									xs={12}>
									<TextField
										required
										fullWidth
										name='password'
										label='Hasło'
										type='password'
										id='password'
										autoComplete='new-password'
										onChange={handleInputChange}
									/>
									<Typography color='error'>{errors.password}</Typography>
								</Grid>
								<Grid
									item
									xs={12}>
									<TextField
										required
										fullWidth
										name='confirmPassword'
										label='Powtórz Hasło'
										type='password'
										id='confirmPassword'
										onChange={handleInputChange}
									/>
									<Typography color='error'>
										{errors.confirmPassword}
									</Typography>
								</Grid>
							</Grid>
							<Button
								type='submit'
								fullWidth
								variant='contained'
								sx={{ mt: 3, mb: 2 }}>
								Zarejestruj się
							</Button>
							<Grid
								container
								justifyContent='flex-end'>
								<Grid item>
									<Link
										href='/login'
										variant='body2'>
										Masz już konto? Zaloguj się
									</Link>
								</Grid>
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

export default Register;
/*<Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox value="allowExtraEmails" color="primary" />}
                label="I want to receive inspiration, marketing promotions and updates via email."
              />
            </Grid>*/
