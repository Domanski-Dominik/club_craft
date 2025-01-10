import { Box } from "@mui/material";
import ParticipantList from "@/components/participants/ParticipantList";
import { sortAndAddNumbers } from "@/functions/sorting";
import StandardError from "@/components/errors/Standard";
import { LocWithGroups } from "@/types/type";
import { auth } from "@/auth";
import {
	getClubInfo,
	getGroupById,
	getLocs,
	getLocsWithGroups,
} from "@/server/get-actions";
import { unstable_cache } from "next/cache";
import { handleResult } from "@/functions/promiseResults";
import { getParticipantsByGroupId } from "@/server/participant-actions";
import { Session } from "next-auth";

interface Props {
	params: Promise<{
		id: string;
	}>;
}
const getCachedLocsWithGroups = unstable_cache(
	async (session) => getLocsWithGroups(session),
	["group-id-locs-with-groups"],
	{
		tags: ["locs"],
	}
);
const getCachedClubInfo = unstable_cache(
	async (session) => getClubInfo(session),
	["group-id-club"],
	{
		tags: ["club"],
	}
);
const createGetCachedParticipants = (
	groupId: number,
	session: Session | null
) =>
	unstable_cache(
		async () => getParticipantsByGroupId(groupId, session),
		[`group-id-${groupId}-participants`],
		{
			tags: ["participants"],
		}
	);

const createGetCachedGroup = (groupId: number, session: Session | null) =>
	unstable_cache(
		async () => getGroupById(groupId, session),
		[`group-id-${groupId}-group`],
		{
			tags: ["groups"],
		}
	);
const Group = async ({ params }: Props) => {
	const session = await auth();
	const groupId = parseInt((await params).id, 10); // Zakładam, że `params.groupId` jest stringiem
	const getCachedParticipants = createGetCachedParticipants(groupId, session);
	const getCachedGroup = createGetCachedGroup(groupId, session);
	const [
		locsWithGroupsResults,
		clubInfoResults,
		participantsResults,
		groupResults,
	] = await Promise.allSettled([
		getCachedLocsWithGroups(session),
		getCachedClubInfo(session),
		getCachedParticipants(),
		getCachedGroup(),
	]);
	const locsWithGroups = handleResult(locsWithGroupsResults, "locations");
	const club = handleResult(clubInfoResults, "clubs");
	const participants = handleResult(participantsResults, "participants");
	const group = handleResult(groupResults, "groups");
	if (!locsWithGroups || !club || !participants || !group)
		return (
			<StandardError
				message={
					!locsWithGroups
						? "Błąd przy pobieraniu lokalizacji"
						: !club
						? "Błąd przy pobieraniu informacji o klubie"
						: !participants
						? "Błąd przy pobieraniu uczestników grupy"
						: "Błąd przy pobieraniu informacji o grupie"
				}
				addParticipants={false}
			/>
		);

	if (session)
		return (
			<Box
				sx={{
					height: {
						xs: "calc(100vh - 75px - 100px)",
						sm: "calc(100vh - 90px - 25px)",
					},
					width: "100%",
					backgroundColor: "white",
					borderRadius: 4,
					px: 1,
				}}>
				<ParticipantList
					participants={participants}
					groupId={groupId}
					group={group}
					clubInfo={club}
					isOwner={session.user.role === "owner"}
					locWithGroups={locsWithGroups}
				/>
			</Box>
		);
};

export default Group;
/*
const formattedparticipants = sortAndAddNumbers(
		participants,
		params.id,
		"normal"
	);
*/
