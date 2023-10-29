import { connectToDB } from "@utils/database";
import Participant from "@models/participant";


export const PATCH = async (req) => {
  
  const { id, money, note, month, toDo } = await req.json();
  console.log('Route js: '+ id, month, toDo , money , note);
  if(toDo === 'zapisz'){
    try {
      await connectToDB();
      

      const existingParticipant = await Participant.findById(id);

      if(!existingParticipant) return new Response("Participant not found", {status: 404});
      
      if (!existingParticipant.payments) {
        console.log('mamy kurwa null')
        existingParticipant.payments = [];
      }

      const existingPayment = existingParticipant.payments.find(
        (payment) => payment.month === month
      )
    
      if(existingPayment) {
        existingPayment.money = money;
        existingPayment.note = note;
      } else {
        existingParticipant.payments.push({
          money: money,
          note: note,
          month: month,
        });
      }
      
      console.log(existingParticipant.payments);

     
      //console.log(existingParticipant);
      await existingParticipant.save();

      return new Response(JSON.stringify(existingParticipant), {status: 200})
    } catch (error) {
        console.error('Błąd podczas zapisywania Płatności:', error);
          return new Response("Błąd podczas Płatności:", {status:500})
    }  
  } else {
    try {
      await connectToDB();
    
      const existingParticipant = await Participant.findByIdAndUpdate(id,{
        $pull: {presence: date},
      },{new:true});

      if(!existingParticipant) return new Response("Participant not found", {status: 404});
    
      console.log(existingParticipant.presence);

      await existingParticipant.save();

      return new Response(JSON.stringify(existingParticipant), {status: 200})
    } catch (error) {
        console.error('Błąd podczas zapisywania Obecności:', error);
          return new Response("Błąd podczas obecności:", {status:500})
    }  
  };
}


