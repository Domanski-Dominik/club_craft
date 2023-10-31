'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import  { useState, useEffect }  from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter  } from 'next/navigation';
import Loading from '@/context/Loading';
import LocCard from '@/components/cards/LocCard'
import { Location } from '@/types/type';

type LocCardListProps = {
  data: [Location] | [] ;
  handleClick: (id: string | number) => void;
}

const LocCardList = ({data, handleClick}: LocCardListProps) => {
  return (
    <Box sx={{ minWidth: 275 , '& > :not(style)': { marginBottom: '20px' } }}>
      {data.map((loc: Location) => (
        <LocCard 
          key={loc.id}
          loc={loc}
          handleClick={handleClick}
        />
      ))}
    </Box>
  );
}


export default function OutlinedCard() {
  const [locs, setLocs] = useState<[Location]|[]>([]);
  const router = useRouter();
  const { status }= useSession({ required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  })

  const fetchLoc = async () => {
    const response = await fetch('/api/loc');
    const data:[Location] = await response.json();
    console.log(data)
    setLocs(data);
  };

  useEffect(() => {
    fetchLoc();
  }, []);

  const handleClick = (clickedId:String | Number) => {
    console.log('Kliknięte ID:', clickedId);

    router.push(`/locations/${clickedId}`)
    
  };
  if (status === "loading") return <Loading/>;

  return (
    
    <LocCardList
      data={locs} 
      handleClick={handleClick} 
    />   
  );
}