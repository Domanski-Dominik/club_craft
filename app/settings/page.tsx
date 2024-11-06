import React from "react";
import StandardError from "@/components/errors/Standard";
import { auth } from "@/auth";
import {
	getAllParticipants,
	getClubInfo,
	getLocsWithGroups,
} from "@/server/get-actions";
import { unstable_cache } from "next/cache";
import { handleResult } from "@/functions/promiseResults";
import { sortAll } from "@/functions/sorting";
import SettingsTabs from "@/components/settings/SettingsTabs";
import NotAllowed from "@/components/errors/NotAllowed";

const getCachedClubInfo = unstable_cache(
	async (session) => getClubInfo(session),
	["settings-club"],
	{
		tags: ["club"],
	}
);
const SettingsPage = async () => {
	const session = await auth();
	const [clubInfoResult] = await Promise.allSettled([
		getCachedClubInfo(session),
	]);
	const clubInfo = handleResult(clubInfoResult, "clubInfo");
	if (!clubInfo)
		return (
			<StandardError
				message='Błąd przy pobieraniu danych'
				addParticipants={false}
			/>
		);
	if (session?.user.role !== "coach") {
		return <SettingsTabs clubInfo={clubInfo} />;
	} else {
		<NotAllowed />;
	}
};

export default SettingsPage;
