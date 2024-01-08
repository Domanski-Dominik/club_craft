"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import DaysCard from "@/components/cards/DaysCard";
import { Group } from "@/types/type";
import { Card, CardContent, Typography } from "@mui/material";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import CardsSkeleton from "@/components/skeletons/CardsSkeleton";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface Props {
	params: {
		id: string;
	};
}
export default function Days({ params }: Props) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [groups, setGroups] = useState({});
	const router = useRouter();
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
			if (session?.user || status === "authenticated") {
				//console.log(session.user);
				if (session.user.role === "owner" || session.user.role === "admin") {
					const response = await fetch(`/api/loc/days/${locId}`, {
						method: "GET",
					});
					const data: Group[] | { error: string } = await response.json();
					if (Array.isArray(data)) {
						const groupsByDay: { [dayOfWeek: number]: Group[] } = {};
						data.forEach((group) => {
							const { dayOfWeek } = group;

							if (!groupsByDay[dayOfWeek]) {
								groupsByDay[dayOfWeek] = [];
							}
							groupsByDay[dayOfWeek].push(group);
						});
						setGroups(groupsByDay);
						setLoading(false);
						setError("");
					} else {
						setError(error);
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
						const data2: Group[] | { error: string } = await response2.json();
						if (Array.isArray(data2)) {
							const filteredGroups = data2.filter((group) =>
								data.includes(group.id)
							);
							const groupsByDay: { [dayOfWeek: number]: Group[] } = {};
							filteredGroups.forEach((group) => {
								const { dayOfWeek } = group;

								if (!groupsByDay[dayOfWeek]) {
									groupsByDay[dayOfWeek] = [];
								}
								groupsByDay[dayOfWeek].push(group);
							});
							setGroups(groupsByDay);
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

	const handleDayClick = (id: string | number) => {
		router.push(`/locations/${locId}/${id}`);
	};

	const handleAddGroup = () => {
		router.push(`/locations/new/${locId}`);
	};
	if (status === "loading" || loading)
		return (
			<>
				<MobileNavigation pages={pages} />
				<CardsSkeleton />
			</>
		);
	if (error !== "")
		return (
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
		);
	return (
		<>
			<MobileNavigation pages={pages} />
			<DaysCard
				gr={groups}
				cols={1}
				handleClick={handleDayClick}
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
	);
}
