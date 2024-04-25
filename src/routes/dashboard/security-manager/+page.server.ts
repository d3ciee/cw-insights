import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { z } from "zod";
import { and, eq } from 'drizzle-orm';
import { v4 as uuid } from "uuid"
import Assesment from '../../../models/assesment/assesment';
import AssesmentMark from '../../../models/assesment/assesment-mark';
import UAParser from "ua-parser-js"
import UserSession from '../../../models/user/user-session';

type Session = {
    sessionId: string;
    user: {
        email: string;
        role: string;
        id: string;
    };
    ipAddress: string | null;
    loggedInAt: number;
    userAgent: UAParser.IResult
}

export const load = (async (e) => {

    const sessions: Session[] = (await e.locals.db.query.UserSession.findMany({
        with: {
            user: true
        }
    })).map((s) => {
        return {
            sessionId: s.id,
            user: {
                id: s.user.id!,
                email: s.user.email!,
                role: s.user.role!,
            },
            ipAddress: s.ipAddress,
            loggedInAt: s.createdAt,
            userAgent: new UAParser(s.userAgent ?? "").getResult()
        }
    })


    return {
        sessions
    };
}) satisfies PageServerLoad;


export const actions: Actions = {
    delete: async (e) => {
        const formData = await e.request.formData()
        const id = formData.get("sessionId")?.toString();

        if (!id) return fail(404, {
            message: "No ID was attached"
        })

        try {
            console.log(await e.locals.db.delete(UserSession).where(eq(UserSession.id, id)))
        }
        catch (e: any) {
            console.log(e)
            if (e.code === "SQLITE_CONSTRAINT_FOREIGNKEY") return fail(400, {
                message: "To delete the program, start by deleting all the courses and unenrolling/deleting all the students underneath it."
            })
            return fail(500, {
                message: "An internal error occured.  Try again"
            })
        }
    },

    create: async (e) => {
        const formData = await e.request.formData();

        const studentId: string = formData.get("studentId")?.toString() ?? "";
        const assesmentId: string = formData.get("assesmentId")?.toString() ?? "";

        const mark: number = Number(formData.get("mark"));
        if (!z.number().min(0).max(100).safeParse(mark).success) return fail(400, {
            message: "Mark needs to be an integer between 0 and 100"
        });

        console.log("mark", mark)
        try {
            const result = await e.locals.db.update(AssesmentMark).set({
                mark
            }).where(and(eq(AssesmentMark.assesmentId, assesmentId), eq(AssesmentMark.studentId, studentId)))

            if (result.changes === 0) {
                await e.locals.db.insert(AssesmentMark).values({
                    assesmentId,
                    id: uuid(),
                    mark,
                    studentId
                })
            }

            return (
                {
                    assesmentId,
                    mark,
                    studentId
                }
            );
        }
        catch (e: any) {
            if (e.code === "SQLITE_CONSTRAINT_PRIMARYKEY") return fail(403, {
                message: "A program with that id already exists"
            })
            if (e.code === "SQLITE_CONSTRAINT_FOREIGNKEY") return fail(403, {
                message: "The selected school doesnt exist"
            })
            console.error(e);
            return fail(500, {
                message: "An internal error occured.  Please try again"
            })
        }
    }
}