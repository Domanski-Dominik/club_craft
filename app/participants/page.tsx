import AllParticipantList from "@/components/participants/AllParticipantList";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/context/Loading";
import { useSession } from "next-auth/react";
import React from "react";
import { redirect } from "next/navigation";
import type { Participant, LocWithGroups } from "@/types/type";
import StandardError from "@/components/errors/Standard";
import { auth } from "@/auth";
import {
	getAllParticipants,
	getClubInfo,
	getLocsWithGroups,
} from "@/server/get-actions";
import { unstable_cache } from "next/cache";
import { handleResult } from "@/functions/promiseResults";

const getCachedLocsWithGroups = unstable_cache(
	async (session) => getLocsWithGroups(session),
	["participants-all-locs"],
	{
		tags: ["locs"],
	}
);
const getCachedClubInfo = unstable_cache(
	async (session) => getClubInfo(session),
	["participants-all-groups"],
	{
		tags: ["club"],
	}
);
const getCachedAllParticipants = unstable_cache(
	async (session) => getAllParticipants(session, session.user.id),
	["participants-all"],
	{
		tags: ["participants"],
	}
);
const Participants = async () => {
	const session = await auth();
	const [clubInfoResult, locsWithGroupsResult, participantsResult] =
		await Promise.allSettled([
			getCachedClubInfo(session),
			getCachedLocsWithGroups(session),
			getCachedAllParticipants(session),
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

	return (
		<AllParticipantList
			participants={participants}
			locWithGroups={locsWithGroups}
			isOwner={session?.user.role === "owner"}
			clubInfo={clubInfo}
		/>
	);
};

export default Participants;
