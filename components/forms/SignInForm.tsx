"use client";
import {
	Box,
	Typography,
	Button,
	Step,
	Stepper,
	StepLabel,
	Divider,
} from "@mui/material";
import React, { useState } from "react";
import SignInGroupList from "../lists/SignInGroupList";
import PersonalDataForm from "./PersonalDataSignInForm";
import { Group } from "@/types/type";
import { Stack2, TypographyStack } from "../styled/StyledComponents";
import CelebrationIcon from "@mui/icons-material/Celebration";
import { keyframes } from "@mui/system";

interface Props {
	clubName: string;
	groups: any;
	iOS: boolean;
	locs: any;
}
const zoomAndRotate = keyframes`
  0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.2) rotate(-10deg);
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  75% {
    transform: scale(1.2) rotate(-10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
`;

const steps = ["Wybierz Grupę", "Uzupełnij dane", "Zatwierdź"];
const SignInForm = (props: Props) => {
	const [activeStep, setActiveStep] = useState(0);
	const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
	const [formData, setFormData] = useState<{
		childFirstName: string;
		childLastName: string;
		parentFirstName: string;
		parentLastName: string;
		email: string;
		phone: string;
		birthDate: Date | null;
	}>({
		childFirstName: "",
		childLastName: "",
		parentFirstName: "",
		parentLastName: "",
		email: "",
		phone: "",
		birthDate: null,
	});

	const handleNext = () => {
		setActiveStep((prevStep) => prevStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevStep) => prevStep - 1);
	};

	const handleSelectGroup = (group: any) => {
		setSelectedGroup(group);
		handleNext();
	};

	const handleFormChange = (newFormData: any) => {
		setFormData(newFormData);
		handleNext();
	};

	return (
		<Box
			sx={{
				width: "100%",
				height: "100%",
				bgcolor: "white",
				borderRadius: "20px",
				py: 2,
				px: 1,
			}}>
			<Typography
				variant='h4'
				align='center'>
				Formularz zapisu na zajęcia z {props.clubName}
			</Typography>
			<Stepper
				activeStep={activeStep}
				alternativeLabel
				sx={{ my: 3 }}>
				{steps.map((label) => (
					<Step key={label}>
						<StepLabel>{label}</StepLabel>
					</Step>
				))}
			</Stepper>
			<Divider />
			{activeStep === 0 && (
				<SignInGroupList
					groups={props.groups}
					onSelectGroup={handleSelectGroup}
				/>
			)}
			{activeStep === 1 && (
				<PersonalDataForm
					formData={formData}
					onChange={handleFormChange}
					onBack={handleBack}
				/>
			)}
			{activeStep === 2 && (
				<Box>
					<Typography
						variant='h4'
						my={2}
						align='center'>
						Podsumowanie
					</Typography>
					<Divider />
					<Stack2>
						<TypographyStack>Wybrana grupa:</TypographyStack>
						<Typography>{selectedGroup?.name}</Typography>
					</Stack2>
					<Divider />
					<Stack2>
						<TypographyStack>Dane dziecka:</TypographyStack>
						<Typography>
							{formData.childFirstName} {formData.childLastName}
						</Typography>
					</Stack2>
					<Divider />
					<Stack2>
						<TypographyStack variant='body1'>Dane rodzica:</TypographyStack>
						<Typography>
							{formData.parentFirstName} {formData.parentLastName}
						</Typography>
					</Stack2>
					<Divider />
					<Stack2>
						<TypographyStack>Data urodzenia dziecka:</TypographyStack>
						<Typography>
							{" "}
							{formData.birthDate
								? formData.birthDate.toLocaleDateString()
								: "Nie podano"}
						</Typography>
					</Stack2>
					<Divider />
					<Stack2>
						<TypographyStack>Email:</TypographyStack>
						<Typography>{formData.email}</Typography>
					</Stack2>
					<Divider />
					<Stack2>
						<TypographyStack>Telefon:</TypographyStack>
						<Typography>{formData.phone}</Typography>
					</Stack2>
					<Divider />
					<Box
						display='flex'
						justifyContent='space-between'
						mt={3}>
						<Button
							variant='outlined'
							onClick={handleBack}>
							Cofnij
						</Button>
						<Button
							variant='contained'
							color='primary'
							onClick={handleNext}>
							Zatwierdź
						</Button>
					</Box>
				</Box>
			)}
			{activeStep === 3 && (
				<Box
					width='100%'
					height='100%'
					display='flex'
					justifyContent='center'
					alignItems='center'
					flexDirection='column'>
					<Typography
						variant='h4'
						my={2}
						align='center'>
						Udało się wysłać formularz!
					</Typography>
					<CelebrationIcon
						color='primary'
						sx={{
							width: 150,
							height: 150,
							my: 8,
							animation: `${zoomAndRotate} 2s ease-in-out infinite`,
						}}
					/>
					<Typography variant='h6'>Proszę sprawdzić skrzynkę email.</Typography>
					<Button
						variant='outlined'
						color='primary'
						sx={{ mt: 4 }}
						onClick={() => {
							// Resetowanie danych formularza i kroku
							setFormData({
								childFirstName: "",
								childLastName: "",
								parentFirstName: "",
								parentLastName: "",
								email: "",
								phone: "",
								birthDate: null,
							});
							setSelectedGroup(null);
							setActiveStep(0); // Powrót do pierwszego kroku
						}}>
						Zapisz kolejne dziecko
					</Button>
				</Box>
			)}
		</Box>
	);
};

export default SignInForm;
