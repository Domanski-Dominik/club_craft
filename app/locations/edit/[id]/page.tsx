"use client";

import LocForm from "@/components/forms/LocForm";
import GoBack from "@/components/navigation/GoBack";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Loading from "@/context/Loading";
import { useEffect, useState } from "react";
import type { Location } from "@/types/type";
import { Typography } from "@mui/material";

interface Props {
  params: {
    id: string;
  };
}

const EditLoc = ({ params }: Props) => {
  const [loc, setLoc] = useState<Location>({
    id: 0,
    name: "",
    street: "",
    city: "",
    postalCode: "",
    streetNr: "",
    club: "",
  });
  const [error, setError] = useState("");
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  useEffect(() => {
    const fetchLoc = async (id: string) => {
      try {
        const response = await fetch(`/api/loc/${params.id}`, {
          method: "GET",
        });
        const data = await response.json();
        console.log(data);
        if (response.ok) {
          setLoc(data);
        } else {
          setError("Nie udało się pobrać lokalizacji");
        }
      } catch (error) {
        console.error("Błąd podczas pobierania grup: ", error);
      }
    };
    fetchLoc(params.id);
  }, []);
  if (status === "loading") return <Loading />;
  if (status === "authenticated") {
    return (
      <>
        {loc.club !== "" ? (
          <LocForm locInfo={loc} type={"edit"} />
        ) : (
          <Typography variant="h3" color="error">
            {error}
          </Typography>
        )}
      </>
    );
  }
};

export default EditLoc;
