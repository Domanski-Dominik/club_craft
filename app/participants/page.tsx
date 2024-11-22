import AllParticipantList from "@/components/participants/AllParticipantList";
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
        message="Błąd przy pobieraniu danych"
        addParticipants={false}
      />
    );
  const sortedParticipants = sortAll(participants);
  if (session)
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
