"use client";
import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Loading from "@/context/Loading";
import GrCard from "@/components/cards/GrCard";
import { Group } from "@/types/type";
import MobileNavigation from "@/components/navigation/BreadCrumbs";

const getPolishDayName = (dayOfWeek: number): string => {
	switch (dayOfWeek) {
		case 0:
			return "Niedziela";
		case 1:
			return "Poniedziałek";
		case 2:
			return "Wtorek";
		case 3:
			return "Środa";
		case 4:
			return "Czwartek";
		case 5:
			return "Piątek";
		case 6:
			return "Sobota";
		default:
			return "Nieznany dzień";
	}
};
interface Props {
	params: {
		ids: [string, string];
	};
}
export default function Grups({ params }: Props) {
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
	};
	useEffect(() => {
		const loadName = async (locId: string) => {
			try {
				const response = await fetch(`/api/loc/${locId}`, { method: "GET" });
				if (response.ok) {
					const locName = await response.json();
					console.log(locName);
					const dayName = getPolishDayName(dayNum);
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
				console.log(selectedGroups);
			} catch (error) {
				console.log("Error", error);
			}
		};
		fetchLoc(locId);
	}, [session]);

	if (status === "loading") return <Loading />;

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
