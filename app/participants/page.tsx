"use client";

import AllParticipantList from "@/components/participants/AllParticipantList";
import Loading from "@/context/Loading";
import { useSession } from "next-auth/react";
import React from "react";
import { redirect } from "next/navigation";
import type { Participant, LocWithGroups } from "@/types/type";

const Participants = () => {
	const [participants, setParticipants] = React.useState<Participant[]>([]);
	const [locWithGroups, setLocWithGroups] = React.useState<LocWithGroups[]>([]);
	const [isOwner, setIsOwner] = React.useState(false);
	const [error, setError] = React.useState("");
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const [loading, setLoading] = React.useState(true);
	React.useEffect(() => {
		const fetchParticipants = async () => {
			if (session?.user && status === "authenticated") {
				if (session.user.role === "owner" || session.user.role === "admin") {
					const response = await fetch(
						`/api/participant/all/${session.user.role}/${session.user.club}`,
						{
							method: "GET",
						}
					);
					const data: Participant[] | { error: string } = await response.json();
					if (Array.isArray(data)) {
						setParticipants(data);
						setLoading(false);
					} else {
						setError(data.error);
					}
					const response2 = await fetch(`/api/form/${session?.user.club}`, {
						method: "GET",
					});
					const data2: LocWithGroups[] | { error: string } =
						await response2.json();
					if (Array.isArray(data2)) {
						setLocWithGroups(data2);
					} else {
						setError(data2.error);
					}
					setLoading(false);
				}
				if (session.user.role === "coach") {
					const response = await fetch(
						`/api/participant/all/${session.user.role}/${session.user.club}/${session.user.id}`,
						{
							method: "GET",
						}
					);
					const data: Participant[] | { error: string } = await response.json();
					console.log(data);
					if (Array.isArray(data)) {
						setParticipants(data);
						setLoading(false);
					} else {
						setError(data.error);
					}
					const response2 = await fetch(`/api/form/${session?.user.club}`, {
						method: "GET",
					});
					const data2: LocWithGroups[] | { error: string } =
						await response2.json();
					if (Array.isArray(data2)) {
						setLocWithGroups(data2);
					} else {
						setError(data2.error);
					}
					setLoading(false);
				}
			}
		};

		fetchParticipants();
	}, [session]);
	if (status === "loading") return <Loading />;
	if (loading) return <Loading />;
	if (participants.length > 0 && locWithGroups.length > 0)
		return (
			<AllParticipantList
				participants={participants}
				locWithGroups={locWithGroups}
				isOwner={isOwner}
			/>
		);
};

export default Participants;
