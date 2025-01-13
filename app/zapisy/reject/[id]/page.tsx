import React from "react";
import { Box, Typography, List, ListItem, Divider } from "@mui/material";
import PolishDayName from "@/functions/PolishDayName";
import { AcceptAwaitingParticipant } from "@/server/participant-actions";
import SignInGroupList from "@/components/lists/SignInGroupList";
import {
	getAwaitingParticipants,
	getAwaitinParticipantById,
	getRejectedSignInGroups,
} from "@/server/get-actions";
import SignInRejectForm from "@/components/forms/SigninRejectForm";
import StandardError from "@/components/errors/Standard";

interface Props {
	params: Promise<{
		id: string;
	}>;
}

const RejectMoveToGroup = async ({ params }: Props) => {
	const id = parseInt((await params).id, 10);
	const groups = await getRejectedSignInGroups(id);
	const participant = await getAwaitinParticipantById(id);

	if ("error" in groups || "error" in participant) {
		return (
			<StandardError
				message={
					"error" in groups
						? groups.error
						: "error" in participant
						? participant.error
						: "Wystąpił nieznany błąd"
				}
			/>
		);
	}
	if (participant.edit === false)
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
				<StandardError
					message={`Uczestnik ${participant.firstName} ${participant.lastName} jest już
					przypisany do grupy! Jeśli myślisz że to błąd skontaktuj się z klubem ${participant.club}.`}
					addParticipants={false}
				/>
			</Box>
		);
	return (
		<SignInRejectForm
			groups={groups}
			participant={participant}
		/>
	);
};

export default RejectMoveToGroup;
