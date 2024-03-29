"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import DaysCard from "@/components/cards/DaysCard";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import { Fab } from "@mui/material";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import CardsSkeleton from "@/components/skeletons/CardsSkeleton";
import { useQuery } from "@tanstack/react-query";
import ErrorLocations from "@/components/errors/Locations";
interface Props {
	params: {
		id: string;
	};
}
export default function Days({ params }: Props) {
	const router = useRouter();
	const pages = [{ id: 1, title: "Lokalizacje", path: "/locations" }];
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const breadcrumbs = useQuery({
		queryKey: ["breadcrumbs1", params.id],
		queryFn: () => fetch(`/api/loc/${params.id}`).then((res) => res.json()),
		select: (data) => [
			{ id: 1, title: "Lokalizacje", path: "/locations" },
			{
				id: 2,
				title: `${data?.name}`,
				path: `/locations/${data?.id}`,
			},
		],
	});
	const days = useQuery({
		queryKey: ["days", params.id],
		enabled: !!session,
		queryFn: () =>
			fetch(
				`/api/loc/days/${params.id}/days/${session?.user.role}/${session?.user.id}`
			).then((res) => res.json()),
	});

	const handleDayClick = (id: string | number) => {
		router.push(`/locations/${params.id}/${id}`);
	};

	const handleAddGroup = () => {
		router.push(`/locations/new/${params.id}`);
	};
	if (status === "loading" || days.isLoading)
		return (
			<>
				<MobileNavigation
					pages={breadcrumbs.isSuccess ? breadcrumbs.data : pages}
				/>
				<CardsSkeleton />
			</>
		);
	if (days.isError || days.data.error)
		return (
			<>
				<ErrorLocations
					pages={breadcrumbs.isSuccess ? breadcrumbs.data : pages}
					message={days.isError ? days.error.message : days.data.error}
				/>
				{session.user.role === "owner" && (
					<Fab
						onClick={handleAddGroup}
						sx={{ mt: 2, mb: 1 }}
						color='primary'
						variant='extended'
						size='small'>
						<EditCalendarIcon sx={{ mr: 1 }} />
						Zarządzaj grupami
					</Fab>
				)}
			</>
		);
	return (
		<>
			<MobileNavigation
				pages={breadcrumbs.isSuccess ? breadcrumbs.data : pages}
			/>
			<DaysCard
				gr={days?.data}
				owner={session.user.role === "owner"}
				handleClick={handleDayClick}
				handleAddGroupClick={handleAddGroup}
			/>
		</>
	);
}
