'use client'

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Group } from "@/types/type";

type DaysCardProps = {
  gr: Group;
  handleClick: (id: string | number) => void;
}

const DaysCard = ({ gr, handleClick}: DaysCardProps) => {
  const handleDayClick = () => {
    handleClick(gr.id) //Przekazuje ID klikniętej karty do funkcji handleClick
  };
  return(
    <>
      {gr.groups.length > 0 && (
          <div className="day_card cursor-pointer" onClick={handleDayClick}>
          
              <h1 className="font-satoshi font-semibold text-2xl text-gray-900 text-center">
              {gr.day}
              </h1>
        </div>
      )}

      
      
  </>
  );
}

export default DaysCard;