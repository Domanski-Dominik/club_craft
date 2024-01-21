"use client";

import AllParticipantList from "@/components/participants/AllParticipantList";
import Loading from "@/context/Loading";
import { useSession } from "next-auth/react";
import React from "react";
import { redirect, useRouter } from "next/navigation";
import type { Participant, LocWithGroups } from "@/types/type";
import { Typography, Box, Button } from "@mui/material";

const Participants = () => {
	const [participants, setParticipants] = React.useState<Participant[]>([]);
	const [locWithGroups, setLocWithGroups] = React.useState<LocWithGroups[]>([]);
	const [isOwner, setIsOwner] = React.useState(false);
	const [error, setError] = React.useState("");
	const [noPrt, setNoPrt] = React.useState(false);
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const router = useRouter();
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
						if (data.length > 0) {
							setParticipants(data);
							setLoading(false);
						} else {
							setNoPrt(true);
						}
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
					setIsOwner(true);
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
						if (data.length > 0) {
							setParticipants(data);
							setLoading(false);
						}
						setNoPrt(true);
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
	if (error !== "")
		return (
			<Typography
				color={"red"}
				variant='h4'>
				{error}
			</Typography>
		);
	if (status === "loading") return <Loading />;
	if (loading) return <Loading />;
	if (noPrt)
		return (
			<Box
				sx={{
					mx: 3,
				}}>
				<Typography
					variant='h4'
					align='center'>
					Brak dodanych uczestników
				</Typography>
				<Button
					sx={{ mt: 5 }}
					fullWidth
					variant='contained'
					onClick={() => router.push("/add")}>
					Dodaj Uczestników
				</Button>
			</Box>
		);
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
