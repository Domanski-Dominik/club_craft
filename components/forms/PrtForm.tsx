"use client";

import React from "react";
import CelebrationIcon from "@mui/icons-material/Celebration";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { pl } from "date-fns/locale/pl";
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
	Checkbox,
	FormControlLabel,
	Accordion,
	useTheme,
	Divider,
	Collapse,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import type { Group, LocWithGroups } from "@/types/type";
import PolishDayName, { ReversePolishName } from "@/functions/PolishDayName";
import {
	StyledAccordionSummary,
	StyledAccordionSummaryNoExpand,
	StyledAccordionDetails,
	Stack2,
	StyledSwitch,
	TypographySwitch,
	BoxSwitch,
	TypographyStack,
	TextFieldStack,
} from "../styled/StyledComponents";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { useQueryClient } from "@tanstack/react-query";
import { useAddPrt } from "@/hooks/participantHooks";
import { format } from "date-fns";
import { Session } from "next-auth";
import { addParticipant } from "@/server/participant-actions";

type Props = {
	locWithGroups: any;
	session: Session;
};
type NGroup = {
	locId: string | number;
	locName: string;
	groupName: string;
	groupId: string | number;
	dayOfWeek: string;
};
type FormData = {
	email: string;
	firstName: string;
	lastName: string;
	club: string;
	phoneNumber: string;
	groups: number[];
	regulamin: boolean;
	contactWithParent: boolean;
	parentFirstName: string;
	parentLastName: string;
	note: string;
	signGroup: boolean;
	birthday: Date | null;
};

