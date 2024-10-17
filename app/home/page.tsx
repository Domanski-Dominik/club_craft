import HomeCard from "@/components/cards/HomeCard";
import Grid from "@mui/material/Grid2";
import { getHomeInfo } from "@/server/get-actions";
import StandardError from "@/components/errors/Standard";
import { unstable_cache } from "next/cache";
import { auth } from "@/auth";
import { handleResult } from "@/functions/promiseResults";

const getCachedHomeInfo = unstable_cache(
	async (sesssion) => getHomeInfo(sesssion),
	["homeInfo"]
);
export default async function HomePage() {
	const session = await auth();
	const [homeInfoResult] = await Promise.allSettled([
		getCachedHomeInfo(session),
	]);
	const homeInfo = handleResult(homeInfoResult, "homeInfo");
	if (!homeInfo) {
		return (
			<StandardError
				message='Nie udało się pobrać info'
				addParticipants={false}
			/>
		);
	}
	return (
		<>
			<Grid
				container
				spacing={1}
				paddingTop={3}
				width={"100%"}>
				<Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}>
					<HomeCard
						amount={homeInfo.coaches}
						name='Trenerzy'
						color='green'
						url={homeInfo?.role === "owner" ? "/home/coaches" : "/home"}
					/>
				</Grid>

				<Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}>
					<HomeCard
						amount={homeInfo.groups}
						name='Grupy'
						color='indigo'
						url='/home/manageGroups'
					/>
				</Grid>

				<Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}>
					<HomeCard
						amount={homeInfo.groups}
						name='Uczestnicy'
						color='orange'
						url='/participants'
					/>
				</Grid>
			</Grid>
		</>
	);
}
