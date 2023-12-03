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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Register = () => {
	const router = useRouter();
	const [data, setData] = useState({
		email: "",
		password: "",
		name: "",
		surname: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log(data);
		const response = await fetch("/api/register", {
			method: "POST",
			body: JSON.stringify({ data }),
		});
		const userInfo = await response.json();
		console.log(userInfo);
		router.push("/login");
	};

	return (
		<Container
			component='main'
			maxWidth='xs'>
			<CssBaseline />
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
							sm={6}>
							<TextField
								autoComplete='given-name'
								name='firstName'
								required
								fullWidth
								id='firstName'
								label='Imię'
								onChange={(e) => setData({ ...data, name: e.target.value })}
							/>
						</Grid>
						<Grid
							item
							xs={12}
							sm={6}>
							<TextField
								required
								fullWidth
								id='lastName'
								label='Nazwisko'
								name='lastName'
								autoComplete='family-name'
								onChange={(e) => setData({ ...data, surname: e.target.value })}
							/>
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
								onChange={(e) => setData({ ...data, email: e.target.value })}
							/>
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
								onChange={(e) => setData({ ...data, password: e.target.value })}
							/>
						</Grid>
						{/*<Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox value="allowExtraEmails" color="primary" />}
                label="I want to receive inspiration, marketing promotions and updates via email."
              />
            </Grid>*/}
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
		</Container>
	);
};

export default Register;
