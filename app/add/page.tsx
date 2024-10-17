import React from "react";
import ParticipantForm from "@/components/forms/PrtForm";
import { getLocsWithGroups } from "@/server/get-actions";
import StandardError from "@/components/errors/Standard";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";
import { handleResult } from "@/functions/promiseResults";

const getCachedLocsWithGroups = unstable_cache(
	async (session) => getLocsWithGroups(session),
	["add-locs-with-groups"],
	{
		tags: ["locs"],
	}
);
const AddParticipant = async () => {
	const session = await auth();
	const [locWithGroupsResults] = await Promise.allSettled([
		getCachedLocsWithGroups(session),
	]);
	const locWithGroups = handleResult(locWithGroupsResults, "locsWithGroups");
	if ("error" in locWithGroups) {
		<StandardError
			message={locWithGroups.error}
			addParticipants={false}
		/>;
	}
	if (session)
		return (
			<ParticipantForm
				locWithGroups={locWithGroups}
				session={session}
			/>
		);
};

export default AddParticipant;
