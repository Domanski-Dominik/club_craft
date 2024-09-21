"use client";
import HomeCard from "@/components/cards/HomeCard";
import Grid from "@mui/material/Grid2";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Typography } from "@mui/material";

type HomeData = {
	groups: any[];
	loc: any[];
	participants: any[];
	coaches: any[];
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
	} = useQuery<HomeData>({
		queryKey: ["home"],
		enabled: !!session,
		queryFn: () =>
			fetch(
				`/api/home/${session?.user.role}/${session?.user.club}/${session?.user.id}`
			).then((res) => res.json()),
	});

	const getAmount = (field: keyof HomeData) =>
		isSuccess ? homeInfo?.[field]?.length || 0 : 0;

	return (
		<>
			<MobileNavigation pages={pages} />
			<Grid
				container
				spacing={1}
				paddingTop={3}
				width={"100%"}>
				<Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}>
					<HomeCard
						amount={getAmount("coaches")}
						name='Trenerzy'
						color='green'
						url={homeInfo?.role === "owner" ? "/home/coaches" : "/home"}
					/>
				</Grid>

				<Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}>
					<HomeCard
						amount={getAmount("groups")}
						name='Lokalizacje i Grupy'
						color='indigo'
						url='/home/manageGroups'
					/>
				</Grid>

				<Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}>
					<HomeCard
						amount={getAmount("participants")}
						name='Uczestnicy'
						color='orange'
						url='/participants'
					/>
				</Grid>
			</Grid>
			{isError && (
				<Typography color={"red"}>{(error as Error).message}</Typography>
			)}
		</>
	);
}
