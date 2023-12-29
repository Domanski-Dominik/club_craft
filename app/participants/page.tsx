"use client";

import AllParticipantList from "@/components/participants/AllParticipantList";
import Loading from "@/context/Loading";
import { useSession } from "next-auth/react";
import React from "react";
import { redirect } from "next/navigation";
import type { Participant, Group, LocWithGroups } from "@/types/type";

const Participants = () => {
	const [participants, setParticipants] = React.useState<Participant[]>([]);
	const [locWithGroups, setLocWithGroups] = React.useState<LocWithGroups[]>([]);
	const [error, setError] = React.useState("");
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	React.useEffect(() => {
		const fetchParticipants = async () => {
			try {
				const response = await fetch(
					`/api/participant/all/${session?.user.club}`,
					{
						method: "GET",
					}
				);
				const data: Participant[] | { error: string } = await response.json();
				console.log(data);
				if (Array.isArray(data)) {
					console.log(data);
					setParticipants(data);
				} else {
					setError(data.error);
				}
			} catch (error) {
				console.log(error);
			}
			try {
				const response = await fetch(`/api/form/${session?.user.club}`, {
					method: "GET",
				});
				const data: LocWithGroups[] | { error: string } = await response.json();
				if (Array.isArray(data)) {
					console.log(data);
					setLocWithGroups(data);
				} else {
					setError(data.error);
				}
			} catch (error) {
				console.log(error);
			}
		};

		if (session) fetchParticipants();
	}, [session]);
	if (status === "loading") return <Loading />;
	if (participants.length > 0 && locWithGroups.length > 0)
		return (
			<AllParticipantList
				participants={participants}
				locWithGroups={locWithGroups}
			/>
		);
};

export default Participants;
