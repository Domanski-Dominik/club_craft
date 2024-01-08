"use client";
import HomeCard from "@/components/cards/HomeCard";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import MobileNavigation from "@/components/navigation/BreadCrumbs";

type Data = {
	groups: [];
	loc: [];
	participants: [];
	coaches: [];
};

const HomePage = () => {
	const pages = [{ id: 1, title: "Klub", path: "/home" }];
	const [isOwner, setIsOwner] = useState(false);
	const [data, setData] = useState<Data>({
		groups: [],
		loc: [],
		participants: [],
		coaches: [],
	});
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const fetchLoc = async () => {
		if (session?.user || status === "authenticated") {
			if (session.user.role === "owner" || session.user.role === "admin") {
				const response = await fetch(
					`/api/home/${session.user.role}/${session.user.club}`,
					{ method: "GET" }
				);
				const data = await response.json();
				setData({
					loc: data.loc,
					groups: data.groups,
					participants: data.participants,
					coaches: data.coaches,
				});
				setIsOwner(true);
			}
			if (session.user.role === "coach") {
				const response = await fetch(
					`/api/home/${session.user.role}/${session.user.club}/${session.user.id}`,
					{ method: "GET" }
				);
				const data = await response.json();
				setData({
					loc: data.loc,
					groups: data.groups,
					participants: data.participants,
					coaches: [],
				});
			}
		}
	};

	useEffect(() => {
		fetchLoc();
	}, [session]);
	return (
		<>
			<MobileNavigation pages={pages} />
			<Grid
				container
				spacing={0.5}>
				<Grid xs={6}>
					<HomeCard
						amount={data.loc.length === 0 ? 0 : data.loc.length}
						name='Lokalizacje'
						color='blue'
						url='/locations'
					/>
				</Grid>
				<Grid xs={6}>
					<HomeCard
						amount={data.coaches.length === 0 ? 0 : data.coaches.length}
						name='Trenerzy'
						color='green'
						url={isOwner ? "/home/coaches" : "/home"}
					/>
				</Grid>
				<Grid xs={6}>
					<HomeCard
						amount={data.groups.length === 0 ? 0 : data.groups.length}
						name='Grupy'
						color='indigo'
						url='/home/groups'
					/>
				</Grid>
				<Grid xs={6}>
					<HomeCard
						amount={
							data.participants.length === 0 ? 0 : data.participants.length
						}
						name='Uczestnicy'
						color='orange'
						url='/participants'
					/>
				</Grid>
			</Grid>
		</>
	);
};

export default HomePage;
