"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import CardsSkeleton from "@/components/skeletons/CardsSkeleton";
import GrCard from "@/components/cards/GrCard";
import { Group } from "@/types/type";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import PolishDayName from "@/context/PolishDayName";
import { Card, CardContent, Typography } from "@mui/material";
import { stat } from "fs";

interface Props {
	params: {
		ids: [string, string];
	};
}
type GroupP = {
	id: number;
	name: string;
	dayOfWeek: number;
	timeS: string;
	timeE: string;
	club: string;
	participants: number;
};
export default function Grups({ params }: Props) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [groups, setGroups] = useState<GroupP[]>([]);
	const router = useRouter();
	const [pages, setPages] = useState([
		{ id: 1, title: "Lokalizacje", path: "/locations" },
	]);
	const locId = params.ids[0];
	const day = params.ids[1];
	const dayNum = parseInt(day, 10);
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const handleGroupClick = (id: string | number) => {
		//console.log(id);
		router.push(`/group/${id}`);
	};

	useEffect(() => {
		const loadName = async (locId: string) => {
			try {
				const response = await fetch(`/api/loc/${locId}`, { method: "GET" });
				if (response.ok) {
					const locName = await response.json();
					//console.log(locName);
					const dayName = PolishDayName(dayNum);
					setPages([
						...pages,
						{
							id: 2,
							title: `${locName.name}`,
							path: `/locations/${locName.id}`,
						},
						{
							id: 3,
							title: `${dayName}`,
							path: `locations/${locName.id}/${dayNum}`,
						},
					]);
				}
			} catch (error) {
				console.log("Error", error);
			}
		};
		loadName(locId);
	}, []);
	useEffect(() => {
		const fetchLoc = async (locId: string) => {
			if (session?.user || status === "authenticated") {
				if (session.user.role === "owner" || session.user.role === "admin") {
					const response = await fetch(`/api/loc/days/${locId}`, {
						method: "GET",
					});
					const data: GroupP[] | { error: string } = await response.json();
					if (Array.isArray(data)) {
						const selectedGroups: GroupP[] = data.filter(
							(group) => group.dayOfWeek === dayNum
						);
						selectedGroups.sort((a, b) => {
							// Porównanie czasu w formacie HH:mm
							const timeA = a.timeS.split(":").map(Number);
							const timeB = b.timeS.split(":").map(Number);

							if (timeA[0] !== timeB[0]) {
								return timeA[0] - timeB[0]; // Sortowanie wg. godzin
							} else {
								return timeA[1] - timeB[1]; // Sortowanie wg. minut
							}
						});
						if (selectedGroups && selectedGroups.length > 0) {
							setGroups(selectedGroups);
						}
						setLoading(false);
						setError("");
					} else {
						setError(data.error);
						setLoading(false);
					}
				}
				if (session.user.role === "coach") {
					const response = await fetch(
						`/api/coaches/groups/${session.user.id}`,
						{ method: "GET" }
					);
					const data: number[] | { error: string } = await response.json();
					if (Array.isArray(data)) {
						const response2 = await fetch(`/api/loc/days/${locId}`, {
							method: "GET",
						});
						const data2: GroupP[] | { error: string } = await response2.json();
						if (Array.isArray(data2)) {
							const filteredGroups = data2.filter((group) =>
								data.includes(group.id)
							);
							const selectedGroups: GroupP[] = filteredGroups.filter(
								(group) => group.dayOfWeek === dayNum
							);
							selectedGroups.sort((a, b) => {
								// Porównanie czasu w formacie HH:mm
								const timeA = a.timeS.split(":").map(Number);
								const timeB = b.timeS.split(":").map(Number);

								if (timeA[0] !== timeB[0]) {
									return timeA[0] - timeB[0]; // Sortowanie wg. godzin
								} else {
									return timeA[1] - timeB[1]; // Sortowanie wg. minut
								}
							});
							if (selectedGroups && selectedGroups.length > 0) {
								setGroups(selectedGroups);
							}
							setLoading(false);
							setError("");
						} else {
							setError(data2.error);
							setLoading(false);
						}
					} else {
						setError(data.error);
						setLoading(false);
					}
				}
			}
		};
		fetchLoc(locId);
	}, [session]);
	const handleAddGroup = () => {
		router.push(`/locations/new/${locId}`);
	};

	return (
		<>
			{status === "loading" || loading ? (
				<>
					<MobileNavigation pages={pages} />
					<CardsSkeleton />
				</>
			) : (
				<>
					<MobileNavigation pages={pages} />
					<GrCard
						groups={groups}
						handleClick={handleGroupClick}
					/>
					{session.user.role === "owner" && (
						<Card
							variant='outlined'
							onClick={handleAddGroup}
							sx={{ marginTop: "1rem" }}>
							<CardContent>
								<Typography variant='h6'>Dodaj/Usuń grupy</Typography>
							</CardContent>
						</Card>
					)}
				</>
			)}
		</>
	);
}
