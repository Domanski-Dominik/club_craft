'use client'

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Location } from "@/types/type";

type LocCardProps = {
  loc: Location;
  handleClick: (id: string | number) => void;
}
export default function LocCard ( {loc, handleClick}: LocCardProps) {

  const handleCardClick = () => {
    handleClick(loc.id) //Przekazuje ID klikniętej karty do funkcji handleClick
  };


  return (
      <Card variant="outlined" onClick={handleCardClick}>
        <CardContent>
          <Typography variant="h5" component="div" >
            {loc.name}
          </Typography>
        
          <Typography variant="body2">
            <br />
            {loc.addres === "" && ("Brak danych o adresie")}
            {loc.addres !== "" && (loc.addres)}
          </Typography>
        </CardContent>
        <CardActions >
          <Button size="small" >Edytuj</Button>
        </CardActions>
      </Card>
  )
}

