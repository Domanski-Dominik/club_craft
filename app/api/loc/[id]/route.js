import { connectToDB } from "@utils/database";
import Loc from "@models/loc";

// GET - do odczytu

export const GET = async (request, { params }) => {
    try {
        await connectToDB();

        //znajduje wszystkie prompty w bazie danych
        const loc = await Loc.findById(params.id)

        if(!loc) return new Response("Loc not found", { status: 404});

        return new Response(JSON.stringify(loc), {status: 200});
    } catch (error) {
        return new Response('Faild to fetch Loc', {status: 500});
    }
}
// PATCH - do update'u danych
export const PATCH = async (request, { params }) => {
    const {name, adress, daysOfWeek} = await request.json();

    try {
        await connectToDB();

        const existingLoc = await Loc.findById(params.id);

        if(!existingLoc) return new Response("Loc not found", {status: 404});

        existingLoc.name = name;
        existingLoc.adress = adress;
        existingLoc.daysOfWeek = daysOfWeek;

        await existingLoc.save();

        return new Response(JSON.stringify(existingLoc), {status: 200});
    } catch (error) {
        return new Response("Failed to update Loc", {status: 500});
    }
}
// DELETE
export const DELETE = async (request, { params }) => {
    try {
        await connectToDB();

        await Loc.findByIdAndRemove(params.id)

        return new Response("Loc deleted successfully", { status: 200 });
    } catch (error) {
        return new Response("Failed to delete Loc", {status: 500});
    }
}