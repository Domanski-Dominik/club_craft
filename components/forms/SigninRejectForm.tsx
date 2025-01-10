"use client";

import React, { useState } from "react";
import SignInGroupList from "@/components/lists/SignInGroupList";
import { Typography, Divider, Box, ListItem } from "@mui/material";
import type { Group } from "@/types/type";
import PolishDayName from "@/functions/PolishDayName";
import { NewGroupAwaitingParticipant } from "@/server/participant-actions";
import StandardError from "../errors/Standard";

interface Props {
	groups: any;
	participant: any;
}

const SignInRejectForm: React.FC<Props> = ({ groups, participant }) => {
	const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
	const [error, setError] = useState(false);
	const handleSelectGroup = async (group: any) => {
		try {
			await NewGroupAwaitingParticipant({
				id: participant.id,
				groupId: group.id,
			});
			setError(false);
			setSelectedGroup(group);
		} catch (error) {
			setError(true);
		}
	};
	if (error)
		return (
			<StandardError
				message='Wystąpił błąd'
				addParticipants={false}
			/>
		);
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
				width: "100%",
			}}>
			{selectedGroup ? (
				<>
					<Typography
						variant='h3'
						color='primary'
						sx={{ textAlign: "center", marginBottom: 3 }}>
						Dziękujemy za wybranie nowej grupy!
					</Typography>
					<Divider />
					<Typography my={3}>
						Wysłano zapytanie do klubu <strong>{participant.club}</strong>,
						<br />
						<br />o przeniesienie uczestnika:
						<strong>
							{" "}
							{participant.firstName} {participant.lastName}
						</strong>
						{", "}
						<br /> <br />
						do grupy: <strong>{selectedGroup.name}</strong>
						<br />
						<br />w terminach:{" "}
						{selectedGroup.terms.map((term: any, index) => (
							<ListItem key={index}>
								<Typography variant='body1'>
									<span style={{ color: "darkviolet" }}>
										{term.location.name}
									</span>
									{", "}
									<strong>{PolishDayName(term.dayOfWeek)}</strong>
									{", "}
									{term.timeS}-{term.timeE}
									{", "}
								</Typography>
							</ListItem>
						))}
						<br />
						Proszę oczekiwać na maila zwrotnego z informacją na temat
						przeniesienia.
					</Typography>
					<Divider />
					<Typography
						align='center'
						color='textDisabled'>
						Pozdrawiamy,
						<br />
						Zespół ClubCraft
					</Typography>
				</>
			) : (
				<>
					<Typography
						variant='h3'
						color='primary'
						sx={{ textAlign: "center", marginBottom: 3 }}>
						Proszę wybrać inną grupę:
					</Typography>
					<Divider />
					<SignInGroupList
						groups={groups}
						onSelectGroup={handleSelectGroup}
					/>
				</>
			)}
		</Box>
	);
};

export default SignInRejectForm;
