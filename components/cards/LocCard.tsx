"use client";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Location } from "@/types/type";
import { useRouter } from "next/navigation";

type LocCardProps = {
  loc: Location;
  handleClick: (id: string | number) => void;
  isOwner: boolean;
};
export default function LocCard({ loc, handleClick, isOwner }: LocCardProps) {
  const router = useRouter();
  const handleCardClick = () => {
    handleClick(loc.id); //Przekazuje ID klikniętej karty do funkcji handleClick
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" component="div" onClick={handleCardClick}>
          {loc.name}
        </Typography>

        <Typography variant="body2" onClick={handleCardClick}>
          <br />
          {loc.street === "" && "Brak danych o adresie"}
          {loc.street !== "" &&
            `ul. ${loc.street} ${loc.streetNr} ${loc.city} ${loc.postalCode}`}
        </Typography>
      </CardContent>
      {isOwner && (
        <CardActions>
          <Button
            size="small"
            onClick={() => router.push(`/locations/edit/${loc.id}`)}>
            Edytuj
          </Button>
        </CardActions>
      )}
    </Card>
  );
}
