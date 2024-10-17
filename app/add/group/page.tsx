import { getClubInfo, getLocs } from "@/server/get-actions";
import GroupForm from "@/components/forms/GroupForm";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";
import { handleResult } from "@/functions/promiseResults";
import StandardError from "@/components/errors/Standard";

const getCachedLocs = unstable_cache(
	async (session) => getLocs(session),
	["add-group-locs"],
	{
		tags: ["locs"],
	}
);
const getCachedClubInfo = unstable_cache(
	async (session) => getClubInfo(session),
	["add-group-club"],
	{
		tags: ["club"],
	}
);
const AddClass = async () => {
	const session = await auth();
	const [locsResults, clubInfoResults] = await Promise.allSettled([
		getCachedLocs(session),
		getCachedClubInfo(session),
	]);
	const locs = handleResult(locsResults, "locations");
	const club = handleResult(clubInfoResults, "clubs");
	if (!locs || !club)
		return (
			<StandardError
				message={
					!locs
						? "Błąd przy pobieraniu lokalizacji"
						: "Błąd przy pobieraniu informacji o klubie"
				}
				addParticipants={false}
			/>
		);
	return (
		<GroupForm
			clubInfo={club}
			locs={locs.length > 0 ? locs : []}
			user={session?.user}
			groupInfo={{}}
			edit={false}
		/>
	);
};

export default AddClass;
