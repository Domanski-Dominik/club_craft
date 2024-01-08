"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LocCard from "@/components/cards/LocCard";
import { Location } from "@/types/type";
import { Card, CardContent, Typography } from "@mui/material";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import LocCardsSkeleton from "@/components/skeletons/LocCardSkeleton";

type LocCardListProps = {
	data: Location[] | [];
	handleClick: (id: string | number) => void;
	isOwner: boolean;
};

const LocCardList = ({ data, handleClick, isOwner }: LocCardListProps) => {
	return (
		<Box sx={{ minWidth: 275, "& > :not(style)": { marginBottom: "20px" } }}>
			{data.map((loc: Location) => (
				<LocCard
					key={loc.id}
					loc={loc}
					handleClick={handleClick}
					isOwner={isOwner}
				/>
			))}
		</Box>
	);
};

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
			console.log(session.user);
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
			{loading ? (
				<LocCardsSkeleton />
			) : (
				<LocCardList
					data={locs}
					handleClick={handleClick}
					isOwner={isOwner}
				/>
			)}
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
			{session.user.role === "owner" && (
				<Card
					variant='outlined'
					onClick={handleAddLoc}>
					<CardContent>
						<Typography variant='h6'>Dodaj lokalizacje</Typography>
					</CardContent>
				</Card>
			)}
		</>
	);
}
