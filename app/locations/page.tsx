"use client";
import * as React from "react";
import AddIcon from "@mui/icons-material/Add";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LocCard from "@/components/cards/LocCard";
import { Location } from "@/types/type";
import { Card, CardContent, Typography, Button } from "@mui/material";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import LocCardsSkeleton from "@/components/skeletons/LocCardSkeleton";
import Grid from "@mui/material/Unstable_Grid2/Grid2";

export default function LocationList() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [locs, setLocs] = useState<Location[] | []>([]);
	const router = useRouter();
	const [isOwner, setIsOwner] = useState(false);
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

	const fetchLoc = async () => {
		if (session?.user || status === "authenticated") {
			//console.log(session.user);
			if (session.user.role === "owner") {
				const response = await fetch(
					`/api/loc/club/${session.user.club}/owner`
				);
				const data: Location[] | { error: string } = await response.json();
				if (Array.isArray(data)) {
					setIsOwner(true);
					setLocs(data);
					setLoading(false);
					setError("");
				} else {
					setError(data.error);
					setLoading(false);
				}
			}
			if (session.user.role === "coach") {
				const response = await fetch(
					`/api/loc/club/${session.user.club}/coach/${session.user.id}`
				);
				const data: Location[] | { error: string } = await response.json();
				if (Array.isArray(data)) {
					setLocs(data);
					setLoading(false);
					setError("");
				} else {
					setError(data.error);
					setLoading(false);
				}
			}

			if (session.user.role === "admin") {
			}
		}
	};

	useEffect(() => {
		fetchLoc();
	}, [session]);

	const handleClick = (clickedId: String | Number) => {
		//console.log("Kliknięte ID:", clickedId);
		router.push(`/locations/${clickedId}`);
	};

	const handleAddLoc = () => {
		router.push("locations/new");
	};
	if (status === "loading" || loading)
		return (
			<>
				<MobileNavigation pages={pages} />
				<LocCardsSkeleton />
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
				{locs.map((loc: Location) => (
					<Grid
						xs={12}
						sm={6}
						md={6}
						lg={4}
						xl={3}>
						<LocCard
							key={loc.id}
							loc={loc}
							handleClick={handleClick}
							isOwner={isOwner}
						/>
					</Grid>
				))}

				{session.user.role === "owner" && (
					<Grid
						xs={12}
						sm={6}
						md={6}
						lg={4}
						xl={3}>
						<Card
							variant='outlined'
							onClick={handleAddLoc}
							sx={{ height: "100%" }}>
							<CardContent>
								<Button
									sx={{ mt: 1 }}
									fullWidth
									size='large'
									startIcon={<AddIcon />}>
									Dodaj Lokalizacje
								</Button>
							</CardContent>
						</Card>
					</Grid>
				)}
			</Grid>
			{error !== "" && (
				<>
					<WarningAmberIcon
						color='error'
						sx={{ width: 100, height: 100, m: 5 }}
					/>
					<Typography
						variant='h5'
						align='center'
						color='red'>
						{error}
					</Typography>
				</>
			)}
		</>
	);
}
