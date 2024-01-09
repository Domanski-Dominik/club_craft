import React, { useEffect, useState } from "react";
import Loading from "@/context/Loading";
import CelebrationIcon from "@mui/icons-material/Celebration";
import {
	FormControl,
	TextField,
	Typography,
	Container,
	Button,
	Box,
	FormHelperText,
	LinearProgress,
	Fade,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useRouter, redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Location } from "@/types/type";

type Props = {
	locInfo: Location;
	type: string;
};

const LocForm: React.FC<Props> = ({ locInfo, type }: Props) => {
	const router = useRouter();
	const [id, setId] = useState();
	const [success, setSuccess] = useState(false);
	const [postalCode, setPostalCode] = useState(locInfo.postalCode);
	const [error, setError] = useState("");
	const [newLoc, setNewLoc] = useState({
		id: locInfo.id,
		name: locInfo.name,
		street: locInfo.street,
		city: locInfo.city,
		postalCode: locInfo.postalCode,
		streetNr: locInfo.streetNr,
		club: locInfo.club,
	});
	const [isSending, setIsSending] = useState(false);
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const [validFormat, setValidFormat] = useState(true);
	const handlePostalCodeChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = event.target.value;
		// Sprawdzenie czy wartość wprowadzona spełnia wymagania formatu kodu pocztowego
		const isValidFormat = /^\d{2}-\d{3}$/.test(value) || value === "";
		setValidFormat(isValidFormat);

		if (isValidFormat || value === "") {
			setNewLoc({ ...newLoc, postalCode: event.target.value });
		}
		setPostalCode(value);
		//console.log("pomocnicza: ", value, "   newLoc: ", newLoc.postalCode);
	};
	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (validFormat && newLoc.name !== "") {
			setIsSending(true);
			// Obsługa przesłania formularza
			console.log("Formularz został przesłany.");
			if (type === "edit") {
				try {
					const response = await fetch("/api/loc", {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(newLoc),
					});
					const data = await response.json();
					console.log(data, response);
					if (response.ok) {
						console.log("Zaktualizowano lokalizacje: ", data);
						//router.push(`/locations/new/${data.id}`);
						setSuccess(true);
						setIsSending(false);
					} else {
						setError(data.error);
						setIsSending(false);
					}
				} catch (error) {
					console.error("Wystąpił błąd podczas wykonywania żądania: ", error);
					setIsSending(false);
				}
			} else {
				try {
					const response = await fetch("/api/loc", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(newLoc),
					});
					const data = await response.json();
					if (response.ok) {
						setId(data.id);
						setSuccess(true);
						setIsSending(false);
					} else {
						console.error("Wystąpił błąd podczas tworzenia nowej lokalizacji.");
						setError(data.error);
						setIsSending(false);
					}
				} catch (error) {
					console.error("Wystąpił błąd podczas wykonywania żądania: ", error);
					setIsSending(false);
				}
			}
		} else {
			console.log('Kod pocztowy lub pole "name" jest niepoprawne.');
			setIsSending(false);
		}
	};
	if (status === "loading") return <Loading />;
	useEffect(() => {
		if (session?.user.club !== undefined) {
			setNewLoc({ ...newLoc, club: session?.user.club });
		} else {
			setNewLoc({ ...newLoc, club: "guest" });
		}
	}, [session]);

	return (
		<>
			{success === false && (
				<Fade
					in={!success}
					timeout={1000}>
					<Container>
						<Typography
							variant='h2'
							align='center'
							color='secondary'
							sx={{
								marginBottom: "1rem",
							}}>
							{type === "edit" ? "Edytuj " : "Utwórz "}
							Lokalizacje
						</Typography>
						<Typography
							variant='subtitle1'
							align='center'
							color={error === "" ? "" : "error"}
							sx={{ marginBottom: "2rem" }}>
							{error === ""
								? type === "edit"
									? "Edytuj wybraną lokalizacje!"
									: "Utwórz nową lokalizację do swojego klubu!"
								: error}
						</Typography>
						<Box
							component='form'
							onSubmit={handleSubmit}
							id='formId'>
							<Grid
								container
								spacing={2}
								direction={"row"}
								sx={{ justifyContent: "center" }}>
								<Grid
									xs={11}
									md={15}>
									<FormControl fullWidth>
										<TextField
											id={"outlined-basic"}
											type='text'
											value={newLoc.name}
											onChange={(e) =>
												setNewLoc({ ...newLoc, name: e.target.value })
											}
											label='Nazwa Lokalizacji'
											variant='outlined'
											required
											focused
											placeholder='Nazwa lokalizacji'
										/>
									</FormControl>
								</Grid>
								<Grid xs={8}>
									<FormControl fullWidth>
										<TextField
											id={"outlined-basic"}
											type='text'
											value={newLoc.street}
											onChange={(e) =>
												setNewLoc({ ...newLoc, street: e.target.value })
											}
											label='Ulica'
											variant='outlined'
											placeholder='Ulica'
										/>
									</FormControl>
								</Grid>
								<Grid xs={3}>
									<FormControl fullWidth>
										<TextField
											id={"outlined-basic"}
											type='text'
											value={newLoc.streetNr}
											onChange={(e) =>
												setNewLoc({ ...newLoc, streetNr: e.target.value })
											}
											label='Numer'
											variant='outlined'
											placeholder='Numer'
										/>
									</FormControl>
								</Grid>
								<Grid xs={6}>
									<FormControl fullWidth>
										<TextField
											id={"outlined-basic"}
											type='text'
											value={newLoc.city}
											onChange={(e) =>
												setNewLoc({ ...newLoc, city: e.target.value })
											}
											label='Miasto'
											variant='outlined'
											placeholder='Miasto'
										/>
									</FormControl>
								</Grid>
								<Grid xs={5}>
									<FormControl fullWidth>
										<TextField
											id={"outlined-basic"}
											value={postalCode}
											onChange={handlePostalCodeChange}
											label='Kod pocztowy'
											variant='outlined'
										/>
										{!validFormat && (
											<FormHelperText error>W formacie XX-YYY</FormHelperText>
										)}
									</FormControl>
								</Grid>
							</Grid>
							<Grid
								container
								sx={{ marginTop: "2rem", justifyContent: "center" }}
								columnSpacing={3}>
								<Grid>
									<Button
										variant='outlined'
										onClick={() => router.push("/locations")}
										color='warning'
										size='large'
										type='button'>
										Anuluj
									</Button>
								</Grid>
								<Grid>
									<Button
										variant='outlined'
										type='submit'
										color='success'
										size='large'
										form='formId'
										disabled={!validFormat || newLoc.name === "" || isSending}>
										{type === "edit" ? "Zapisz zamiany" : "Dodaj"}
									</Button>
								</Grid>
							</Grid>
						</Box>
					</Container>
				</Fade>
			)}
			{isSending && (
				<LinearProgress
					color='primary'
					sx={{ position: "absolute", bottom: 80, width: "100%" }}
				/>
			)}
			{success && (
				<Fade
					in={success}
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
							{type === "edit"
								? "Udało ci się zaktualizować lokalizacje"
								: "Udało ci się zapisać nową lokalizacje"}
						</Typography>
						<Button
							fullWidth
							variant='contained'
							onClick={() =>
								type === "edit"
									? router.push("/locations")
									: router.push(`/locations/new/${id}`)
							}
							sx={{ mt: 6, mb: 2 }}>
							{type === "edit" ? "Wróć do lokalizacji" : "Utwórz nowe grupy"}
						</Button>
					</Box>
				</Fade>
			)}
		</>
	);
};

export default LocForm;
