"use client";

import PersonIcon from "@mui/icons-material/Person";
import CelebrationIcon from "@mui/icons-material/Celebration";
import {
	Box,
	Typography,
	Container,
	Grid,
	Select,
	CssBaseline,
	TextField,
	Button,
	Avatar,
	Fade,
	MenuItem,
	FormControl,
	InputLabel,
	List,
	ListItem,
	SelectChangeEvent,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import type { Group, LocWithGroups } from "@/types/type";
import PolishDayName from "@/context/PolishDayName";
import { ReversePolishName } from "@/context/PolishDayName";

type NGroup = {
	locId: string | number;
	locName: string;
	groupName: string;
	groupId: string | number;
	dayOfWeek: string;
};
type FormData = {
	email: string;
	name: string;
	surname: string;
	club: string;
	tel: string;
	groups: (number | string)[];
};

const ParticipantForm = () => {
	const router = useRouter();
	const [succes, setSucces] = useState(false);
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const [noLocs, setNoLocs] = useState(false);
	const [locWithGroups, setLocWithGroups] = useState<LocWithGroups[]>([]);
	const [selectedLocation, setSelectedLocation] = useState<
		LocWithGroups | null | undefined
	>(null); // Wybrana lokalizacja
	const [days, setDays] = useState<string[]>([]);
	const [groups, setGroups] = useState<Group[] | null>();
	const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string>(""); // Wybrany dzień tygodnia
	const [selectedGroups, setSelectedGroups] = useState<NGroup[]>([]);
	const [selectedGroupId, setSelectedGroupId] = useState<string>("");
	const [formData, setFormData] = useState<FormData>({
		email: "",
		name: "",
		surname: "",
		club: "",
		tel: "",
		groups: [],
	});
	const [errors, setErrors] = useState({
		email: "",
		tel: "",
		name: "",
		surname: "",
		serverError: "",
		group: "",
	});
	const fetchLocAndGroups = async () => {
		try {
			if (session?.user) {
				setFormData({ ...formData, club: session.user.club });
				const response = await fetch(`/api/form/${session?.user.club}`);
				if (response.ok) {
					const data: LocWithGroups[] | [] | { error: string } =
						await response.json();
					if (Array.isArray(data)) {
						if (data.length > 0) {
							setLocWithGroups(data);
						} else {
							setNoLocs(true);
						}
					}
					//console.log(data);
				}
				//console.log(session?.user.club);
			}
		} catch (error) {
			setErrors({ ...errors, serverError: "Sprawdź połączenie z internetem" });
		}
	};
	useEffect(() => {
		fetchLocAndGroups();
	}, [session]);

	const validateForm = () => {
		let valid = true;
		const newErrors = { ...errors };

		if (formData.name.trim() === "") {
			newErrors.name = "Podaj imię uczestnika";
			valid = false;
		} else if (formData.name !== "") {
			newErrors.name = "";
		}

		if (formData.surname.trim() === "") {
			newErrors.surname = "Podaj nazwisko uczestnika";
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
		} else if (formData.tel === "") {
			newErrors.tel = "";
		}
		if (formData.groups.length === 0) {
			newErrors.group = "Wybierz grupę i kliknij + dodaj";
			valid = false;
		} else if (formData.groups.length > 0) {
			newErrors.group = "";
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
		const isOk = validateForm();
		console.log(formData);
		if (isOk) {
			try {
				const response = await fetch("/api/participant", {
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
						email: "",
						tel: "",
						name: "",
						surname: "",
						group: "",
						serverError: `${errorData.error}`,
					});
				} else {
					setSucces(true);
				}
			} catch (error) {
				console.error(error);
				setErrors({
					email: "",
					tel: "",
					name: "",
					surname: "",
					group: "",
					serverError: "Wystąpił błąd podczas dodawania uczestnika",
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
	const handleLocationChange = (event: SelectChangeEvent) => {
		//console.log(event.target.value);
		const id = parseInt(event.target.value, 10);
		const selectedLocationData = locWithGroups.find(
			(location) => location.id === id
		);
		//console.log(selectedLocationData);
		setSelectedLocation(selectedLocationData);
		const daysOfWeek = selectedLocationData?.locationschedule.map(
			(schedule) => schedule.dayOfWeek
		);
		if (daysOfWeek) {
			const sortedDaysOfWeek = daysOfWeek.slice().sort((a, b) => {
				if (a === 0) return 1; // Jeśli a jest równa 0, umieść ją na końcu
				if (b === 0) return -1; // Jeśli b jest równa 0, umieść ją na koniec
				return a - b; // W przeciwnym razie sortuj normalnie
			});
			const uniqueDaysOfWeek = sortedDaysOfWeek.filter(
				(value, index, array) => {
					return index === array.indexOf(value);
				}
			);
			//console.log(uniqueDaysOfWeek);
			setDays(uniqueDaysOfWeek.map((day) => PolishDayName(day)));
		}
		setSelectedDayOfWeek("");
		setSelectedGroupId("");
	};
	const handleDayOfWeekChange = (
		event: React.ChangeEvent<{ value: string }>
	) => {
		//console.log(event.target.value);
		setSelectedDayOfWeek(event.target.value);
		const dayId = ReversePolishName(event.target.value);
		//console.log(dayId);
		const groupsInLoc = selectedLocation?.locationschedule.filter(
			(group) => group.dayOfWeek === dayId
		);
		groupsInLoc?.sort((a, b) => {
			const timeA = a.timeS.split(":").map(Number); // Konwersja czasu z formatu HH:mm na tablicę liczb (godzina, minuta)
			const timeB = b.timeS.split(":").map(Number);
			if (timeA[0] !== timeB[0]) {
				return Number(timeA[0]) - Number(timeB[0]);
			} else {
				return Number(timeA[1]) - Number(timeB[1]);
			}
		});
		//console.log(groupsInLoc);
		setGroups(groupsInLoc);
		setSelectedGroupId("");
	};
	const handleGroupChange = (event: React.ChangeEvent<{ value: string }>) => {
		//console.log(event.target.value);
		setSelectedGroupId(event.target.value);
	};
	const addGroup = (group: NGroup) => {
		if (selectedGroups.find((gr) => gr.groupId === group.groupId)) {
			setErrors({ ...errors, group: "Wybierz nową grupę" });
		} else {
			setSelectedGroups([...selectedGroups, group]);
			console.log(group);
			const id = [group.groupId];
			setFormData((prevData) => ({
				...prevData,
				groups: [...prevData.groups, ...id],
			}));

			setErrors({ ...errors, group: "" });
		}
	};
	const removeGroup = (groupId: string | number) => {
		const updatedGroups = selectedGroups.filter(
			(group) => group.groupId !== groupId
		);
		const ids = updatedGroups.map((group) => group.groupId);
		console.log(formData, updatedGroups, ids);
		setFormData({ ...formData, groups: ids });
		setSelectedGroups(updatedGroups);
	};
	const handleFormClean = () => {
		setFormData({
			...formData,
			email: "",
			name: "",
			surname: "",
			tel: "",
			groups: [],
		});
		setErrors({
			email: "",
			tel: "",
			name: "",
			surname: "",
			serverError: "",
			group: "",
		});
		setSelectedDayOfWeek("");
		setSelectedGroups([]);
		setSelectedGroupId("");
		setSelectedLocation(null);
		setSucces(false);
	};
	if (noLocs) {
		return (
			<Box
				sx={{
					mx: 3,
				}}>
				<Typography
					variant='h4'
					align='center'>
					Najpierw musisz utworzyć lokalizację z grupami
				</Typography>
				<Button
					sx={{ mt: 5 }}
					fullWidth
					variant='contained'
					onClick={() => router.push("/locations/new")}>
					Utwórz lokalizację
				</Button>
			</Box>
		);
	}
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
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}>
						<Avatar sx={{ m: "0.5", bgcolor: "secondary.main" }}>
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
							sx={{ mt: 2 }}>
							<Grid
								container
								spacing={2}>
								<Grid
									item
									xs={6}
									sm={12}>
									<TextField
										name='name'
										required
										fullWidth
										autoComplete='off'
										id='name'
										label='Imię'
										onChange={handleInputChange}
									/>
									<Typography color='error'>{errors.name}</Typography>
								</Grid>
								<Grid
									item
									xs={6}
									sm={12}>
									<TextField
										required
										fullWidth
										autoComplete='off'
										id='surname'
										label='Nazwisko'
										name='surname'
										onChange={handleInputChange}
									/>
									<Typography color='error'>{errors.surname}</Typography>
								</Grid>
								<Grid
									item
									xs={6}>
									<FormControl fullWidth>
										<InputLabel id='loc'>Lokalizacja</InputLabel>
										<Select
											labelId='loc'
											id='loc'
											label='Lokalizacja'
											defaultValue=''
											value={selectedLocation?.id || ""}
											onChange={handleLocationChange as any}>
											{locWithGroups.length > 0 &&
												locWithGroups.map((loc) => (
													<MenuItem
														key={loc.id}
														value={`${loc.id}`}>
														{loc.name}
													</MenuItem>
												))}
										</Select>
									</FormControl>
								</Grid>
								{selectedLocation && (
									<Grid
										item
										xs={6}>
										<FormControl fullWidth>
											<InputLabel id='day'>Dzień tygodnia</InputLabel>
											<Select
												labelId='day'
												id='day'
												label='Dzień tygodnia'
												defaultValue=''
												value={selectedDayOfWeek || ""}
												onChange={handleDayOfWeekChange as any}>
												{days.map((day) => (
													<MenuItem
														key={day}
														value={day}>
														{day}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</Grid>
								)}

								{selectedDayOfWeek && (
									<Grid
										item
										xs={6}>
										<FormControl fullWidth>
											<InputLabel id='group'>Grupa</InputLabel>
											<Select
												labelId='group'
												id='group'
												label='Grupa'
												defaultValue=''
												value={selectedGroupId || ""}
												onChange={handleGroupChange as any}>
												{groups &&
													groups !== null &&
													groups.map((group) => (
														<MenuItem
															key={group.timeS}
															value={group.id}>
															{group.name}
														</MenuItem>
													))}
											</Select>
										</FormControl>
									</Grid>
								)}

								{selectedGroupId !== "" && (
									<Grid
										item
										xs={6}>
										<Button
											fullWidth
											size='large'
											variant='outlined'
											sx={{ height: "100%" }}
											startIcon={<AddIcon />}
											onClick={() => {
												if (selectedLocation) {
													const foundGroup =
														selectedLocation?.locationschedule.find(
															(group) => group.id === Number(selectedGroupId)
														);
													if (foundGroup) {
														addGroup({
															locName: selectedLocation?.name,
															locId: selectedLocation?.id,
															dayOfWeek: selectedDayOfWeek,
															groupId: selectedGroupId,
															groupName: foundGroup.name,
														});
													}
												}
											}}>
											Dodaj
										</Button>
									</Grid>
								)}
								{errors.group !== "" && (
									<Grid item>
										<Typography color='error'>{errors.group}</Typography>
									</Grid>
								)}
								{selectedGroups.length > 0 && (
									<Fade
										timeout={1000}
										in={true}>
										<Grid
											item
											xs={12}>
											<List
												sx={{
													border: 1,
													borderColor: "blueviolet",
													borderRadius: 2,
												}}>
												{selectedGroups.map((group) => (
													<ListItem
														key={group.groupId}
														sx={{ justifyContent: "space-between" }}>
														<Typography
															color={"darkviolet"}
															variant='subtitle1'>
															{group.locName}
														</Typography>
														<Typography variant='subtitle1'>
															{group.dayOfWeek}
														</Typography>
														<Typography
															variant='subtitle1'
															fontWeight={"bold"}>
															{group.groupName}
														</Typography>
														<Button
															size='small'
															variant='outlined'
															color='error'
															onClick={() => removeGroup(group.groupId)}>
															Usuń
														</Button>
													</ListItem>
												))}
											</List>
										</Grid>
									</Fade>
								)}

								<Grid
									item
									xs={12}>
									<TextField
										fullWidth
										autoComplete='off'
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
										autoComplete='off'
										id='email'
										label='Adres Email'
										name='email'
										onChange={handleInputChange}
									/>

									<Typography color='error'>{errors.email}</Typography>
								</Grid>
							</Grid>
							<Grid
								container
								justifyContent={"space-around"}
								sx={{ marginY: "1rem" }}>
								<Button
									variant='outlined'
									onClick={() => router.push("/locations")}
									startIcon={<CloseIcon />}
									type='button'>
									Anuluj
								</Button>
								<Button
									type='submit'
									variant='contained'
									endIcon={<SendIcon />}>
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
							Udało ci się dodać uczestnika
						</Typography>
						<Button
							fullWidth
							variant='contained'
							onClick={handleFormClean}
							sx={{ mt: 6, mb: 2 }}>
							Dodaj następnego uczestnika
						</Button>
					</Box>
				</Fade>
			)}
		</Container>
	);
};

export default ParticipantForm;
