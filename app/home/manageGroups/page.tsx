import { Box } from "@mui/material";
import StandardError from "@/components/errors/Standard";
import LocsDataGrid from "@/components/datagrids/LocsDataGrid";
import GroupDataGrid from "@/components/datagrids/GroupDataGrid";
import { getCalendarGroups, getLocs } from "@/server/get-actions";
import { handleResult } from "@/functions/promiseResults";
import { unstable_cache } from "next/cache";
import { auth } from "@/auth";

const getCachedLocs = unstable_cache(
	async (session) => getLocs(session),
	["manageGroups-locs"],
	{
		tags: ["locs"],
	}
);
const getCachedCalendarGroups = unstable_cache(
	async (session) => getCalendarGroups(session),
	["manageGroups-groups"],
	{
		tags: ["groups"],
	}
);
const ManageGroups = async () => {
	const session = await auth();
	const [groupsResult, locsResult] = await Promise.allSettled([
		getCachedCalendarGroups(session),
		getCachedLocs(session),
	]);
	const groups = handleResult(groupsResult, "Groups");
	const locs = handleResult(locsResult, "Locations");
	if (!groups || !locs) {
		return (
			<StandardError
				message={`Nie udało się pobrać ${!groups ? "grup" : "lokalizacji"}`}
				addParticipants={false}
			/>
		);
	}
	return (
		<Box
			sx={{
				height: "100%",
				width: "100%",
				px: 1,
			}}>
			<LocsDataGrid locs={locs} />
			<GroupDataGrid groups={groups} />
		</Box>
	);
};

export default ManageGroups;
