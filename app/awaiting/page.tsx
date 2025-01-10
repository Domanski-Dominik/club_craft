import React from "react";
import StandardError from "@/components/errors/Standard";
import { auth } from "@/auth";
import {
	getAwaitingParticipants,
	getClubInfo,
	getLocsWithGroups,
} from "@/server/get-actions";
import { unstable_cache } from "next/cache";
import { handleResult } from "@/functions/promiseResults";
import Awaiting from "@/components/lists/Awaiting";

const getCachedLocsWithGroups = unstable_cache(
	async (session) => getLocsWithGroups(session),
	["participants-all-locs"],
	{
		tags: ["locs"],
	}
);
const getCachedClubInfo = unstable_cache(
	async (session) => getClubInfo(session),
	["participants-all-club"],
	{
		tags: ["club"],
	}
);
const getCachedAwaitingParticipants = unstable_cache(
	async (session) => getAwaitingParticipants(session),
	["participants-all"],
	{
		tags: ["awaiting"],
	}
);
const AwaitingParticipants = async () => {
	const session = await auth();
	const [clubInfoResult, locsWithGroupsResult, participantsResult] =
		await Promise.allSettled([
			getCachedClubInfo(session),
			getCachedLocsWithGroups(session),
			getCachedAwaitingParticipants(session),
		]);
	const locsWithGroups = handleResult(locsWithGroupsResult, "locations");
	const clubInfo = handleResult(clubInfoResult, "clubInfo");
	const participants = handleResult(participantsResult, "participants");
	if (!locsWithGroups || !clubInfo || !participants)
		return (
			<StandardError
				message='Błąd przy pobieraniu danych'
				addParticipants={false}
			/>
		);
	if (session)
		return (
			<Awaiting
				participants={participants}
				locWithGroups={locsWithGroups}
			/>
		);
};

export default AwaitingParticipants;