const ParticipantForm = (props: Props) => {
	const router = useRouter();
	const [succes, setSucces] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState<
		LocWithGroups | null | undefined
	>(null); // Wybrana lokalizacja
	const [groups, setGroups] = useState<Group[] | null>();
	const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string>(""); // Wybrany dzień tygodnia
	const [selectedGroups, setSelectedGroups] = useState<NGroup[]>([]);
	const [selectedGroupId, setSelectedGroupId] = useState<string>("");
	const [formData, setFormData] = useState<FormData>({
		email: "",
		firstName: "",
		lastName: "",
		club: props.session.user.club,
		phoneNumber: "",
		groups: [],
		regulamin: false,
		contactWithParent: false,
		parentFirstName: "",
		parentLastName: "",
		note: "",
		signGroup: false,
		birthday: null,
	});
	const [errors, setErrors] = useState({
		email: "",
		phoneNumber: "",
		firstName: "",
		lastName: "",
		serverError: "",
		group: "",
		parentFirstName: "",
		parentLastName: "",
		birthDay: "",
	});

	const validateForm = () => {
		let valid = true;
		const newErrors = { ...errors };

		if (formData.firstName.trim() === "") {
			newErrors.firstName = "Podaj imię uczestnika";
			valid = false;
		} else if (formData.firstName !== "") {
			newErrors.firstName = "";
		}

		if (formData.lastName.trim() === "") {
			newErrors.lastName = "Podaj nazwisko uczestnika";
			valid = false;
		} else {
			newErrors.lastName = "";
		}
		if (formData.parentFirstName.trim() === "" && formData.contactWithParent) {
			newErrors.parentFirstName = "Podaj imię opiekuna";
			valid = false;
		} else {
			newErrors.parentFirstName = "";
		}
		if (formData.parentLastName.trim() === "" && formData.contactWithParent) {
			newErrors.parentLastName = "Podaj nazwisko opiekuna";
			valid = false;
		} else {
			newErrors.parentLastName = "";
		}
		if (formData.phoneNumber !== "") {
			const hasOnlyDigits = /^\d+$/; // Sprawdzenie czy składa się tylko z cyfr
			if (!hasOnlyDigits.test(formData.phoneNumber.replace(/\s/g, ""))) {
				newErrors.phoneNumber =
					"Numer telefonu powinien składać się tylko z cyfr";
				valid = false;
			} else if (formData.phoneNumber.replace(/\s/g, "").length !== 9) {
				newErrors.phoneNumber = "Numer telefonu powinien składać się z 9 cyfr";
				valid = false;
			} else {
				newErrors.phoneNumber = "";
			}
		} else if (formData.phoneNumber === "") {
			newErrors.phoneNumber = "";
		}
		/*if (formData.groups.length === 0) {
			newErrors.group = "Wybierz grupę i kliknij + dodaj";
			valid = false;
		} else if (formData.groups.length > 0) {
			newErrors.group = "";
		}*/

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
		console.log(isOk);
		if (isOk) {
			try {
				const info = {
					...formData,
					birthday: formData.birthday
						? format(formData.birthday, "dd-MM-yyyy")
						: null,
				};
				const message = await addParticipant(info);
				console.log(message);
				if ("error" in message) {
					setErrors({
						parentFirstName: "",
						parentLastName: "",
						birthDay: "",
						email: "",
						phoneNumber: "",
						firstName: "",
						lastName: "",
						group: "",
						serverError: `${message.error}`,
					});
				} else {
					setSucces(true);
				}
			} catch (error) {
				console.error(error);
				setErrors({
					parentFirstName: "",
					parentLastName: "",
					birthDay: "",
					email: "",
					phoneNumber: "",
					firstName: "",
					lastName: "",
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
		const id = parseInt(event.target.value, 10);
		const selectedLocationData = props.locWithGroups.find(
			(location: any) => location.id === id
		);
		const groupsInLoc = selectedLocationData?.groups.filter((group: Group) =>
			group.terms.filter((t) => t.locationId === id)
		);
		if (groupsInLoc) {
			const sortedGroups = groupsInLoc.sort((a: any, b: any) => {
				// Sprawdź, czy grupy mają przypisane terminy (zakładam, że każda grupa ma przynajmniej jeden termin)
				const dayOfWeekA = a.terms?.[0]?.dayOfWeek || 0; // Jeśli brak terminu, domyślnie ustaw na 0 (np. niedziela)
				const dayOfWeekB = b.terms?.[0]?.dayOfWeek || 0;

				// Jeśli dni tygodnia są różne, sortuj według dnia tygodnia
				if (dayOfWeekA !== dayOfWeekB) {
					return dayOfWeekA - dayOfWeekB;
				}

				// Jeśli dni tygodnia są takie same, sortuj według nazwy grupy
				return a.name.localeCompare(b.name);
			});
			setGroups(sortedGroups);
		} else {
			setGroups(groupsInLoc);
		}
		//console.log(selectedLocationData);
		setSelectedLocation(selectedLocationData);
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
			const id = [Number(group.groupId)];
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
		const ids = updatedGroups.map((group) => Number(group.groupId));
		console.log(formData, updatedGroups, ids);
		setFormData({ ...formData, groups: ids });
		setSelectedGroups(updatedGroups);
	};
	const handleFormClean = () => {
		setFormData({
			...formData,
			email: "",
			firstName: "",
			lastName: "",
			phoneNumber: "",
			groups: [],
			regulamin: false,
			contactWithParent: false,
			parentFirstName: "",
			parentLastName: "",
			note: "",
			signGroup: false,
			birthday: null,
		});
		setErrors({
			parentFirstName: "",
			parentLastName: "",
			birthDay: "",
			email: "",
			phoneNumber: "",
			firstName: "",
			lastName: "",
			serverError: "",
			group: "",
		});
		setSelectedDayOfWeek("");
		setSelectedGroups([]);
		setSelectedGroupId("");
		setSelectedLocation(null);
		setSucces(false);
	};
	return (
		<Box sx={{ width: "calc(100% - 20px)" }}>
			{succes === false && (
				<>
					<Accordion expanded={true}>
						<StyledAccordionSummaryNoExpand>
							<Typography
								variant='h6'
								color='white'>
								Uczestnik
							</Typography>
						</StyledAccordionSummaryNoExpand>
						<StyledAccordionDetails>
							<Typography color='error'>{errors.serverError}</Typography>
							<Stack2>
								<TypographyStack>Imię:</TypographyStack>
								<TextFieldStack
									name='firstName'
									required
									autoComplete='off'
									id='firstName'
									label='Imię'
									onChange={handleInputChange}
								/>
							</Stack2>
							<Typography color='error'>{errors.firstName}</Typography>
							<Divider variant='middle' />
							<Stack2>
								<TypographyStack>Nazwisko:</TypographyStack>
								<TextFieldStack
									required
									autoComplete='off'
									id='lastName'
									label='Nazwisko'
									name='lastName'
									onChange={handleInputChange}
								/>
							</Stack2>
							<Typography color='error'>{errors.lastName}</Typography>
							<Divider variant='middle' />
							<Stack2>
								<TypographyStack>Data urodzenia:</TypographyStack>
								<Box width={"50%"}>
									<LocalizationProvider
										dateAdapter={AdapterDateFns}
										adapterLocale={pl}>
										<DatePicker
											label='Data urodzenia'
											value={formData.birthday}
											slotProps={{ textField: { size: "small" } }}
											onChange={(newValue) => {
												if (newValue)
													setFormData({ ...formData, birthday: newValue });
											}}
										/>
									</LocalizationProvider>
								</Box>
							</Stack2>
							<Divider variant='middle' />
							<Stack2>
								<TypographySwitch>Kontakt przez opiekuna:</TypographySwitch>
								<BoxSwitch>
									<StyledSwitch
										checked={formData.contactWithParent}
										onChange={() =>
											setFormData({
												...formData,
												contactWithParent: !formData.contactWithParent,
											})
										}
									/>
								</BoxSwitch>
							</Stack2>
							<Collapse in={!formData.contactWithParent}>
								<Divider variant='middle' />
								<Stack2>
									<TypographyStack>Telefon:</TypographyStack>
									<TextFieldStack
										autoComplete='off'
										id='phoneNumber'
										label='Numer telefonu'
										name='phoneNumber'
										onChange={handleInputChange}
									/>
								</Stack2>
								<Typography color='error'>{errors.phoneNumber}</Typography>
								<Divider variant='middle' />
								<Stack2>
									<TypographyStack>Email:</TypographyStack>
									<TextFieldStack
										autoComplete='off'
										id='email'
										label='Adres Email'
										name='email'
										onChange={handleInputChange}
									/>
								</Stack2>
								<Typography color='error'>{errors.email}</Typography>
							</Collapse>
						</StyledAccordionDetails>
					</Accordion>
					<Collapse in={formData.contactWithParent}>
						<Accordion defaultExpanded>
							<StyledAccordionSummary>
								<Typography
									variant='h6'
									color='white'>
									Rodzic
								</Typography>
							</StyledAccordionSummary>
							<StyledAccordionDetails>
								<Stack2>
									<TypographyStack>Imię:</TypographyStack>
									<TextFieldStack
										name='parentFirstName'
										required
										autoComplete='off'
										id='name'
										label='Imię opiekuna'
										onChange={handleInputChange}
									/>
								</Stack2>
								<Typography color='error'>{errors.parentFirstName}</Typography>
								<Divider variant='middle' />
								<Stack2>
									<TypographyStack>Nazwisko:</TypographyStack>
									<TextFieldStack
										name='parentLastName'
										required
										autoComplete='off'
										id='name'
										label='Nazwisko opiekuna'
										onChange={handleInputChange}
									/>
								</Stack2>
								<Typography color='error'>{errors.parentFirstName}</Typography>
								<Divider variant='middle' />
								<Stack2>
									<TypographyStack>Telefony:</TypographyStack>
									<TextFieldStack
										autoComplete='off'
										id='phoneNumber'
										label='Numer telefonu'
										name='phoneNumber'
										onChange={handleInputChange}
									/>
								</Stack2>
								<Typography color='error'>{errors.phoneNumber}</Typography>
								<Divider variant='middle' />
								<Stack2>
									<TypographyStack>Email:</TypographyStack>
									<TextFieldStack
										autoComplete='off'
										id='email'
										label='Adres Email'
										name='email'
										onChange={handleInputChange}
									/>
								</Stack2>
								<Typography color='error'>{errors.email}</Typography>
							</StyledAccordionDetails>
						</Accordion>
					</Collapse>
					<Accordion expanded={true}>
						<StyledAccordionSummaryNoExpand>
							<Typography
								variant='h6'
								color='white'>
								Własne pola
							</Typography>
						</StyledAccordionSummaryNoExpand>
						<StyledAccordionDetails>
							<Stack2>
								<TypographyStack>Notatka:</TypographyStack>
								<TextFieldStack
									autoComplete='off'
									id='note'
									label='Notatka'
									name='note'
									onChange={handleInputChange}
								/>
							</Stack2>
							<Divider variant='middle' />
							<Stack2>
								<TypographySwitch>Podpisał regulamin/ umowę:</TypographySwitch>
								<BoxSwitch>
									<StyledSwitch
										checked={formData.regulamin}
										onChange={() =>
											setFormData({
												...formData,
												regulamin: !formData.regulamin,
											})
										}
									/>
								</BoxSwitch>
							</Stack2>
							<Divider variant='middle' />
							<Stack2>
								<TypographySwitch>Przypisz do grupy:</TypographySwitch>
								<BoxSwitch>
									<StyledSwitch
										checked={formData.signGroup}
										onChange={() =>
											setFormData({
												...formData,
												signGroup: !formData.signGroup,
											})
										}
									/>
								</BoxSwitch>
							</Stack2>
						</StyledAccordionDetails>
					</Accordion>
					<Collapse in={formData.signGroup}>
						<Accordion expanded={true}>
							<StyledAccordionSummaryNoExpand>
								<Typography
									variant='h6'
									color='white'>
									Grupy
								</Typography>
							</StyledAccordionSummaryNoExpand>
							<StyledAccordionDetails>
								<>
									<Stack2>
										<TypographyStack>Lokalizacja:</TypographyStack>
										<Box width='50%'>
											<FormControl fullWidth>
												<InputLabel id='loc'>Lokalizacja</InputLabel>
												<Select
													labelId='loc'
													id='loc'
													label='Lokalizacja'
													defaultValue=''
													value={selectedLocation?.id || ""}
													onChange={handleLocationChange as any}>
													{props.locWithGroups.map((loc: any) => (
														<MenuItem
															key={loc.id}
															value={`${loc.id}`}>
															{loc.name}
														</MenuItem>
													))}
												</Select>
											</FormControl>
										</Box>
									</Stack2>
									<Divider variant='middle' />

									<Stack2>
										<TypographyStack>Grupa:</TypographyStack>
										<Box width='50%'>
											<FormControl fullWidth>
												<InputLabel id='group'>Grupa</InputLabel>
												<Select
													labelId='group'
													id='group'
													label='Grupa'
													defaultValue=''
													MenuProps={{
														slotProps: {
															paper: {
																style: {
																	maxHeight: 350,
																},
															},
														},
													}}
													value={selectedGroupId || ""}
													onChange={handleGroupChange as any}>
													{groups &&
														groups !== null &&
														groups.map((group, index) => (
															<MenuItem
																key={index}
																divider
																value={group.id}>
																<Box>
																	<Typography
																		variant='body1'
																		component='div'
																		sx={{ fontWeight: "bold" }}>
																		{group.name}
																	</Typography>
																	{group.terms.map((t, index) => (
																		<Typography
																			key={index}
																			variant='body2'
																			component='div'
																			sx={{ paddingLeft: "8px" }}>
																			{PolishDayName(t.dayOfWeek)} {t.timeS}-
																			{t.timeE}
																		</Typography>
																	))}
																</Box>
															</MenuItem>
														))}
												</Select>
											</FormControl>
										</Box>
									</Stack2>
									<Divider variant='middle' />
									<Stack2>
										<Button
											fullWidth
											size='large'
											variant='outlined'
											disabled={selectedGroupId === ""}
											sx={{ height: "100%" }}
											startIcon={<AddIcon />}
											onClick={() => {
												if (selectedLocation) {
													const foundGroup = selectedLocation?.groups.find(
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
									</Stack2>
									<Divider variant='middle' />
									{errors.group !== "" && (
										<Typography color='error'>{errors.group}</Typography>
									)}
									<Stack2>
										<List
											sx={{
												border: 1,
												borderColor: "blueviolet",
												borderRadius: 2,
												width: "100%",
											}}>
											{selectedGroups.length <= 0 && (
												<Typography align='center'>
													Brak dodanych grup
												</Typography>
											)}
											{selectedGroups.map((group) => (
												<ListItem
													key={group.groupId}
													sx={{ justifyContent: "space-between" }}>
													<Typography
														color={"darkviolet"}
														variant='subtitle1'>
														{group.locName}
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
									</Stack2>
								</>
							</StyledAccordionDetails>
						</Accordion>
					</Collapse>
					<Box
						width='100%'
						sx={{
							marginY: "1rem",
							justifyContent: "end",
							display: "flex",
						}}>
						<Button
							variant='outlined'
							onClick={() => router.push("/home")}
							startIcon={<CloseIcon />}
							type='button'
							sx={{ mx: 1 }}>
							Anuluj
						</Button>
						<Button
							type='submit'
							variant='contained'
							endIcon={<SendIcon />}
							onClick={handleSubmit}>
							Dodaj uczestnika
						</Button>
					</Box>
				</>
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
		</Box>
	);
};

export default ParticipantForm;
/*
<>
										<Typography variant='h6'>
											{LocWithGroups.isSuccess
												? "Brak dodanych grup, najpierw je utwórz"
												: "Błąd w trakcie pobierania grup"}
										</Typography>
									</>
*/
