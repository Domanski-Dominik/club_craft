"use client";
import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Loading from "@/context/Loading";
import DaysCard from "@/components/cards/DaysCard";
import { Group } from "@/types/type";

interface Props {
	params: {
		id: string;
	};
}
export default function Days({ params }: Props) {
	const [groups, setGroups] = useState({});
	const router = useRouter();
	const locId = params.id;
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});

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
				console.log(groupsByDay);
				setGroups(groupsByDay);
			} catch (error) {
				console.log("Error", error);
			}
		};
		fetchLoc(locId);
	}, [session]);

	const handleDayClick = (id: string | number) => {};

	if (status === "loading") return <Loading />;

	return (
		<DaysCard
			gr={groups}
			handleClick={handleDayClick}
		/>
	);
}
