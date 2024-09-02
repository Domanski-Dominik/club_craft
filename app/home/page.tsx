"use client";
import HomeCard from "@/components/cards/HomeCard";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@mui/material";

type Data = {
	groups: [];
	loc: [];
	participants: [];
	coaches: [];
	role: string;
};

export default function HomePage() {
	const pages = [{ id: 1, title: "Klub", path: "/home" }];
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const {
		data: homeInfo,
		isSuccess,
		isError,
		error,
	} = useQuery<Data>({
		queryKey: ["home"],
		enabled: !!session,
		queryFn: () =>
			fetch(
				`/api/home/${session?.user.role}/${session?.user.club}/${session?.user.id}`
			).then((res) => res.json()),
	});
	return (
		<>
			<MobileNavigation pages={pages} />
			<Grid
				container
				spacing={1}
				paddingTop={3}
				width={"100%"}>
				<Grid
					xs={12}
					sm={6}
					md={6}
					lg={4}
					xl={3}>
					<HomeCard
						amount={
							isSuccess
								? homeInfo.coaches.length
									? homeInfo.coaches.length
									: 0 || 0
								: 0
						}
						name='Trenerzy'
						color='green'
						url={
							isSuccess
								? homeInfo.role === "owner"
									? "/home/coaches"
									: "/home"
								: "/home"
						}
					/>
				</Grid>
				<Grid
					xs={12}
					sm={6}
					md={6}
					lg={4}
					xl={3}>
					<HomeCard
						amount={
							isSuccess
								? homeInfo.groups.length
									? homeInfo.groups.length
									: 0 || 0
								: 0
						}
						name='Lokalizacje i Grupy'
						color='indigo'
						url='/home/manageGroups'
					/>
				</Grid>
				<Grid
					xs={12}
					sm={6}
					md={6}
					lg={4}
					xl={3}>
					<HomeCard
						amount={
							isSuccess
								? homeInfo.participants.length
									? homeInfo.participants.length
									: 0 || 0
								: 0
						}
						name='Uczestnicy'
						color='orange'
						url='/participants'
					/>
				</Grid>
			</Grid>
			{isError && <Typography color={"red"}>{error.message}</Typography>}
		</>
	);
}
