import { connectToDB } from "@utils/database";
import Participant from "@models/participant";

// GET - do odczytu

export const GET = async () => {
    try {
        await connectToDB();

        //znajduje wszystkie prompty w bazie danych
        const participants = await Participant.find({})

        if(!participants) return new Response("Participants not found", { status: 404});


        return new Response(JSON.stringify(participants), {status: 200});
    } catch (error) {
        return new Response('Faild to fetch Participants', {status: 500});
    }
}