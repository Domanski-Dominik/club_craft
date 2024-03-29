"use client";
import * as React from "react";
import AddIcon from "@mui/icons-material/Add";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LocCard from "@/components/cards/LocCard";
import { Location } from "@/types/type";
import { Typography, Fab } from "@mui/material";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import CardsSkeleton from "@/components/skeletons/CardsSkeleton";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { useQuery } from "@tanstack/react-query";
import ErrorLocations from "@/components/errors/Locations";

export default function LocationList() {
	const router = useRouter();
	const pages = [
		{
			id: 1,
			title: "Lokalizacje",
			path: "/locations",
		},
	];
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const locs = useQuery({
		queryKey: ["locations"],
		enabled: !!session,
		queryFn: () =>
			fetch(
				`/api/loc/club/${session?.user.club}/${session?.user.role}/${session?.user.id}`
			).then((res) => res.json()),
	});

	const handleClick = (clickedId: String | Number) => {
		//console.log("Kliknięte ID:", clickedId);
		router.push(`/locations/${clickedId}`);
	};

	if (status === "loading" || locs.isLoading)
		return (
			<>
				<MobileNavigation pages={pages} />
				<CardsSkeleton />
			</>
		);
	if (locs.isError || locs.data.error)
		return (
			<ErrorLocations
				pages={pages}
				message={locs.isError ? locs.error.message : locs.data.error}
			/>
		);
	if (locs.data.length === 0)
		return (
			<>
				<ErrorLocations
					pages={pages}
					message={
						session.user.role === "owner"
							? "Nie utworzyłeś jeszcze żadnych lokalizacji"
							: "Nie przypisano ci jeszcze lokalizacji"
					}
				/>
				{session.user.role === "owner" && (
					<Fab
						onClick={() => router.push("/locations/new")}
						sx={{ mt: 2 }}
						color='primary'
						variant='extended'
						size='small'>
						<AddIcon sx={{ mr: 1, mb: 1 }} />
						Dodaj lokalizajce
					</Fab>
				)}
			</>
		);
	return (
		<>
			<MobileNavigation pages={pages} />
			<Grid
				container
				spacing={1}
				paddingTop={3}
				width={"100%"}>
				{locs.data.map((loc: Location) => (
					<Grid
						key={loc.id}
						xs={12}
						sm={6}
						md={6}
						lg={4}
						xl={3}>
						<LocCard
							loc={loc}
							handleClick={handleClick}
						/>
					</Grid>
				))}
			</Grid>
			{session.user.role === "owner" && (
				<Fab
					onClick={() => router.push("/locations/new")}
					sx={{ mt: 2 }}
					color='primary'
					variant='extended'
					size='small'>
					<AddIcon sx={{ mr: 1, mb: 1 }} />
					Dodaj lokalizajce
				</Fab>
			)}
		</>
	);
}
