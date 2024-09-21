"use client";
import {
	Box,
	Button,
	FormControl,
	TextField,
	Typography,
	Avatar,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useState } from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CelebrationIcon from "@mui/icons-material/Celebration";
import { useRouter } from "next/navigation";

interface ChangePasswordProps {
	user: {
		id: string;
		email: string;
		resetPasswordToken: string;
	};
}

const ChangePassword = ({ user }: ChangePasswordProps) => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const router = useRouter();
	const [errors, setErrors] = useState({
		password: "",
		confirmPassword: "",
		serverError: "",
	});
	const [success, setSuccess] = useState(false);

	const validateForm = () => {
		let valid = true;
		const newErrors = { ...errors };
		const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
		if (!passwordRegex.test(password)) {
			newErrors.password =
				"Hasło powinno zawierać co najmniej jedną dużą literę i jedną cyfrę (minimum 6 znaków)";
			valid = false;
		} else {
			newErrors.password = "";
		}
		if (password !== confirmPassword) {
			newErrors.confirmPassword = "Hasła nie są zgodne";
			valid = false;
		} else {
			newErrors.confirmPassword = "";
		}
		setErrors(newErrors);
		return valid;
	};

	const handleSubmit = async () => {
		if (validateForm()) {
			const response = await fetch("/api/user/password", {
				method: "PUT",
				body: JSON.stringify({
					password: password,
					resetpasswordtoken: user.resetPasswordToken,
				}),
			});
			const message = await response.json();
			if (!message.error) {
				setSuccess(true);
			} else {
				setErrors({ ...errors, serverError: message.error });
			}
		}
	};
	return (
		<>
			{success ? (
				<Box
					textAlign='center'
					width={"90%"}>
					<CelebrationIcon
						color='primary'
						sx={{ fontSize: "8rem" }}
					/>

					<Typography
						variant='h3'
						mt={4}
						color='blueviolet'
						textAlign='center'>
						Udało się zmienić hasło
					</Typography>
					<Button
						fullWidth
						variant='contained'
						onClick={() => router.push("/login")}
						sx={{ mt: 6, mb: 2 }}>
						Wróć do strony logowania
					</Button>
				</Box>
			) : (
				<Box
					sx={{
						marginTop: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						width: "90%",
					}}>
					<Avatar sx={{ m: 2, bgcolor: "secondary.main" }}>
						<LockOutlinedIcon />
					</Avatar>
					<Typography
						variant='h5'
						mb={3}
						align='center'>
						Zmieniasz hasło dla{" "}
						<span style={{ fontWeight: "bold" }}>{user.email}</span>
					</Typography>
					<Grid
						container
						component={"form"}
						spacing={2}>
						<Grid
							size={{
								xs: 12,
								sm: 12,
								md: 6,
								lg: 3,
								xl: 3,
							}}>
							<FormControl fullWidth>
								<TextField
									id={"outlined-basic"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									label='hasło'
									variant='outlined'
									required
									type='password'
									autoComplete='off'
								/>
							</FormControl>
							<Typography color='error'>{errors.password}</Typography>
						</Grid>
						<Grid
							size={{
								xs: 12,
								sm: 12,
								md: 6,
								lg: 3,
								xl: 3,
							}}>
							<FormControl fullWidth>
								<TextField
									id={"outlined-basic"}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									label='Powtórz hasło'
									variant='outlined'
									required
									type='password'
									autoComplete='off'
								/>
							</FormControl>
							<Typography color='error'>{errors.confirmPassword}</Typography>
						</Grid>
						<Grid
							size={{
								xs: 6,
								sm: 6,
								md: 6,
								lg: 3,
								xl: 3,
							}}>
							<Button
								fullWidth
								variant='outlined'
								onClick={() => router.push("/login")}>
								strona logowania
							</Button>
						</Grid>
						<Grid
							size={{
								xs: 6,
								sm: 6,
								md: 6,
								lg: 3,
								xl: 3,
							}}>
							<Button
								fullWidth
								variant='contained'
								onClick={handleSubmit}>
								Zapisz nowe hasło
							</Button>

							<Typography color='error'>{errors.serverError}</Typography>
						</Grid>
					</Grid>
				</Box>
			)}
		</>
	);
};

export default ChangePassword;
