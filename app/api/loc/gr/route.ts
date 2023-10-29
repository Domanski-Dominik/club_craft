import { prisma } from "@/prisma/prisma";


export const POST = async (req:Request) => {

    const { name,dayOfWeek, timeS, timeE, locationId } = await req.json();
    const locationIdNum = parseInt(locationId, 10)
    console.log(name,dayOfWeek, timeS, timeE, locationIdNum)
    try {
        const findLoc = await prisma.locations.findUnique({
            where:{id:locationIdNum}
           });

            if(!findLoc){
                return new Response("Nie znaleziono lokalizacji:", {status:404})
            }

        const newGroup = await prisma.group.create({
            data: {
                name: String(name),
                dayOfWeek: Number(dayOfWeek),
                timeS: String(timeS),
                timeE: String(timeE),
              },
        })
        if(!newGroup){
            return new Response("Nie udało się utworzyć grupy", {status:500})
        }
        const newSchedule = await prisma.locationSchedule.create({
            data:{
                location: {
                    connect: { id: locationIdNum }
                },
                group: {
                    connect: { id: newGroup.id }
                },
        }});
        if(!newSchedule){
            return new Response("Nie udało się dodać harmonogramu do lokalizacji", {status:500})
        }
        return new Response(JSON.stringify(newGroup), {status:200})
    } catch (error) {
        console.error('Error creating new group: ', error);
        return new Response("Nie udało się dodać grupy do lokalizacji", {status:500})
    }
    
}
export const DELETE = async (req:Request) => {
    const { id } = await req.json();
        console.log('Id grupy to '+ id)
    try {
        if (id !== null && id !== undefined) {
        const deleteSchedule = await prisma.locationSchedule.deleteMany({
            where:{group: {id: id}},
        });

        if(!deleteSchedule){
            return new Response("Nie udało się usunąć relacji z lokalizacją:", {status:404})
        }

        const deleteGroup = await prisma.group.delete({
            where:{id: id}         
        });

        if(!deleteGroup){
            return new Response("Nie udało się usunąć grupy", {status:500})
        }

        return new Response(JSON.stringify(deleteGroup), { status: 200 });
        } else { 
            return new Response("Błąd podczas usuwania grupy id undefined lub null", {status:500})
        }
    } catch (error) {
        console.error('Błąd podczas usuwania grupy:', error);
        return new Response("Błąd podczas usuwania grupy", {status:500})
    }
}
