"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Loading from "@/context/Loading";
import LocCard from "@/components/cards/LocCard";
import { Location } from "@/types/type";
import { Card, CardContent, Typography } from "@mui/material";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import LocCardsSkeleton from "@/components/skeletons/LocCardSkeleton";

type LocCardListProps = {
  data: Location[] | [];
  handleClick: (id: string | number) => void;
  isOwner: boolean;
};

const LocCardList = ({ data, handleClick, isOwner }: LocCardListProps) => {
  return (
    <Box sx={{ minWidth: 275, "& > :not(style)": { marginBottom: "20px" } }}>
      {data.map((loc: Location) => (
        <LocCard
          key={loc.id}
          loc={loc}
          handleClick={handleClick}
          isOwner={isOwner}
        />
      ))}
    </Box>
  );
};

export default function LocationList() {
  const [loading, setLoading] = useState(true);
  const [locs, setLocs] = useState<Location[] | []>([]);
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const pages = [
    {
      id: 1,
      title: "Lokalizacje",
      path: "/locations",
    },
  ];
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const fetchLoc = async () => {
    if (session?.user || status === "authenticated") {
      const response = await fetch(`/api/loc/club/${session.user.club}`);
      const data: Location[] = await response.json();
      console.log(session.user);
      console.log(data);
      if (
        session.user.role === "owner" ||
        session.user.role === "admin" ||
        session.user.role === "guest"
      ) {
        setIsOwner(true);
      }
      setLocs(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoc();
  }, [session]);

  const handleClick = (clickedId: String | Number) => {
    console.log("Kliknięte ID:", clickedId);
    router.push(`/locations/${clickedId}`);
  };

  const handleAddLoc = () => {
    router.push("locations/new");
  };
  if (status === "loading")
    return (
      <>
        <MobileNavigation pages={pages} />
        <LocCardsSkeleton />
      </>
    );

  return (
    <>
      <MobileNavigation pages={pages} />
      {loading ? (
        <LocCardsSkeleton />
      ) : (
        <LocCardList data={locs} handleClick={handleClick} isOwner={isOwner} />
      )}
      {session.user.role === "owner" && (
        <Card variant="outlined" onClick={handleAddLoc}>
          <CardContent>
            <Typography variant="h6">Dodaj lokalizacje</Typography>
          </CardContent>
        </Card>
      )}
    </>
  );
}
