"use client";
import React, { useState, useEffect } from "react";
import {
	Tabs,
	Tab,
	Box,
	Accordion,
	Typography,
	Stack,
	useTheme,
	Divider,
	Switch,
	styled,
	switchClasses,
	TextField,
	Button,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	SelectChangeEvent,
	Grid2,
	Card,
	CardContent,
	AlertProps,
	Snackbar,
	Alert,
} from "@mui/material";
import {
	StyledAccordionSummary,
	StyledAccordionDetails,
	Stack2,
	StyledSwitch,
	BoxSwitch,
	TypographySwitch,
	TypographyStack,
} from "@/components/styled/StyledComponents";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUpdateClub } from "@/hooks/clubHooks";
import Loading from "@/context/Loading";
import StandardError from "@/components/errors/Standard";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import NotAllowed from "@/components/errors/NotAllowed";
import PaymentCard from "@/components/cards/PaymentCard";
import { constants } from "@/constants/constants";
import { updateClubInfo } from "@/server/club-actions";
import { club } from "@prisma/client";
import ResponsiveSnackbar from "../Snackbars/Snackbar";
interface Club {
	[key: string]: any; // Dodanie tego indeksu
	id: number;
	name: string;
	email: string | null;
	phoneNumber: string | null;
	paymentGroup: number;
	optionGroup: string;
	switchGroup: boolean;
	paymentSolo: number;
	optionSolo: string;
	switchSolo: boolean;
	// Dodaj tutaj inne pola
	customerEmail: string | null;
}

type Props = {
	clubInfo: Club;
};

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}
//TODO:Dodać czy może trener dodawać edytować grupy
function CustomTabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;
	<script
		async
		src='https://js.stripe.com/v3/buy-button.js'></script>;
	return (
		<div
			role='tabpanel'
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
			style={{ width: "100%", height: "100%" }}>
			{value === index && (
				<Box sx={{ pt: 2, width: "100%", mb: 12, height: "100%" }}>
					{children}
				</Box>
			)}
		</div>
	);
}

function a11yProps(index: number) {
	return {
		id: `simple-tab-${index}`,
		"aria-controls": `simple-tabpanel-${index}`,
	};
}

const BoxInput = styled(Box)({
	display: "flex",
	flexWrap: "wrap",
	justifyContent: "flex-start",
});

