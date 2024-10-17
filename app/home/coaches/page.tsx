import { auth } from "@/auth";
import CoachDataGrid from "@/components/datagrids/CoachDataGrid";
import { unstable_cache } from "next/cache";
import { handleResult } from "@/functions/promiseResults";
import { getCoaches, getLocsWithGroups } from "@/server/get-actions";
import StandardError from "@/components/errors/Standard";

const getCachedLocsWithGroups = unstable_cache(
	async (session) => getLocsWithGroups(session),
	["coaches-locs-with-groups"],
	{
		tags: ["locs"],
	}
);
const getCachedCoaches = unstable_cache(
	async (session) => getCoaches(session),
	["coaches-coaches"],
	{
		tags: ["coaches"],
	}
);
const CoachesManage = async () => {
	const session = await auth();
	const [locsWithGroupsResults, coachesResults] = await Promise.allSettled([
		getCachedLocsWithGroups(session),
		getCachedCoaches(session),
	]);
	const locsWithGroups = handleResult(locsWithGroupsResults, "locations");
	const coaches = handleResult(coachesResults, "coaches");
	if (!locsWithGroups || !coaches)
		return (
			<StandardError
				message={
					!locsWithGroups
						? "Błąd przy pobieraniu lokalizacji"
						: "Błąd przy pobieraniu informacji o prowadzących"
				}
				addParticipants={false}
			/>
		);
	if (session)
		return (
			<CoachDataGrid
				locsWithGroups={locsWithGroups}
				coaches={coaches}
				session={session}
			/>
		);
};

export default CoachesManage;
