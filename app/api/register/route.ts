import bcrypt from "bcrypt";
import {prisma} from "@/prisma/prisma"
import { NextResponse } from "next/server";



export async function POST(req: Request) {
   try {
    const body = await req.json();
    const {email, password} = body.data;
    console.log(body.data);

    if(!email || !password) {
        return new NextResponse("Brakuje maila lub hasła", {status:400});
    }

    const exist = await prisma.user.findUnique({
        where: {
            email: email,
        }
    });

    if(exist) {
        return new NextResponse("Podany email jest wykorzystywany", { status: 400});
    }

   const hashedPassword = await bcrypt.hash(password, 10); 

   const user = await prisma.user.create({
        data: {
            email: email.toLowerCase(),
            password: hashedPassword
        }
   });

   return NextResponse.json(user)
  } catch (error: any) {
    return new Response(`${error.message}` ,{status : error.code})
  }
}