const SettingsTabs = (props: Props) => {
	const [value, setValue] = useState(0);
	const [editField, setEditField] = useState<string | null>(null);
	const [formData, setFormData] = useState<{ [key: string]: any }>({});
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect(`/login`);
		},
	});
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "error" | "warning" | "info" | "success";
	}>({ open: false, message: "", severity: "info" });
	const handleCloseSnackbar = () => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	};

	useEffect(() => {
		if (props.clubInfo) {
			setFormData({
				email: props.clubInfo.email,
				name: props.clubInfo.name,
				optionGroup: props.clubInfo.optionGroup,
				optionOneTime: props.clubInfo.optionOneTime,
				optionSolo: props.clubInfo.optionSolo,
				paymentCyclic: props.clubInfo.paymentCyclic,
				paymentGroup: props.clubInfo.paymentGroup,
				paymentOneTime: props.clubInfo.paymentOneTime,
				paymentSolo: props.clubInfo.paymentSolo,
				phoneNumber: props.clubInfo.phoneNumber,
			});
		}
	}, [props.clubInfo]);
	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	const handleEditClick = (field: string) => {
		setEditField(field);
		setFormData({ ...formData, [field]: props.clubInfo[field] });
	};

	const handleSaveClick = async () => {
		console.log(formData);
		setEditField(null);
		const info = {
			...formData,
			clubId: props.clubInfo.id,
			userId: session?.user.id,
		};
		const message = await updateClubInfo(info);
		if (!("error" in message)) {
			setSnackbar({
				open: true,
				message: "Udało się zaktualizować dane!",
				severity: "success",
			});
		} else {
			console.error(message.error);
			setSnackbar({
				open: true,
				message: "Nie udało się zaktualizować danych!",
				severity: "error",
			});
		}
	};

	const handleSwitchChange = (switchName: string) => async (event: any) => {
		const checked = event.target.checked;
		const info = {
			[switchName]: checked,
			clubId: props.clubInfo.id,
			userId: session?.user.id,
		};
		const message = await updateClubInfo(info);
		if (!("error" in message)) {
			setSnackbar({
				open: true,
				message: "Udało się zaktualizować dane!",
				severity: "success",
			});
		} else {
			console.error(message.error);
			setSnackbar({
				open: true,
				message: "Nie udało się zaktualizować danych!",
				severity: "error",
			});
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};
	const handleSelectChange = (e: SelectChangeEvent) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};
	return (
		<Box
			sx={{
				width: "100%",
				minHeight: "100%",
				display: "flex",
				flexDirection: "column",
			}}>
			<Box
				sx={{
					width: "100%",
					borderBottom: 1,
					borderColor: "divider",
				}}>
				<Tabs
					value={value}
					onChange={handleChange}
					aria-label='basic tabs example'
					variant='scrollable'
					scrollButtons='auto'>
					<Tab
						label='Ogólne'
						{...a11yProps(0)}
					/>
					<Tab
						label='Uprawnienia prowadzących'
						{...a11yProps(1)}
					/>
					<Tab
						label='Subskrybcja'
						{...a11yProps(2)}
					/>
				</Tabs>
			</Box>
			<CustomTabPanel
				value={value}
				index={0}>
				<Accordion
					defaultExpanded
					sx={{ width: "100%" }}
					elevation={0}>
					<StyledAccordionSummary>
						<Typography
							color={"white"}
							variant='h6'>
							Ustawienia klubu
						</Typography>
					</StyledAccordionSummary>
					<StyledAccordionDetails>
						<Stack2>
							<TypographyStack>Nazwa</TypographyStack>
							<Typography width='50%'>{props.clubInfo.name}</Typography>
						</Stack2>
						<Divider variant='middle' />
						<Stack2>
							<TypographyStack>Email</TypographyStack>
							<Typography
								width='50%'
								sx={{
									width: "50%",
									wordWrap: "break-word", // Wrap long words
									whiteSpace: "normal", // Allow text to wrap normally
									overflowWrap: "break-word", // Ensure long words break
									hyphens: "auto", // Hyphenate words where possible
								}}>
								{props.clubInfo.email}
							</Typography>
						</Stack2>
						<Divider variant='middle' />
						<Stack2>
							<TypographyStack>Numer Telefonu</TypographyStack>
							{editField === "phoneNumber" ? (
								<BoxInput width='50%'>
									<TextField
										sx={{ minWidth: 100 }}
										name='phoneNumber'
										value={formData.phoneNumber}
										onChange={handleInputChange}
									/>

									<CheckIcon
										sx={{ m: 2, fontSize: 30 }}
										color='success'
										onClick={() => handleSaveClick()}
									/>
									<CloseIcon
										sx={{ m: 2, fontSize: 30 }}
										color='warning'
										onClick={() => setEditField(null)}
									/>
								</BoxInput>
							) : (
								<BoxInput width='50%'>
									<Typography>
										{props.clubInfo.phoneNumber
											? props.clubInfo.phoneNumber
											: "Nie zapisany"}
									</Typography>
									<EditIcon
										sx={{ ml: 1 }}
										onClick={() => handleEditClick("phoneNumber")}
									/>
								</BoxInput>
							)}
						</Stack2>
					</StyledAccordionDetails>
				</Accordion>
				<Accordion
					defaultExpanded
					sx={{ width: "100%" }}
					elevation={0}>
					<StyledAccordionSummary>
						<Typography
							color={"white"}
							variant='h6'>
							Ustawienia płatności
						</Typography>
					</StyledAccordionSummary>
					<StyledAccordionDetails>
						{props.clubInfo.switchOneTime && (
							<>
								<Stack2>
									<TypographyStack>
										Domyślna cena zajęć jednorazowych
									</TypographyStack>
									<BoxInput width='25%'>
										{editField === "paymentOneTime" ? (
											<>
												<TextField
													sx={{ minWidth: 50 }}
													type='number'
													name='paymentOneTime'
													value={formData.paymentOneTime}
													onChange={handleInputChange}
												/>
												<CheckIcon
													sx={{ m: 2, fontSize: 30 }}
													color='success'
													onClick={handleSaveClick}
												/>
												<CloseIcon
													sx={{ m: 2, fontSize: 30 }}
													color='warning'
													onClick={() => setEditField(null)}
												/>
											</>
										) : (
											<>
												<Typography mr={1}>
													{props.clubInfo.paymentOneTime}
												</Typography>
												<EditIcon
													sx={{ ml: 1 }}
													onClick={() => handleEditClick("paymentOneTime")}
												/>
											</>
										)}
									</BoxInput>
									<Typography width='25%'>
										{props.clubInfo.optionOneTime}
									</Typography>
								</Stack2>
								<Divider variant='middle' />
							</>
						)}
						{props.clubInfo.switchSolo && (
							<>
								<Stack2>
									<TypographyStack>
										Domyślna cena zajęć indywidualnych
									</TypographyStack>
									<BoxInput
										width='25%'
										display='flex'
										flexWrap='wrap'>
										{editField === "paymentSolo" ? (
											<>
												<TextField
													sx={{ minWidth: 50 }}
													type='number'
													name='paymentSolo'
													value={formData.paymentSolo}
													onChange={handleInputChange}
												/>
												<CheckIcon
													sx={{ m: 2, fontSize: 30 }}
													color='success'
													onClick={() => handleSaveClick}
												/>
												<CloseIcon
													sx={{ m: 2, fontSize: 30 }}
													color='warning'
													onClick={() => setEditField(null)}
												/>
											</>
										) : (
											<>
												<Typography mr={1}>
													{props.clubInfo.paymentSolo}
												</Typography>
												<EditIcon
													sx={{ ml: 1 }}
													onClick={() => handleEditClick("paymentSolo")}
												/>
											</>
										)}
									</BoxInput>
									<BoxInput
										width='25%'
										display='flex'
										flexWrap='wrap'>
										{editField === "optionSolo" ? (
											<>
												<FormControl fullWidth>
													<InputLabel id='optionSolo'>Za X</InputLabel>
													<Select
														value={formData.optionSolo}
														onChange={handleSelectChange}
														label='za X'
														id='optionSolo'
														name='optionSolo'>
														<MenuItem value='za miesiąc'>za miesiąc</MenuItem>
														<MenuItem value='za zajęcia'>za zajęcia</MenuItem>
													</Select>
												</FormControl>
												<CheckIcon
													sx={{ m: 2, fontSize: 30 }}
													color='success'
													onClick={handleSaveClick}
												/>
												<CloseIcon
													sx={{ m: 2, fontSize: 30 }}
													color='warning'
													onClick={() => setEditField(null)}
												/>
											</>
										) : (
											<>
												<Typography>{props.clubInfo.optionSolo}</Typography>
												<EditIcon
													sx={{ ml: 1 }}
													onClick={() => handleEditClick("optionSolo")}
												/>
											</>
										)}
									</BoxInput>
								</Stack2>
								<Divider variant='middle' />
							</>
						)}
						<Stack2>
							<TypographyStack>Domyślna cena zajęć grupowych</TypographyStack>
							<BoxInput width='25%'>
								{editField === "paymentGroup" ? (
									<>
										<TextField
											sx={{ minWidth: 50 }}
											type='number'
											name='paymentGroup'
											value={formData.paymentGroup}
											onChange={handleInputChange}
										/>
										<CheckIcon
											sx={{ m: 2, fontSize: 30 }}
											color='success'
											onClick={() => handleSaveClick}
										/>
										<CloseIcon
											sx={{ m: 2, fontSize: 30 }}
											color='warning'
											onClick={() => setEditField(null)}
										/>
									</>
								) : (
									<>
										<Typography mr={1}>
											{props.clubInfo.paymentGroup}
										</Typography>
										<EditIcon
											sx={{ ml: 1 }}
											onClick={() => handleEditClick("paymentGroup")}
										/>
									</>
								)}
							</BoxInput>
							<BoxInput width='25%'>
								{editField === "optionGroup" ? (
									<>
										<FormControl fullWidth>
											<InputLabel id='optionGroup'>Za X</InputLabel>
											<Select
												value={formData.optionGroup}
												onChange={handleSelectChange}
												label='za X'
												id='optionGroup'
												name='optionGroup'>
												<MenuItem value='za miesiąc'>za miesiąc</MenuItem>
												<MenuItem value='za zajęcia'>za zajęcia</MenuItem>
											</Select>
										</FormControl>
										<CheckIcon
											sx={{ m: 2, fontSize: 30 }}
											color='success'
											onClick={handleSaveClick}
										/>
										<CloseIcon
											sx={{ m: 2, fontSize: 30 }}
											color='warning'
											onClick={() => setEditField(null)}
										/>
									</>
								) : (
									<>
										<Typography>{props.clubInfo.optionGroup}</Typography>
										<EditIcon
											sx={{ ml: 1 }}
											onClick={() => handleEditClick("optionGroup")}
										/>
									</>
								)}
							</BoxInput>
						</Stack2>
					</StyledAccordionDetails>
				</Accordion>

				<Accordion
					defaultExpanded
					sx={{ width: "100%" }}
					elevation={0}>
					<StyledAccordionSummary>
						<Typography
							color={"white"}
							variant='h6'>
							Funkcjonalności
						</Typography>
					</StyledAccordionSummary>
					<StyledAccordionDetails>
						<Stack2>
							<TypographySwitch>Zajęcia jednorazowe</TypographySwitch>
							<BoxSwitch>
								<StyledSwitch
									checked={props.clubInfo.switchOneTime}
									onChange={handleSwitchChange("switchOneTime")}
								/>
							</BoxSwitch>
						</Stack2>
						<Divider variant='middle' />
						<Stack2>
							<TypographySwitch>Zajęcia indywidualne</TypographySwitch>
							<BoxSwitch>
								<StyledSwitch
									checked={props.clubInfo.switchSolo}
									onChange={handleSwitchChange("switchSolo")}
								/>
							</BoxSwitch>
						</Stack2>
						<Divider variant='middle' />
						<Stack2>
							<TypographySwitch>Zastępstwa prowadzących</TypographySwitch>
							<BoxSwitch>
								<StyledSwitch
									checked={props.clubInfo.replacment}
									onChange={handleSwitchChange("replacment")}
								/>
							</BoxSwitch>
						</Stack2>
						<Divider variant='middle' />
						<Stack2>
							<TypographySwitch>Odrabianie nieobecności</TypographySwitch>
							<BoxSwitch>
								<StyledSwitch
									checked={props.clubInfo.workOut}
									onChange={handleSwitchChange("workOut")}
								/>
							</BoxSwitch>
						</Stack2>
					</StyledAccordionDetails>
				</Accordion>
			</CustomTabPanel>
			<CustomTabPanel
				value={value}
				index={1}>
				<Accordion
					defaultExpanded
					sx={{ width: "100%" }}
					elevation={0}>
					<StyledAccordionSummary>
						<Typography
							color={"white"}
							variant='h6'>
							Uprawnienia prowadzących
						</Typography>
					</StyledAccordionSummary>
					<StyledAccordionDetails>
						<Stack2>
							<TypographySwitch>Podgląd płatności</TypographySwitch>
							<BoxSwitch>
								<StyledSwitch
									checked={props.clubInfo.coachPayments}
									onChange={handleSwitchChange("coachPayments")}
								/>
							</BoxSwitch>
						</Stack2>
						<Divider variant='middle' />
						<Stack2>
							<TypographySwitch>Edycja uczestników</TypographySwitch>
							<BoxSwitch>
								<StyledSwitch
									checked={props.clubInfo.coachEditPrt}
									onChange={handleSwitchChange("coachEditPrt")}
								/>
							</BoxSwitch>
						</Stack2>
						<Divider variant='middle' />
						<Stack2>
							<TypographySwitch>
								Wprowadzanie nowych uczestników
							</TypographySwitch>
							<BoxSwitch>
								<StyledSwitch
									checked={props.clubInfo.coachNewPrt}
									onChange={handleSwitchChange("coachNewPrt")}
								/>
							</BoxSwitch>
						</Stack2>
					</StyledAccordionDetails>
				</Accordion>
			</CustomTabPanel>
			<CustomTabPanel
				value={value}
				index={2}>
				<Box
					sx={{
						width: "100%",
						height: "100%",
						backgroundColor: "white",
						borderRadius: 3,
						p: 3,
					}}>
					<Grid2
						container
						spacing={2}>
						<Grid2 size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
							<Card>
								<CardContent
									sx={{
										display: "flex",
										flexDirection: "column",
										justifyContent: "space-between",
										gap: 2,
										height: "290px",
									}}>
									<Typography
										variant='h4'
										align='center'>
										Zarządzaj
									</Typography>

									<Typography
										variant='h4'
										align='center'>
										subskrybcją
									</Typography>
									<Divider variant='middle' />
									<Button
										variant='contained'
										href={constants.customerBillingManage}>
										Zarządzaj
									</Button>
								</CardContent>
							</Card>
						</Grid2>
						<Grid2 size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
							<PaymentCard
								variant='Darmowy'
								amount={0}
								participants={50}
								coaches={1}
								clubEmail={props.clubInfo.email ? props.clubInfo.email : ""}
								clubId={String(props.clubInfo.id)}
								clubName={props.clubInfo.name}
								active={props.clubInfo.subscriptionPlan === null}
								subscriptionId={
									props.clubInfo.subscriptionId
										? props.clubInfo.subscriptionId
										: ""
								}
							/>
						</Grid2>
						<Grid2 size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
							<PaymentCard
								variant='Standard'
								amount={100}
								participants={100}
								coaches={3}
								clubEmail={props.clubInfo.email ? props.clubInfo.email : ""}
								clubId={String(props.clubInfo.id)}
								clubName={props.clubInfo.name}
								active={props.clubInfo.subscriptionPlan === "Standard"}
								subscriptionId={
									props.clubInfo.subscriptionId
										? props.clubInfo.subscriptionId
										: ""
								}
							/>
						</Grid2>
						<Grid2 size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
							<PaymentCard
								variant='Plus'
								amount={200}
								coaches={10}
								participants={250}
								clubEmail={props.clubInfo.email ? props.clubInfo.email : ""}
								clubId={String(props.clubInfo.id)}
								clubName={props.clubInfo.name}
								active={props.clubInfo.subscriptionPlan === "Plus"}
								subscriptionId={
									props.clubInfo.subscriptionId
										? props.clubInfo.subscriptionId
										: ""
								}
							/>
						</Grid2>
						<Grid2 size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
							<PaymentCard
								variant='Gold'
								amount={400}
								coaches={25}
								participants={500}
								clubEmail={props.clubInfo.email ? props.clubInfo.email : ""}
								clubId={String(props.clubInfo.id)}
								clubName={props.clubInfo.name}
								active={props.clubInfo.subscriptionPlan === "Gold"}
								subscriptionId={
									props.clubInfo.subscriptionId
										? props.clubInfo.subscriptionId
										: ""
								}
							/>
						</Grid2>
						<Grid2 size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
							<PaymentCard
								variant='Platinum'
								amount={600}
								coaches={0}
								participants={0}
								clubEmail={props.clubInfo.email ? props.clubInfo.email : ""}
								clubId={String(props.clubInfo.id)}
								clubName={props.clubInfo.name}
								active={props.clubInfo.subscriptionPlan === "Platinum"}
								subscriptionId={
									props.clubInfo.subscriptionId
										? props.clubInfo.subscriptionId
										: ""
								}
							/>
						</Grid2>
					</Grid2>
				</Box>
			</CustomTabPanel>
			<ResponsiveSnackbar
				open={snackbar.open}
				onClose={handleCloseSnackbar}
				message={snackbar.message}
				severity={snackbar.severity}
			/>
		</Box>
	);
};

export default SettingsTabs;
/*
        <Accordion defaultExpanded sx={{ width: "100%" }} elevation={0}>
          <StyledAccordionSummary>
            <Typography color={"white"} >
              STOPNIE ZAAWANSOWANIA
            </Typography>
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            <Stack
              direction="row"
              p={2}
              justifyContent="flex-start"
              alignItems="center">
              <Typography
                variant="h6"
                color={theme.palette.primary.main}
                width="100%">
                Początkujący
              </Typography>
            </Stack>
            <Divider variant="middle" />
            <Stack
              direction="row"
              p={2}
              justifyContent="space-evenly"
              alignItems="center">
              <Typography
                variant="h6"
                width="100%"
                color={theme.palette.primary.main}>
                Średnio zaawansowany
              </Typography>
            </Stack>
            <Divider variant="middle" />
            <Stack
              direction="row"
              p={2}
              justifyContent="space-evenly"
              alignItems="center">
              <Typography
                variant="h6"
                width="100%"
                color={theme.palette.primary.main}>
                Zaawansowany
              </Typography>
            </Stack>
          </StyledAccordionDetails>
        </Accordion>
         */
