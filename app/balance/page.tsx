import React from "react";
import { getAllParticipants, getLocs } from "@/server/get-actions";
import StandardError from "@/components/errors/Standard";
import { handleResult } from "@/functions/promiseResults";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";
import Balance from "@/components/lists/Balance";

const getCachedLocs = unstable_cache(
	async (session) => getLocs(session),
	["calendar-locs"],
	{
		tags: ["locs"],
	}
);
const getCachedAllParticipants = unstable_cache(
	async (session) => getAllParticipants(session, session.user.id),
	["participants-balance"],
	{
		tags: ["participants"],
	}
);

const BalancePage = async () => {
	const session = await auth();
	const [participantsResult, locsResult] = await Promise.allSettled([
		getCachedAllParticipants(session),
		getCachedLocs(session),
	]);
	const participants = handleResult(participantsResult, "participants");
	const locs = handleResult(locsResult, "Locations");
	if (!participants)
		return (
			<StandardError
				message='Błąd przy pobieraniu danych'
				addParticipants={false}
			/>
		);
	return <Balance participants={participants} />;
};

export default BalancePage;
