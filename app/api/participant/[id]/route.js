import { connectToDB } from "@utils/database";
import Participant from "@models/participant";

// GET - do odczytu

export const GET = async (request, { params }) => {
    try {
        await connectToDB();

        //znajduje wszystkie prompty w bazie danych
        const participant = await Participant.findById(params.id)

        if(!participant) return new Response("Participant not found", { status: 404});

        return new Response(JSON.stringify(participant), {status: 200});
    } catch (error) {
        return new Response('Faild to fetch Participant', {status: 500});
    }
}
// PATCH - do update'u danych
export const PATCH = async (request, { params }) => {
    const { name,surname,gr,tel,email,note,payments } = await request.json();
    console.log(name,surname,gr,tel,email,note,payments )
    try {
        await connectToDB();

        const existingParticipant = await Participant.findById(params.id);

        if(!existingParticipant) return new Response("Participant not found", {status: 404});
        if(name !== undefined){
            existingParticipant.name = name;
        }
        if(surname !== undefined){
            existingParticipant.surname = surname;
        }
        if(gr !== undefined){
            existingParticipant.gr = gr;
        }
        if(tel !== undefined){
            existingParticipant.tel = tel;
        }
        if(email !== undefined){
            existingParticipant.email = email;
        }
        if(note !== undefined){
            existingParticipant.note = note;
        }
        if(payments !== undefined){
            existingParticipant.payments = payments;
        }
        console.log(existingParticipant);
        await existingParticipant.save();

        return new Response(JSON.stringify(existingParticipant), {status: 200});
    } catch (error) {
        return new Response("Failed to update Participant", {status: 500});
    }
}
// DELETE
export const DELETE = async (request, { params }) => {
    try {
        await connectToDB();

        await Participant.findByIdAndRemove(params.id)

        return new Response("Participant deleted successfully", { status: 200 });
    } catch (error) {
        return new Response("Failed to delete Participant", {status: 500});
    }
}
