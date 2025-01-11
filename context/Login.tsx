"use client";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import PersonIcon from "@mui/icons-material/Person";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useState } from "react";
import { redirect } from "next/navigation";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { DEAFAULT_LOGIN_REDIRECT } from "@/routes";
import { login } from "@/server/authorize";

const Login = () => {
	const [data, setData] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const result = await signIn("credentials", {
				email: data.email,
				password: data.password,
				redirect: false, // Brak automatycznego przekierowania
			});

			if (result?.error) {
				setError(result.error); // Wyświetlenie komunikatu błędu
				return;
			}

			// Sukces logowania
			console.log("Zalogowano pomyślnie");
		} catch (error: any) {
			setError("Wystąpił problem podczas logowania. Spróbuj ponownie.");
		}
	};

	return (
		<Container
			component='main'
			maxWidth='xs'
			sx={{
				backgroundColor: "white",
				borderRadius: 4,
				py: 3,
			}}>
			<CssBaseline />
			<Box
				sx={{
					marginTop: 1,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}>
				<Avatar
					sx={{
						m: 1,
						bgcolor: "secondary.main",
						width: 70,
						height: 70,
					}}>
					<PersonIcon sx={{ width: 56, height: 56, color: "white" }} />
				</Avatar>
				<Typography
					component='h1'
					variant='h4'>
					Witaj ponownie
				</Typography>
				<Box
					component='form'
					onSubmit={handleSubmit}
					noValidate
					sx={{ mt: 1 }}>
					<TextField
						margin='normal'
						required
						fullWidth
						id='email'
						label='Adres email'
						name='email'
						autoComplete='email'
						onChange={(e) => setData({ ...data, email: e.target.value })}
					/>
					<TextField
						margin='normal'
						required
						fullWidth
						name='password'
						label='Hasło'
						type='password'
						id='password'
						autoComplete='current-password'
						onChange={(e) => setData({ ...data, password: e.target.value })}
					/>
					{error && <Typography color='error'>{error}</Typography>}
					{/*<FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />*/}
					<Button
						type='submit'
						fullWidth
						variant='contained'
						sx={{ mt: 3, mb: 2 }}>
						Zaloguj się
					</Button>
					<Grid container>
						<Grid
							item
							xs>
							<Link
								href='/reset'
								variant='body2'>
								Zapomniałeś hasła?
							</Link>
						</Grid>
						<Grid item>
							<Link
								href='/register'
								variant='body2'>
								{"Nie masz konta? Zarejestruj się"}
							</Link>
						</Grid>
					</Grid>
				</Box>
			</Box>
		</Container>
	);
};

export default Login;
