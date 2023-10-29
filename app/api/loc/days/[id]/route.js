import { connectToDB } from "@utils/database";
import Loc from "@models/loc";

export const GET = async (response, { params }) => {

        try {
            await connectToDB();
    
            //znajduje wszystkie grupy w bazie danych
            const loc = await Loc.findById(params.id);//params.id to identyfikator id który przekazuje z locations/ jako id lokacji którą kliknięto
           // console.log(loc);
           // const days = loc.daysOfWeek; // To tablica identyfikatorów grup z modeli loc
            
    
         
           // console.log(days);
            if(!loc) return new Response("Loc not found", { status: 404});
            
            return new Response(JSON.stringify(loc), {status: 201})
        } catch (error) {
            console.error('Błąd podczas pobierania nazw grup:', error);
            return new Response("Failed to find groups", {status:500})
        } 

   
}