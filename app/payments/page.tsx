'use client'

import React from 'react'
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Loading from '@/context/Loading';

const Payments = () => {
 
  const { status }= useSession({ required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  })

  if (status === "loading") return <Loading/>;

  return (
      <div className="loader">
      <div className="inner one"></div>
      <div className="inner two"></div>
      <div className="inner three"></div>
    </div>
    )
}

export default Payments