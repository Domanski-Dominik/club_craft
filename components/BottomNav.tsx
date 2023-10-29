'use client'
import * as React from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HowToRegSharpIcon from '@mui/icons-material/HowToRegSharp';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { useRouter } from 'next/navigation';


export default function BottomNav() {
  const [value, setValue] = React.useState('locations');
  const router = useRouter();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    router.push(`/${newValue}`)
  };

  return (
    <BottomNavigation  value={value} onChange={handleChange}
    sx={{ width: '100vw', position: 'fixed', bottom: 0, zIndex: 50, height: '20vw'}}
    color={'primary'}>
      <BottomNavigationAction
        label="Klub"
        value="home"
        icon={<HomeOutlinedIcon />}
      />
      <BottomNavigationAction
        label="Uczestnicy"
        value="participants"
        icon={<PeopleAltOutlinedIcon />}
      />
      <BottomNavigationAction
        label="Dodaj"
        value="add"
        icon={<AddCircleOutlineOutlinedIcon  />}
      />
      <BottomNavigationAction
        label="Obecność"
        value="locations"
        icon={<HowToRegSharpIcon />}
      />
      <BottomNavigationAction 
        label="Płatności" 
        value="payments" 
        icon={<PaidOutlinedIcon />} 
      />
    </BottomNavigation>
  );
}