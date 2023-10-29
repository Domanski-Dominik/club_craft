'use client'

import FormPrt from "@components/FormPrt"
import GoBack from "@components/GoBack";
import Login from "@components/Login";
import { useState } from 'react'
import { useSession } from "next-auth/react";

const CreateParticipant = () => {
  const [submitting, setSubmitting] = useState(false);
  const [participant, setParticipant] = useState({
    name: '',
    surname: '',
    tel: '',
    gr: [{
      name: '',
      day: '',
    }],
    email:'',
    presence: [],
    payments: [],
    note: null,
  });
  const {data:session,status }= useSession();

  const createParticipant = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/participant/new',
      {
        method: 'POST',
        body: JSON.stringify({
            name: participant.name,
            surname: participant.surname,
            tel: participant.tel,
            gr: participant.gr,
            email: participant.email,
            presence: [],
            payments: [],
            note: null,
        })
      })
      if(response.ok) {
        window.history.back();
      }
      
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  }

  if(status === "authenticated"){
  return (
    <div>
        <GoBack />
        <FormPrt 
            type="Utwórz"
            participant={participant}
            setParticipant={setParticipant}
            submitting={submitting}
            handleSubmit={createParticipant}
        />
    </div>
  )
  };
  return <Login />;
}

export default CreateParticipant