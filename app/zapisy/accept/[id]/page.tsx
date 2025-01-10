import React from "react";
import { Box, Typography, List, ListItem, Divider } from "@mui/material";
import PolishDayName from "@/functions/PolishDayName";
import { AcceptAwaitingParticipant } from "@/server/participant-actions";

interface Props {
	params: Promise<{
		id: string;
	}>;
}

const AcceptMoveToGroup = async ({ params }: Props) => {
	const id = (await params).id;
	const participant = await AcceptAwaitingParticipant(id);

	if ("error" in participant) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					fontFamily: "Arial, sans-serif",
				}}>
				<Typography
					variant='h6'
					color='error'>
					{participant.error}
				</Typography>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-evenly",
				minHeight: "80vh",
				padding: "20px",
				backgroundColor: "white",
				borderRadius: "20px",
				boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
			}}>
			<Typography
				variant='h3'
				color='primary'
				sx={{ textAlign: "center", marginBottom: 3 }}>
				Dziękujemy za akceptację!
			</Typography>
			<Divider />
			<Typography
				variant='body1'
				gutterBottom
				sx={{ marginTop: 3 }}>
				Dzień dobry,{" "}
				<strong>
					{participant.parentFirstName} {participant.parentLastName}
				</strong>
				!
			</Typography>

			<Typography
				variant='body1'
				gutterBottom>
				<strong>
					{participant.firstName} {participant.lastName}
				</strong>{" "}
				został/a przypisany/a do grupy: <strong>{participant.groupName}</strong>
				.
			</Typography>
			<Typography
				variant='body1'
				gutterBottom>
				<strong>Terminy zajęć:</strong>
			</Typography>
			<List>
				{participant.terms.map((term, index) => (
					<ListItem key={index}>
						<Typography variant='body1'>
							<span style={{ color: "darkviolet" }}>{term.location.name}</span>
							{", "}
							<strong>{PolishDayName(term.dayOfWeek)}</strong>
							{", "}
							{term.timeS}-{term.timeE}
							{", "}
						</Typography>
					</ListItem>
				))}
			</List>
			<Typography
				variant='body1'
				mt={3}
				mb={3}>
				Życzymy Ci miłego dnia!
			</Typography>
			<Divider />
			<Typography
				align='center'
				color='textDisabled'
				pt={2}>
				Pozdrawiamy,
				<br />
				Zespół ClubCraft
			</Typography>
		</Box>
	);
};

export default AcceptMoveToGroup;
