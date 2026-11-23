import { Status } from "@/app/generated/prisma/enums";
import UserAuthenticationRequestSchema from "@/dto/userAuthenticationRequest";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose"

export async function POST(request: NextRequest) {

    

    try {

        const body = await request.json()

        const parsedBody = UserAuthenticationRequestSchema.safeParse(body)

        if(!parsedBody.success){

            return NextResponse.json(
                {
                    message : parsedBody.error.issues[0].message
                },
                {
                    status : 400
                }
            )
        }

        const user = await prisma.user.findFirst(
            {
                where : {
                    email : body.email
                }
            }
        )

        if(user == null){

            return NextResponse.json(
                {
                    message : "User not found"
                },
                {
                    status : 404
                }
            )
        }

        if(user.status != Status.ACTIVE){
            return NextResponse.json(
                {
                    message : "Your account is locked or deleted. Please contact support for assistance."
                },
                {
                    status : 403
                }
            )
        }

        const isPasswordValid = await compare(body.password, user.password)

        if(!isPasswordValid){
            return NextResponse.json(
                {
                    message : "Invalid password"
                },
                {
                    status : 401
                }
            )
        }

        const userInformation = {
            id : user.id,
            email : user.email,
            firstName : user.firstName,
            lastName : user.lastName,
            role : user.role,
            image : user.image,
            permissions : user.permissions
        }

        const signature = process.env.JOSE_JWT_SECRET

        const signatureEncoded = new TextEncoder().encode(signature)

        const token = await new jose.SignJWT(userInformation).setProtectedHeader({alg : "HS256"}).setExpirationTime("48h").sign(signatureEncoded)

        const response =  NextResponse.json(
            {
                message : "You logged in successfully"
            },
            {
                status : 200
            }
        )

        response.cookies.set(
            {
                name : "auth-token",
                value : token,
                httpOnly : true,
                secure : false,
                sameSite : "lax",
                maxAge : 60 * 60 * 24 * 2, // 2 days
            }
        )

        return response


    }catch (error) {

        return NextResponse.json(
            {
                message : "Error authenticating user"
            },
            {
                status : 500
            }
        )

    }


}