"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Box, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/context/Loading";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import PolishDayName, { ReversePolishName } from "@/context/PolishDayName";
import ParticipantList from "@/components/participants/ParticipantList";
import { sortAndAddNumbers } from "@/functions/sorting";
import ErrorLocations from "@/components/errors/Locations";

interface Props {
	params: {
		id: string;
	};
}
//TODO: zrobić zabezpieczenia by nie móc podglądać grup nie ze swojego klubu
const Group = ({ params }: Props) => {
	const pages = [{ id: 1, title: "Lokalizacje", path: "/locations" }];
	const { status } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const groupId = parseInt(params.id, 10);
	const router = useRouter();
	const breadcrumbs = useQuery({
		queryKey: ["breadcrumbs3", params.id],
		queryFn: () => fetch(`/api/gr/${params.id}`).then((res) => res.json()),
		select: (data) => {
			const locNameLength = data?.locationName ? data.locationName.length : 0;
			const dayNameLength = data?.dayOfWeek
				? PolishDayName(data.dayOfWeek).length
				: 0;
			const groupNameLength = data?.name ? data.name.length : 0;
			return [
				{ id: 1, title: "Lokalizacje", path: "/locations", length: 0 },
				{
					id: 2,
					title: `${data?.locationName}`,
					path: `/locations/${data?.locationId}`,
					length: locNameLength,
				},
				{
					id: 3,
					title: `${PolishDayName(data?.dayOfWeek)}`,
					path: `/locations/${data?.locationId}/${data?.dayOfWeek}`,
					length: dayNameLength,
				},
				{
					id: 4,
					title: `${data?.name}`,
					path: `group/${data?.id}`,
					length: groupNameLength,
				},
			];
		},
	});
	const participants = useQuery({
		queryKey: ["participants", params.id],
		queryFn: () =>
			fetch(`/api/participant/${params.id}`).then((res) => res.json()),
		select: (data) => sortAndAddNumbers(data, params.id, "normal"),
	});

	if (status === "loading" || participants.isLoading)
		return (
			<>
				<MobileNavigation
					pages={breadcrumbs.isSuccess ? breadcrumbs.data : pages}
				/>
				<Loading />
			</>
		);
	if (participants.isError || participants.data.length === 0)
		return (
			<>
				<ErrorLocations
					pages={breadcrumbs.isSuccess ? breadcrumbs.data : pages}
					message={
						participants.isError
							? participants.error.message
							: "Nie znaleziono uczestników"
					}
				/>
				<Button
					variant='contained'
					size='large'
					onClick={() => router.push(`/add`)}>
					Dodaj uczestników
				</Button>
			</>
		);

	return (
		<>
			<MobileNavigation
				pages={breadcrumbs.isSuccess ? breadcrumbs.data : pages}
			/>
			{participants.data.length > 0 && (
				<Box
					sx={{
						minWidth: "95vw",
						height: `calc(100vh - 75px - 90px - 30px)`,
						maxWidth: "98vw",
						mt: breadcrumbs.isSuccess
							? breadcrumbs.data?.reduce((acc, item) => acc + item.length, 0) >
							  30
								? 6
								: 3
							: 3,
					}}>
					<ParticipantList
						participants={participants.data}
						groupId={groupId}
						day={
							breadcrumbs.isSuccess
								? ReversePolishName(breadcrumbs.data[2].title)
								: 1
						}
					/>
				</Box>
			)}
		</>
	);
};

export default Group;
