"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import CardsSkeleton from "@/components/skeletons/CardsSkeleton";
import { Typography } from "@mui/material";
import GrCard from "@/components/cards/GrCard";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import PolishDayName from "@/context/PolishDayName";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useQuery } from "@tanstack/react-query";

interface Props {
  params: {
    ids: [string, string];
  };
}
type GroupP = {
  id: number;
  name: string;
  dayOfWeek: number;
  timeS: string;
  timeE: string;
  club: string;
  participants: number;
};
export default function Grups({ params }: Props) {
  const router = useRouter();
  const locId = params.ids[0];
  const day = params.ids[1];
  const dayNum = parseInt(day, 10);
  const pages = [{ id: 1, title: "Lokalizacje", path: "/locations" }];
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  const breadcrumbs = useQuery({
    queryKey: ["breadcrumbs2", params.ids[0]],
    queryFn: () => fetch(`/api/loc/${locId}`).then((res) => res.json()),
    select: (data) => [
      { id: 1, title: "Lokalizacje", path: "/locations" },
      {
        id: 2,
        title: `${data?.name}`,
        path: `/locations/${data?.id}`,
      },
      {
        id: 3,
        title: `${PolishDayName(dayNum)}`,
        path: `locations/${data?.id}/${dayNum}`,
      },
    ],
  });
  const allGroups = useQuery({
    queryKey: ["allGroups", params.ids[0], params.ids[1]],
    enabled: !!session,
    queryFn: () =>
      fetch(
        `/api/loc/days/${params.ids[0]}/groups/${session?.user.role}/${session?.user.id}/${params.ids[1]}`
      ).then((res) => res.json()),
  });

  const handleGroupClick = (id: string | number) => {
    router.push(`/group/${id}`);
  };
  const handleAddGroup = () => {
    router.push(`/locations/new/${locId}`);
  };
  if (allGroups.isLoading || status === "loading")
    return (
      <>
        <MobileNavigation
          pages={breadcrumbs.isSuccess ? breadcrumbs.data : pages}
        />
        <CardsSkeleton />
      </>
    );
  if (allGroups.isError)
    return (
      <>
        <MobileNavigation
          pages={breadcrumbs.isSuccess ? breadcrumbs.data : pages}
        />
        <WarningAmberIcon
          color="error"
          sx={{ width: 100, height: 100, m: 5 }}
        />
        <Typography variant="h5" align="center" color="red">
          {allGroups.error.message}
        </Typography>
      </>
    );
  return (
    <>
      <MobileNavigation
        pages={breadcrumbs.isSuccess ? breadcrumbs.data : pages}
      />
      <GrCard
        groups={allGroups?.data}
        handleClick={handleGroupClick}
        owner={session.user.role === "owner"}
        handleAddGroupClick={handleAddGroup}
      />
    </>
  );
}
