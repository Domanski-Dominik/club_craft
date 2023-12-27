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
import { stat } from "fs";

interface Props {
	params: {
		ids: [string, string];
	};
}
export default function Grups({ params }: Props) {
	const [loading, setLoading] = useState(true);
	const [groups, setGroups] = useState<Group[]>([]);
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
		console.log(id);
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
			try {
				const response = await fetch(`/api/loc/days/${locId}`, {
					method: "GET",
				});
				const data: Group[] = await response.json();
				//console.log(data);
				const selectedGroups: Group[] = data.filter(
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
				//console.log(selectedGroups);
			} catch (error) {
				console.log("Error", error);
			}
		};
		fetchLoc(locId);
		setLoading(false);
	}, [session]);
	if (status === "loading" || loading)
		return (
			<>
				<MobileNavigation pages={pages} />
				<CardsSkeleton />
			</>
		);
	return (
		<>
			<MobileNavigation pages={pages} />
			<GrCard
				groups={groups}
				handleClick={handleGroupClick}
			/>
		</>
	);
}
