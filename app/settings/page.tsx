"use client";
import React, { useState } from "react";
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
} from "@mui/material";
import {
	StyledAccordionSummary,
	StyledAccordionDetails,
} from "@/components/accordions/accordions";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useUpdateClub } from "@/hooks/clubHooks";
import Loading from "@/context/Loading";
import StandardError from "@/components/errors/Standard";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function CustomTabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role='tabpanel'
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
			style={{ width: "100%" }}>
			{value === index && (
				<Box sx={{ pt: 2, width: "100%", mb: 12 }}>{children}</Box>
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
const StyledSwitch = styled(Switch)({
	width: 80,
	height: 48,
	padding: 8,
	[`& .${switchClasses.switchBase}`]: {
		padding: 11,
		color: "#ff6a00",
	},
	[`& .${switchClasses.thumb}`]: {
		width: 26,
		height: 26,
		backgroundColor: "#fff",
	},
	[`& .${switchClasses.track}`]: {
		background: "linear-gradient(to right, #ee0979, #ff6a00)",
		opacity: "1 !important",
		borderRadius: 20,
		position: "relative",
		"&:before, &:after": {
			display: "inline-block",
			position: "absolute",
			top: "50%",
			width: "50%",
			transform: "translateY(-50%)",
			color: "#fff",
			textAlign: "center",
			fontSize: "0.75rem",
			fontWeight: 500,
		},
		"&:before": {
			content: '"TAK"',
			left: 4,
			opacity: 0,
		},
		"&:after": {
			content: '"NIE"',
			right: 4,
		},
	},
	[`& .${switchClasses.checked}`]: {
		[`&.${switchClasses.switchBase}`]: {
			color: "#185a9d",
			transform: "translateX(32px)",
			"&:hover": {
				backgroundColor: "rgba(24,90,257,0.08)",
			},
		},
		[`& .${switchClasses.thumb}`]: {
			backgroundColor: "#fff",
		},
		[`& + .${switchClasses.track}`]: {
			background: "linear-gradient(to right, #43cea2, #185a9d)",
			"&:before": {
				opacity: 1,
			},
			"&:after": {
				opacity: 0,
			},
		},
	},
});
const Settings = () => {
	const [value, setValue] = useState(0);
	const [editField, setEditField] = useState<string | null>(null);
	const [formData, setFormData] = useState<{ [key: string]: any }>({});
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect(`/login`);
		},
	});
	const theme = useTheme();
	const useUpdate = useUpdateClub();
	const clubInfo = useQuery({
		queryKey: ["clubInfo"],
		enabled: !!session,
		queryFn: () =>
			fetch(`api/club/${session?.user.id}`).then((res) => res.json()),
	});
	console.log(clubInfo.data);
	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	const handleEditClick = (field: string) => {
		setEditField(field);
		setFormData({ ...formData, [field]: clubInfo.data[field] });
	};

	const handleSaveClick = () => {
		console.log(formData);
		useUpdate.mutateAsync(formData);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};
	if (clubInfo.isLoading || status === "loading") return <Loading />;
	if (clubInfo.isError)
		return <StandardError message={clubInfo.error.message} />;
	if (clubInfo.data.error)
		return <StandardError message={clubInfo.data.error} />;
	return (
		<Box sx={{ width: "calc(100% - 20px)", position: "absolute", top: 80 }}>
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
						label='Uprawnienia użytkowników'
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
							USTAWIENIA KLUBU
						</Typography>
					</StyledAccordionSummary>
					<StyledAccordionDetails>
						<Stack
							direction='row'
							p={2}
							justifyContent='flex-start'
							alignItems='center'>
							<Typography
								variant='h6'
								color={theme.palette.primary.main}
								width='50%'>
								Nazwa
							</Typography>
							<Typography width='50%'>{clubInfo.data.name}</Typography>
						</Stack>
						<Divider variant='middle' />
						<Stack
							direction='row'
							p={2}
							justifyContent='space-evenly'
							alignItems='center'>
							<Typography
								variant='h6'
								width='50%'
								color={theme.palette.primary.main}>
								Email
							</Typography>
							<Typography width='50%'>{clubInfo.data.email}</Typography>
						</Stack>
						<Divider variant='middle' />
						<Stack
							direction='row'
							p={2}
							justifyContent='space-evenly'
							alignItems='center'>
							<Typography
								variant='h6'
								width='50%'
								color={theme.palette.primary.main}>
								Numer Telefonu
							</Typography>
							{editField === "phoneNumber" ? (
								<Box
									width='50%'
									display='flex'
									flexWrap='wrap'
									alignItems='center'>
									<TextField
										sx={{ minWidth: 100 }}
										name='phoneNumber'
										value={formData.phoneNumber}
										onChange={handleInputChange}
									/>
									<CheckIcon
										sx={{ m: 2, fontSize: 30 }}
										color='success'
									/>
									<CloseIcon
										sx={{ m: 2, fontSize: 30 }}
										color='warning'
										onClick={() => setEditField(null)}
									/>
								</Box>
							) : (
								<Box
									width='50%'
									display='flex'>
									<Typography>
										{clubInfo.data.phoneNumber
											? clubInfo.data.phoneNumber
											: "Nie zapisany"}
									</Typography>
									<EditIcon onClick={() => handleEditClick("phoneNumber")} />
								</Box>
							)}
						</Stack>
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
							USTAWIENIA PŁATNOŚCI
						</Typography>
					</StyledAccordionSummary>
					<StyledAccordionDetails>
						<Stack
							direction='row'
							p={2}
							justifyContent='flex-start'
							alignItems='center'>
							<Typography
								variant='h6'
								color={theme.palette.primary.main}
								width='50%'>
								Domyślna cena zajęć jednorazowych
							</Typography>
							<Typography width='25%'>0</Typography>
							<Typography width='25%'>za zajęcia</Typography>
						</Stack>
						<Divider variant='middle' />
						<Stack
							direction='row'
							p={2}
							justifyContent='space-evenly'
							alignItems='center'>
							<Typography
								variant='h6'
								width='50%'
								color={theme.palette.primary.main}>
								Domyślna cena zajęć indywidualnych
							</Typography>
							<Typography width='25%'>0</Typography>
							<Typography width='25%'>za miesiąc</Typography>
						</Stack>
						<Divider variant='middle' />
						<Stack
							direction='row'
							p={2}
							justifyContent='space-evenly'
							alignItems='center'>
							<Typography
								variant='h6'
								width='50%'
								color={theme.palette.primary.main}>
								Domyślna cena zajęć grupowych
							</Typography>
							<Typography width='25%'>0</Typography>
							<Typography width='25%'>za miesiąc</Typography>
						</Stack>
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
							STOPNIE ZAAWANSOWANIA
						</Typography>
					</StyledAccordionSummary>
					<StyledAccordionDetails>
						<Stack
							direction='row'
							p={2}
							justifyContent='flex-start'
							alignItems='center'>
							<Typography
								variant='h6'
								color={theme.palette.primary.main}
								width='100%'>
								Początkujący
							</Typography>
						</Stack>
						<Divider variant='middle' />
						<Stack
							direction='row'
							p={2}
							justifyContent='space-evenly'
							alignItems='center'>
							<Typography
								variant='h6'
								width='100%'
								color={theme.palette.primary.main}>
								Średnio zaawansowany
							</Typography>
						</Stack>
						<Divider variant='middle' />
						<Stack
							direction='row'
							p={2}
							justifyContent='space-evenly'
							alignItems='center'>
							<Typography
								variant='h6'
								width='100%'
								color={theme.palette.primary.main}>
								Zaawansowany
							</Typography>
						</Stack>
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
							FUNKCJONALNOŚCI
						</Typography>
					</StyledAccordionSummary>
					<StyledAccordionDetails>
						<Stack
							direction='row'
							p={2}
							justifyContent='flex-start'
							alignItems='center'>
							<Typography
								variant='h6'
								color={theme.palette.primary.main}
								width='50%'>
								Zajęcia indywidualne
							</Typography>
							<Box width='50%'>
								<StyledSwitch />
							</Box>
						</Stack>
						<Divider variant='middle' />
						<Stack
							direction='row'
							p={2}
							justifyContent='space-evenly'
							alignItems='center'>
							<Typography
								variant='h6'
								width='50%'
								color={theme.palette.primary.main}>
								Zajęcia indywidualne jednorazowe
							</Typography>
							<Box width='50%'>
								<StyledSwitch />
							</Box>
						</Stack>
						<Divider variant='middle' />
						<Stack
							direction='row'
							p={2}
							justifyContent='space-evenly'
							alignItems='center'>
							<Typography
								variant='h6'
								width='50%'
								color={theme.palette.primary.main}>
								Zastępstwa prowadzących
							</Typography>
							<Box width='50%'>
								<StyledSwitch />
							</Box>
						</Stack>
						<Divider variant='middle' />
						<Stack
							direction='row'
							p={2}
							justifyContent='space-evenly'
							alignItems='center'>
							<Typography
								variant='h6'
								width='50%'
								color={theme.palette.primary.main}>
								Odrabianie nieobecności
							</Typography>
							<Box width='50%'>
								<StyledSwitch />
							</Box>
						</Stack>
					</StyledAccordionDetails>
				</Accordion>
			</CustomTabPanel>
			<CustomTabPanel
				value={value}
				index={1}>
				Item Two
			</CustomTabPanel>
			<CustomTabPanel
				value={value}
				index={2}>
				Item Three
			</CustomTabPanel>
		</Box>
	);
};

export default Settings;
