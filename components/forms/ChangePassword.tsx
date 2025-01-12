"use client";
import {
	Box,
	Button,
	FormControl,
	TextField,
	Typography,
	Avatar,
	Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useState } from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CelebrationIcon from "@mui/icons-material/Celebration";
import { useRouter } from "next/navigation";
import { passwordChange } from "@/server/authorize";

const ChangePassword = ({ user }: any) => {
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
			const response = await passwordChange({
				password: password,
				resetPasswordToken: user.resetPasswordToken,
			});
			if (!("error" in response)) {
				setSuccess(true);
			} else {
				setErrors({ ...errors, serverError: `${response.error}` });
			}
		}
	};
	return (
		<Box
			sx={{
				marginTop: 1,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				backgroundColor: "white",
				borderRadius: 4,
				p: 3,
				maxWidth: "400px",
			}}>
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
				<>
					<Avatar sx={{ m: 2, bgcolor: "secondary.main" }}>
						<LockOutlinedIcon />
					</Avatar>
					<Stack
						direction='column'
						gap={1}>
						<Typography
							variant='h5'
							mb={1}
							align='center'>
							Zmieniasz hasło dla{" "}
							<span style={{ fontWeight: "bold" }}>{user.email}</span>
						</Typography>
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
						<Stack
							direction='row'
							gap={2}>
							<Button
								fullWidth
								variant='outlined'
								onClick={() => router.push("/login")}>
								strona logowania
							</Button>

							<Button
								fullWidth
								variant='contained'
								onClick={handleSubmit}>
								Zapisz nowe hasło
							</Button>
						</Stack>

						<Typography color='error'>{errors.serverError}</Typography>
					</Stack>
				</>
			)}
		</Box>
	);
};

export default ChangePassword;
