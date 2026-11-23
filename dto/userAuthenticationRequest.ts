import z from "zod"

const UserAuthenticationRequestSchema = z.object(
    {
        email : z.email({
            error : "Invalid email address"
        }),
        password : z.string(
            {
                error : "Invalid password"
            }
        ).min(1, {
            error : "Please provide a password"
        })
    }
)

export default UserAuthenticationRequestSchema