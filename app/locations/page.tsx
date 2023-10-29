'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const bull = (
  <Box
    component="span"
    sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
  >
    •
  </Box>
);

const card = (
  <React.Fragment>
    <CardContent>
      <Typography variant="h5" component="div">
        be{bull}nev{bull}o{bull}lent
      </Typography>
    
      <Typography variant="body2">
        well meaning and kindly.
        <br />
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small">Learn More</Button>
    </CardActions>
  </React.Fragment>
);

export default function OutlinedCard() {
  return (
    <Box sx={{ minWidth: 275 }}>
      <Card variant="outlined">{card}</Card>
    </Box>
  );
}
/*
import {useState, useEffect} from 'react';
import LocCard from "@/components/cards/LocCard"
import { useRouter,redirect } from "next/navigation";
import { useSession } from 'next-auth/react';
import Loading from '@/context/Loading';


const LocCardList = ({ data, handleClick}) => {
    return (
        <div className='loc_layout'>
            {data.map((loc) => (
              <LocCard 
                key={loc._id}
                loc={loc}
                handleClick={handleClick}
              />
            ))}
        </div>
    );
}

const Locations = () => {
  const [allLocs, setAllLocs] = useState([])
  const router = useRouter();
  const { status }= useSession({ required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  })

  /*const fetchLoc = async () => {
    const response = await fetch('/api/loc');
    const data = await response.json();

    setAllLocs(data);
  };

  useEffect(() => {
    fetchLoc();
  }, [session]);
  
  const handleClick = (clickedId:String) => {
    console.log('Kliknięte ID:', clickedId);

    router.push(`/locations/${clickedId}`)
    
  };
  if (status === "loading") return <Loading/>;

    return (
      <section >
          <LocCardList
          data={allLocs} 
          handleClick={handleClick} 
          />
      </section>
    )

}

export default Locations*/