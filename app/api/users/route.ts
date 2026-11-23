import UserRegistrationRequestSchema from "@/dto/userRegistrationRequest";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest){
    
    try {
        const body = await req.json()

        //safe validate and print error

        const validatedBody = UserRegistrationRequestSchema.safeParse(body)

    

        if(!validatedBody.success){

            return NextResponse.json(
                {
                    message :  validatedBody.error.issues[0].message
                },
                {
                    status : 400
                }
            )

        }




        const existingUser = await prisma.user.findFirst(
            {
                where : {
                    email : body.email
                }
            }
        )

        if(existingUser != null){

            return NextResponse.json(
                {
                    message : "User already exists"
                },
                {
                    status : 400
                }
            )

        }

        const passwordHash = await bcrypt.hash(body.password, 12)

        await prisma.user.create(
            {
                data : {
                    firstName : body.firstName,
                    lastName : body.lastName,
                    email : body.email,
                    password : passwordHash
                }
            }
        )

        return NextResponse.json(
            {
                message : "User created successfully"
            }
        )

    }catch (error) {

        console.log(error)

        return NextResponse.json(
            {
                message : "Error creating user"
            },
            {
                status : 500
            }
        )

    }
    
}