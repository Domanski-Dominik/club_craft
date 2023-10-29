'use client'

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

const GrCard = ({ gr, handleClick, handleEdit, handleDelete}) => {

  const handleGroupClick = () => {
    handleClick(gr) //Przekazuje ID klikniętej karty do funkcji handleClick
  };

  return (
    <div className="group_card cursor-pointer" onClick={handleGroupClick}>
      
          <h1 className="font-satoshi font-semibold text-2xl text-gray-900 text-center">
           {gr}
          </h1>
    </div>
  )
}

export default GrCard;