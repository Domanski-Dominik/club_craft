import { getClubInfo, getLocs } from "@/server/get-actions";
import GroupForm from "@/components/forms/GroupForm";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";
import { handleResult } from "@/functions/promiseResults";
import StandardError from "@/components/errors/Standard";
import { getGroupById } from "@/server/get-actions";
interface Props {
	params: Promise<{
		id: string;
	}>;
}
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
const EditClass = async ({ params }: Props) => {
	const session = await auth();
	const [locsResults, clubInfoResults] = await Promise.allSettled([
		getCachedLocs(session),
		getCachedClubInfo(session),
	]);
	const club = handleResult(clubInfoResults, "clubs");
	const locs = handleResult(locsResults, "locations");
	const group = await getGroupById(parseInt((await params).id), session);
	if (!locs || !club || !group)
		return (
			<StandardError
				message={
					!locs
						? "Błąd przy pobieraniu lokalizacji"
						: !club
						? "Błąd przy pobieraniu informacji o klubie"
						: "Błąd przy pobieraniu informacji o grupie"
				}
				addParticipants={false}
			/>
		);
	return (
		<GroupForm
			clubInfo={club}
			locs={locs.length > 0 ? locs : []}
			user={session?.user}
			groupInfo={group}
			edit={true}
		/>
	);
};

export default EditClass;
