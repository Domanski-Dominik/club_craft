"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import Loading from "@/context/Loading";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import PolishDayName from "@/context/PolishDayName";
import { Box, Typography, Button } from "@mui/material";
import ParticipantList from "@/components/participants/ParticipantList";
import type { Participant } from "@/types/type";

interface Props {
	params: {
		id: string;
	};
}

const Group = ({ params }: Props) => {
	const [participants, setParticipants] = useState<Participant[]>([]);
	const [workOutPrt, setWorkOutPrt] = useState<Participant[]>([]);
	const [length, setLength] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [pages, setPages] = useState([
		{ id: 1, title: "Lokalizacje", path: "/locations" },
	]);
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const groupId = parseInt(params.id, 10);
	const router = useRouter();
	useEffect(() => {
		const fetchParticipants = async () => {
			try {
				const response = await fetch(`/api/participant/${params.id}`, {
					method: "GET",
				});
				const data: Participant[] | { error: string } = await response.json();
				if (Array.isArray(data)) {
					console.log(data);
					setParticipants(data);
				} else {
					setError(data.error);
				}
			} catch (error) {
				console.log(error);
			}
			setLoading(false);
		};

		if (params?.id) fetchParticipants();
	}, [params.id]);

	useEffect(() => {
		const loadName = async (grId: string) => {
			try {
				const response = await fetch(`/api/gr/${grId}`, { method: "GET" });
				if (response.ok) {
					const group = await response.json();
					//console.log(group);
					const dayName = PolishDayName(group.dayOfWeek);
					setPages([
						...pages,
						{
							id: 2,
							title: `${group.locationName}`,
							path: `/locations/${group.locationId}`,
						},
						{
							id: 3,
							title: `${dayName}`,
							path: `/locations/${group.locationId}/${group.dayOfWeek}`,
						},
						{
							id: 4,
							title: `${group.name}`,
							path: `group/${group.id}`,
						},
					]);
					const sum =
						dayName.length + group.locationName.length + group.name.length;
					setLength(sum);
				}
			} catch (error) {
				console.log("Error", error);
			}
		};
		loadName(params.id);
	}, [params.id]);

	useEffect(() => {
		const checkWorkOut = async () => {
			const response = await fetch(`/api/presence/${groupId}`, {
				method: "GET",
			});
			const data: Participant[] | [] = await response.json();
			if (data.length > 0) {
				setWorkOutPrt(data);
			}
		};
		setWorkOutPrt([]);
		checkWorkOut();
	}, []);

	if (status === "loading") return <Loading />;
	if (loading) return <Loading />;
	return (
		<>
			<MobileNavigation pages={pages} />
			{participants.length > 0 && length > 0 && (
				<Box
					sx={{
						minWidth: "95vw",
						height: `calc(100vh - 75px - 90px - 30px)`,
						maxWidth: "98vw",
						mt: length > 30 ? 6 : 3,
						//top: length > 30 ? 120 : 100,
					}}>
					<ParticipantList
						participants={participants}
						groupId={groupId}
						workOutPrt={workOutPrt}
					/>
				</Box>
			)}

			{error !== "" && (
				<>
					<Typography
						align='center'
						variant='h4'
						mb={2}
						color='error'>
						{error}
					</Typography>
					<Button
						variant='contained'
						size='large'
						onClick={() => router.push(`/add`)}>
						Dodaj uczestników
					</Button>
				</>
			)}
		</>
	);
};

export default Group;
//
