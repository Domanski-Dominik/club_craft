"use client";

import AllParticipantList from "@/components/participants/AllParticipantList";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/context/Loading";
import { useSession } from "next-auth/react";
import React from "react";
import { redirect, useRouter } from "next/navigation";
import type { Participant, LocWithGroups } from "@/types/type";
import { Typography, Fab } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CachedOutlinedIcon from "@mui/icons-material/CachedOutlined";

const Participants = () => {
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const router = useRouter();
	const clubInfo = useQuery({
		queryKey: ["clubInfo"],
		enabled: !!session,
		queryFn: () =>
			fetch(`api/club/${session?.user.id}`).then((res) => res.json()),
	});
	const participants = useQuery<Participant[]>({
		queryKey: ["allParticipants"],
		enabled: !!session,
		queryFn: () =>
			fetch(
				`/api/participant/all/${session?.user.role}/${session?.user.club}/${session?.user.id}`
			).then((res) => res.json()),
	});
	console.log(participants.data);
	const locWithGroups = useQuery<LocWithGroups[]>({
		queryKey: ["locWithGroups"],
		enabled: !!session,
		queryFn: () =>
			fetch(`/api/components/form/${session?.user.club}`).then((res) =>
				res.json()
			),
	});
	if (participants.data === undefined || locWithGroups.data === undefined)
		return <Loading />;
	if (participants.isError) {
		return (
			<>
				<WarningAmberIcon
					color='error'
					sx={{ width: 100, height: 100, m: 4 }}
				/>
				<Typography
					color={"red"}
					variant='h4'>
					{participants.isError
						? participants.error.message
						: "Nie udało się pobrać uczestników lub grup"}
				</Typography>
				<Fab
					onClick={() => window.location.reload()}
					sx={{ mt: 4, mb: 1 }}
					color='primary'
					variant='extended'
					size='small'>
					<CachedOutlinedIcon sx={{ mr: 1 }} />
					Odśwież stronę
				</Fab>
			</>
		);
	}
	return (
		<AllParticipantList
			participants={participants.data.length > 0 ? participants.data : []}
			locWithGroups={locWithGroups.data}
			isOwner={session?.user.role === "owner"}
			clubInfo={clubInfo.data}
		/>
	);
};

export default Participants;
