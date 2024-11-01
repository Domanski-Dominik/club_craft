import { unstable_cache } from "next/cache";
import StatsCharts from "@/components/charts/StatsCharts";
import { auth } from "@/auth";
import { getAllParticipants, getLocsWithGroups } from "@/server/get-actions";
import StandardError from "@/components/errors/Standard";
import { handleResult } from "@/functions/promiseResults";

const getCachedLocsWithGroups = unstable_cache(
	async (session) => getLocsWithGroups(session),
	["stats-locs"],
	{
		tags: ["locs"],
	}
);
const getChachedParticipants = unstable_cache(
	async (session) => getAllParticipants(session, session?.user.id),
	["stats-groups"],
	{
		tags: ["participants"],
	}
);

const Stats = async () => {
	const session = await auth();
	const [participantsResults, locsWithGroupsResult] = await Promise.allSettled([
		getChachedParticipants(session),
		getCachedLocsWithGroups(session),
	]);
	const participants = handleResult(participantsResults, "participants");
	const locs = handleResult(locsWithGroupsResult, "Locations");
	if (!participants || !locs) {
		return (
			<StandardError
				message={`Nie udało się pobrać ${
					!participants ? "grup" : "lokalizacji"
				}`}
				addParticipants={false}
			/>
		);
	}
	return (
		<StatsCharts
			participants={participants}
			locsWithGroups={locs}
		/>
	);
};

export default Stats;
