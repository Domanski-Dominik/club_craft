import React, { useState } from "react";
import {
	Box,
	Button,
	FormControl,
	TextField,
	Typography,
	Avatar,
	Stack,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CelebrationIcon from "@mui/icons-material/Celebration";
import { useRouter } from "next/navigation";
import { sendResetEmail } from "@/server/authorize";

const ResetPasswordForm = () => {
	const [email, setEmail] = useState<string>("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const router = useRouter();
	const handleSubmit = async () => {
		const response = await sendResetEmail(email);
		console.log(response);
		if (!("error" in response)) {
			setSuccess(true);
			setError("");
		} else {
			setError(`${response.error}`);
		}
	};
	return (
		<>
			{success ? (
				<Box
					maxWidth='xs'
					sx={{
						backgroundColor: "white",
						borderRadius: 4,
						p: 3,
						maxWidth: "400px",
					}}
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
						Udało się wysłać wiadomość, sprawdź skrzynkę email
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
						backgroundColor: "white",
						borderRadius: 4,
						p: 3,
						maxWidth: "400px",
					}}>
					<Avatar sx={{ m: 2, bgcolor: "secondary.main" }}>
						<LockOutlinedIcon />
					</Avatar>
					<Typography
						variant='h5'
						mb={3}
						align='center'>
						Wpisz swój email
					</Typography>
					<Typography
						color='error'
						mb={2}>
						{error !== "" && error}
					</Typography>
					<FormControl fullWidth>
						<TextField
							id={"outlined-basic"}
							autoComplete='off'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							label='Email'
							variant='outlined'
						/>
					</FormControl>
					<Stack
						direction={"row"}
						sx={{ mt: 3 }}
						gap={2}>
						<Button
							size='small'
							variant='outlined'
							onClick={() => router.push("/login")}>
							Wróć do strony logowania
						</Button>
						<Button
							size='small'
							onClick={handleSubmit}
							variant='contained'>
							Zresetuj hasło
						</Button>
					</Stack>
				</Box>
			)}
		</>
	);
};

export default ResetPasswordForm;
