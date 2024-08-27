"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import GroupForm from "@/components/forms/GroupForm";

const AddClass = () => {
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  const clubInfo = useQuery({
    queryKey: ["clubInfo"],
    enabled: !!session,
    queryFn: () =>
      fetch(`/api/club/${session?.user.id}`).then((res) => res.json()),
  });
  const locs = useQuery({
    queryKey: ["locs"],
    enabled: !!session,
    queryFn: () =>
      fetch(
        `/api/loc/club/${session?.user.club}/${session?.user.role}/${session?.user.id}`
      ).then((res) => res.json()),
  });
  if (locs.isSuccess && clubInfo.isSuccess)
    return (
      <GroupForm
        clubInfo={clubInfo.data}
        locs={locs.data.length > 0 ? locs.data : []}
        user={session?.user}
        groupInfo={{}}
      />
    );
};

export default AddClass;
