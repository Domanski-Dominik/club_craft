"use client";
import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Loading from "@/context/Loading";
import DaysCard from "@/components/cards/DaysCard";
import { Group } from "@/types/type";
import MobileNavigation from "@/components/navigation/BreadCrumbs";

interface Props {
	params: {
		id: string;
	};
}
export default function Days({ params }: Props) {
	const [groups, setGroups] = useState({});
	const router = useRouter();
	const [cols, setCols] = useState(1);
	const [pages, setPages] = useState([
		{ id: 1, title: "Lokalizacje", path: "/locations" },
	]);
	const locId = params.id;
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});

	useEffect(() => {
		const loadName = async (locId: string) => {
			try {
				const response = await fetch(`/api/loc/${locId}`, { method: "GET" });
				if (response.ok) {
					const locName = await response.json();
					//console.log(locName);
					setPages([
						...pages,
						{
							id: 2,
							title: `${locName.name}`,
							path: `/locations/${locName.id}`,
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
				const groupsByDay: { [dayOfWeek: number]: Group[] } = {};
				data.forEach((group) => {
					const { dayOfWeek } = group;

					if (!groupsByDay[dayOfWeek]) {
						groupsByDay[dayOfWeek] = [];
					}
					groupsByDay[dayOfWeek].push(group);
				});
				//console.log(groupsByDay);
				const uniqueDaysOfWeek = Object.keys(groupsByDay);
				const daysCount = uniqueDaysOfWeek.length;
				if (daysCount > 3) setCols(2);

				setGroups(groupsByDay);
			} catch (error) {
				console.log("Error", error);
			}
		};
		fetchLoc(locId);
	}, [session]);

	const handleDayClick = (id: string | number) => {
		router.push(`/locations/${locId}/${id}`);
	};

	if (status === "loading") return <Loading />;

	return (
		<>
			<MobileNavigation pages={pages} />
			<DaysCard
				gr={groups}
				cols={cols}
				handleClick={handleDayClick}
			/>
		</>
	);
}
