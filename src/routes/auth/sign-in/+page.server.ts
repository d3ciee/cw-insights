import { hitEmail } from "$lib/validators";
import { fail, redirect, type Load } from "@sveltejs/kit";
import { v4 as uuid } from "uuid";
import type { Actions, RequestEvent } from "./$types";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { SESSION_COOKIE_NAME, SESSION_EXPIRES_IN } from "$lib/consts";
import { dev } from "$app/environment";
import UserSession from "../../../models/user/user-session";

export const load = (async (e) => {
    if (e.locals.session) throw redirect(302, "/dashboard")
})


const validationSchema = z.object({
    email: hitEmail,
    password: z.string({ required_error: "A password is required" })
});

export const actions: Actions = {
    default: async (e) => {
        const formData = await e.request.formData()

        const body = validationSchema.safeParse({
            email: formData.get("email"),
            password: formData.get("password")
        })

        if (!body.success) return fail(404, {
            message: body.error.errors[0].message
        })

        try {
            const user = await e.locals.db.query.User.findFirst({
                where: ({ email }, { eq }) => eq(email, body.data.email),
                columns: {
                    passwordHash: true,
                    id: true
                }
            })
            if (!user || !bcrypt.compareSync(body.data.password, user.passwordHash)) return fail(404, {
                message: "Email or password incorrect"
            })

            await createSession(user.id, e)
        }
        catch (e) {
            console.error(e);
            return fail(500, {
                message: "An unexpected error has occured."
            })
        }


        throw redirect(302, "/dashboard")
    }
};

const createSession = async (userId: string, e: RequestEvent) => {
    const sessionId = uuid();
    const session = await e.locals.db.insert(UserSession).values({
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_EXPIRES_IN,
        id: sessionId,
        userId,
        userAgent: e.request.headers.get("user-agent"),
        ipAddress: e.getClientAddress()
    })
    e.cookies.set(SESSION_COOKIE_NAME, sessionId, {
        path: "/",
        httpOnly: true,
        secure: !dev,
        maxAge: SESSION_EXPIRES_IN,
    })
}