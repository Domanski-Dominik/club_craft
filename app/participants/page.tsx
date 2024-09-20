"use client";

import AllParticipantList from "@/components/participants/AllParticipantList";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/context/Loading";
import { useSession } from "next-auth/react";
import React from "react";
import { redirect } from "next/navigation";
import type { Participant, LocWithGroups } from "@/types/type";
import StandardError from "@/components/errors/Standard";

const Participants = () => {
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const clubInfo = useQuery({
		queryKey: ["clubInfo"],
		enabled: !!session,
		queryFn: () =>
			fetch(`/api/club/${session?.user.id}`).then((res) => res.json()),
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
	if (participants.isError)
		return (
			<StandardError
				message={
					participants.isError
						? participants.error.message
						: "Nie udało się pobrać uczestników lub grup"
				}
				addParticipants={true}
			/>
		);

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
