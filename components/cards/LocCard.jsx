'use client'

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

const LocCard = ({ loc, handleClick, handleEdit, handleDelete}) => {

 
  const router = useRouter();

  const handleCardClick = () => {
    handleClick(loc._id) //Przekazuje ID klikniętej karty do funkcji handleClick
  };


  return (
    <div className="loc_card cursor-pointer" onClick={handleCardClick}>
      
          <h1 className="font-satoshi font-semibold text-2xl text-gray-900 text-center">
           {loc.name}
          </h1>
    </div>
  )
}

export default LocCard;