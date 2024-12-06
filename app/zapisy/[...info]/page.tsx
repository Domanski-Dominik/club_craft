import SignInForm from "@/components/forms/SignInForm";
import { getLocsForSignIn, getSignInGroups } from "@/server/get-actions";
import { unstable_cache } from "next/cache";
import { handleResult } from "@/functions/promiseResults";
import StandardError from "@/components/errors/Standard";
import React from "react";
interface Props {
	params: {
		info: [string, string, string];
	};
}
const getCachedLocs = unstable_cache(
	async (clubName) => getLocsForSignIn(clubName),
	["calendar-locs"],
	{
		tags: ["locs"],
	}
);
const getCachedCalendarGroups = unstable_cache(
	async (clubName) => getSignInGroups(clubName),
	["calendar-groups"],
	{
		tags: ["groups"],
	}
);
const SignInPage = async ({ params }: Props) => {
	const clubName = params.info[0];
	const [groupsResult, locsResult] = await Promise.allSettled([
		getCachedCalendarGroups(clubName),
		getCachedLocs(clubName),
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
	const iOS =
		typeof navigator !== "undefined" &&
		/iPad|iPhone|iPod/.test(navigator.userAgent);
	return (
		<SignInForm
			clubName={clubName}
			groups={groups}
			locs={locs}
			iOS={iOS}
		/>
	);
};

export default SignInPage;
