import { connectToDB } from "@utils/database";
import Loc from "@models/loc";
import Participant from "@models/participant";
import mongoose from "mongoose";


export const GET = async (req, { params }) => {
        
    //console.log(params.id)
        try {
            await connectToDB();
            
            const groupId = new mongoose.Types.ObjectId(params.id[0]);
            const groupName = params.id[1];

            const part = await Participant.find({'gr.day': groupId,'gr.name': groupName})
            
           
            if(!part) return new Response("Lista uczestników nie znalezniona", { status: 404});


            return new Response(JSON.stringify(part), {status: 201})
        } catch (error) {
            console.error('Błąd podczas pobierania listy uczestników grup:', error);
            return new Response("Failed to find group list", {status:500})
        } 

   
}