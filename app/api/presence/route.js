import { connectToDB } from "@utils/database";
import Participant from "@models/participant";


export const PATCH = async (req) => {
  
  const { id, date, toDo } = await req.json();
  console.log('Route js: '+ id, date, toDo);
  if(toDo === 'zapisz'){
    try {
      await connectToDB();
      

      const existingParticipant = await Participant.findById(id);
      if(!existingParticipant) return new Response("Participant not found", {status: 404});
      
      if (!existingParticipant.presence ) {
        console.log('mamy kurwa null')
        existingParticipant.presence = [];
      }
    
      console.log('Obecność: ',existingParticipant.presence);
      existingParticipant.presence.push(date);
      //console.log(existingParticipant);
      await existingParticipant.save();

      return new Response(JSON.stringify(existingParticipant), {status: 200})
    } catch (error) {
        console.error('Błąd podczas zapisywania Obecności:', error);
          return new Response("Błąd podczas obecności:", {status:500})
    }  
  } else {
    try {
      await connectToDB();
    
      const existingParticipant = await Participant.findByIdAndUpdate(id,{
        $pull: {presence: date},
      },{new:true});

      if(!existingParticipant) return new Response("Participant not found", {status: 404});
    
      console.log('Obecność: ',existingParticipant.presence);

      await existingParticipant.save();

      return new Response(JSON.stringify(existingParticipant), {status: 200})
    } catch (error) {
        console.error('Błąd podczas zapisywania Obecności:', error);
          return new Response("Błąd podczas obecności:", {status:500})
    }  
  };
}


