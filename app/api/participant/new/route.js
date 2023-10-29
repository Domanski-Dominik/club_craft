import { connectToDB } from "@utils/database";
import Participant from "@models/participant";


// POST - Utwórz nowego uczestnika
export const POST = async (req) => {
    try {
        await connectToDB();

        const { name,surname,gr,tel,email,presence,payments,note } = await req.json();
        

        //Tworzenie nowego uczestnika 
        const newParticipant = new Participant({
            name: name,
            surname: surname,
            gr: gr,
            tel: tel,
            email: email,
            presence: presence,
            payments: payments,
            note: note,
        });
        console.log(newParticipant);
        const savedParticipant = await newParticipant.save();
        
        return new Response(JSON.stringify(savedParticipant), {status: 201})
    } catch (error) {
        console.log(error)
        return new Response("Failed to create a new Participant", {status:500})
    }
}