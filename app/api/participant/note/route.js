import { connectToDB } from "@utils/database";
import Participant from "@models/participant";


export const PATCH = async (req) => {
  
  const { id, note} = await req.json();
  console.log('Route js: '+ id, note);
    try {
      await connectToDB();
      

      const existingParticipant = await Participant.findById(id);

      if(!existingParticipant) return new Response("Participant not found", {status: 404});

      existingParticipant.note = note
      //console.log(existingParticipant);
      await existingParticipant.save();

      return new Response(JSON.stringify(existingParticipant), {status: 200})
    } catch (error) {
        console.error('Błąd podczas zapisywania Płatności:', error);
          return new Response("Błąd podczas Płatności:", {status:500})
    };
}


