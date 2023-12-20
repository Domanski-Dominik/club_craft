"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Loading from "@/context/Loading";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import PolishDayName from "@/context/PolishDayName";
import { Box, Typography } from "@mui/material";
import { MobileDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import ParticipantList from "@/components/participants/ParticipantList";
import type { Participant } from "@/types/type";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import pl from "date-fns/locale/pl";

interface Props {
	params: {
		id: string;
	};
}

const Group = ({ params }: Props) => {
	const [participants, setParticipants] = useState<Participant[]>([]);
	const [error, setError] = useState("");
	const [date, setDate] = useState<Date | null>(new Date());
	const [pages, setPages] = useState([
		{ id: 1, title: "Lokalizacje", path: "/locations" },
	]);
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});

	useEffect(() => {
		const fetchParticipants = async () => {
			try {
				const response = await fetch(`/api/participant/${params.id}`, {
					method: "GET",
				});
				const data: Participant[] | { error: string } = await response.json();
				if (Array.isArray(data)) {
					//console.log(data);
					setParticipants(data);
				} else {
					setError(data.error);
				}
			} catch (error) {
				console.log(error);
			}
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
				}
			} catch (error) {
				console.log("Error", error);
			}
		};
		loadName(params.id);
	}, [params.id]);

	if (status === "loading") return <Loading />;

	return (
		<>
			<MobileNavigation pages={pages} />
			<Box
				sx={{
					minWidth: "95vw",
					minHeight: "68vh",
					maxWidth: "98vw",
				}}>
				{participants.length > 0 && (
					<ParticipantList participants={participants} />
				)}
				{error !== "" && (
					<Typography
						variant='h5'
						color='error'>
						{error}
					</Typography>
				)}
			</Box>
		</>
	);
};

export default Group;
//
