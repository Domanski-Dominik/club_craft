"use client";

import AllParticipantList from "@/components/participants/AllParticipantList";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/context/Loading";
import { useSession } from "next-auth/react";
import React from "react";
import { redirect, useRouter } from "next/navigation";
import type { Participant, LocWithGroups } from "@/types/type";
import { Typography, Fab } from "@mui/material";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CachedOutlinedIcon from "@mui/icons-material/CachedOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

const Participants = () => {
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const router = useRouter();
	const participants = useQuery<Participant[]>({
		queryKey: ["AllParticipants"],
		enabled: !!session,
		queryFn: () =>
			fetch(
				`/api/participant/all/${session?.user.role}/${session?.user.club}/${session?.user.id}`
			).then((res) => res.json()),
	});
	const locWithGroups = useQuery<LocWithGroups[]>({
		queryKey: ["AllParticipantsLocs"],
		enabled: !!session,
		queryFn: () =>
			fetch(`/api/form/${session?.user.club}`).then((res) => res.json()),
	});

	if (
		status === "loading" ||
		participants.isFetching ||
		locWithGroups.isFetching
	)
		return <Loading />;
	if (
		participants.isError ||
		participants.data === undefined ||
		locWithGroups.data === undefined
	) {
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
	if (participants.data.length === 0)
		return (
			<>
				<PersonOffOutlinedIcon
					sx={{ width: 100, height: 100, mb: 4 }}
					color='secondary'
				/>
				<Typography
					variant='h4'
					align='center'>
					Brak dodanych uczestników
				</Typography>
				<Fab
					sx={{ mt: 5 }}
					color='primary'
					variant='extended'
					onClick={() => router.push("/add")}>
					<AddOutlinedIcon sx={{ mr: 1 }} />
					Dodaj Uczestników
				</Fab>
			</>
		);

	return (
		<AllParticipantList
			participants={participants.data}
			locWithGroups={locWithGroups.data}
			isOwner={session?.user.role === "owner"}
		/>
	);
};

export default Participants;
