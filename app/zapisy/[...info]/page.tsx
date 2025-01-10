import SignInForm from "@/components/forms/SignInForm";
import {
	getClubInfoSignin,
	getLocsForSignIn,
	getSignInGroups,
} from "@/server/get-actions";
import { unstable_cache } from "next/cache";
import { handleResult } from "@/functions/promiseResults";
import StandardError from "@/components/errors/Standard";
import React from "react";
interface Props {
	params: Promise<{
		info: [string, string, string];
	}>;
}
const getCachedClubInfo = unstable_cache(
	async (clubName) => getClubInfoSignin(clubName),
	["signin-clubInfo"],
	{
		tags: ["club"],
	}
);
const getCachedCalendarGroups = unstable_cache(
	async (clubName) => getSignInGroups(clubName),
	["signin-groups"],
	{
		tags: ["groups"],
	}
);
const SignInPage = async ({ params }: Props) => {
	const clubName = (await params).info[0];
	const [groupsResult, clubResults] = await Promise.allSettled([
		getCachedCalendarGroups(clubName),
		getCachedClubInfo(clubName),
	]);
	const groups = handleResult(groupsResult, "Groups");
	const clubInfo = handleResult(clubResults, "ClubInfo");
	if (!groups || !clubInfo) {
		return (
			<StandardError
				message={`Nie udało się pobrać ${
					!groups ? "grup" : "Informacji o klubie"
				}`}
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
			clubInfo={clubInfo}
			iOS={iOS}
		/>
	);
};

export default SignInPage;
