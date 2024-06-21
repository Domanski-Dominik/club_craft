"use client";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import {
	Accordion,
	AccordionSummary,
	AccordionDetails,
	AccordionSummaryProps,
} from "@mui/material";

export const StyledAccordionSummary = styled((props: AccordionSummaryProps) => (
	<AccordionSummary
		expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "2rem" }} />}
		{...props}
	/>
))(({ theme }) => ({
	backgroundColor: `${theme.palette.primary.light}`,
}));

export const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
	padding: theme.spacing(2),
	borderTop: "1px solid rgba(0, 0, 0, .125)",
}));
