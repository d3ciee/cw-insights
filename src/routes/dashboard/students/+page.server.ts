import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { z } from "zod";
import School from '../../../models/school/school';
import { eq } from 'drizzle-orm';
import { password, registrationNumber } from '$lib/validators';
import User from '../../../models/user/user';
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid"
import UserProfileLecturer from '../../../models/user/user-profile-lecturer';
import UserProfileStudent from '../../../models/user/user-profile-student';

export const load = (async (e) => {
    return {
        programs: await e.locals.db.query.Program.findMany({
            columns: {
                createdAt: false
            }
        }),
        students: await e.locals.db.query.UserProfileStudent.findMany({
            columns: {
                userId: false,
            }
        })
    };
}) satisfies PageServerLoad;

const validationSchema = z.object({
    registrationNumber: registrationNumber,
    firstName: z.string({ required_error: "First name is required" }),
    lastName: z.string({ required_error: "Last name is required" }),
    personalEmail: z.string({ required_error: "Email is required" }).email({ message: "Enter a valid email address" }),
    defaultPassword: password,
    programId: z.string({ required_error: "Last name is required" }),
    year: z.number({ required_error: "Year is required" }),
    semester: z.number({ required_error: "Semester is required" })
});

export const actions: Actions = {
    delete: async (e) => {
        const formData = await e.request.formData()
        const registrationNumber = formData.get("id")?.toString();

        if (!registrationNumber) return fail(404, {
            message: "No ID was attached"
        })

        try {
            await e.locals.db.delete(UserProfileStudent).where(eq(UserProfileStudent.registrationNumber, registrationNumber))
            return fail(500, {
                message: "A note to myself if im testing this in the future.  Since there is alot of nuance to deleting a lecturer e.g checking if they have any assigned roles etc, imma skip this and come back to it a bit later"
            })
        }
        catch (e: any) {
            console.log(e)
            if (e.code === "SQLITE_CONSTRAINT_FOREIGNKEY") return fail(400, {
                message: "To delete the lecturer, start by removing him from all the courses and positions assigned to them."
            })
            return fail(500, {
                message: "An internal error occured.  Try again"
            })
        }
    },

    create: async (e) => {
        const formData = await e.request.formData()

        const body = validationSchema.safeParse({
            registrationNumber: formData.get("registrationNumber"),
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            personalEmail: formData.get("personalEmail"),
            defaultPassword: formData.get("defaultPassword"),
            programId: formData.get("programId"),
            year: Number(formData.get("year")),
            semester: Number(formData.get("semester")),
        })

        if (!body.success) return fail(404, {
            message: body.error.errors[0].message
        })

        try {
            const passwordHash: string = await bcrypt.hash(body.data.defaultPassword, 10)
            const userId: string = uuid()
            const enrolledAt: number = Date.now()

            await e.locals.db.transaction(async (tx) => {
                await tx.insert(User).values({
                    createdAt: Date.now(),
                    email: body.data.registrationNumber + "@hit.ac.zw",
                    id: userId,
                    passwordHash,
                    role: "student"
                })
                await tx.insert(UserProfileStudent).values({
                    ...body.data,
                    enrolledAt,
                    userId
                })
            })

            return (
                {
                    ...body.data,
                    enrolledAt,
                }
            );
        }
        catch (e: any) {
            if (e.code === "SQLITE_CONSTRAINT_PRIMARYKEY") return fail(403, {
                message: "A student with that student id already exists"
            })
            if (e.message.includes("UNIQUE constraint failed: users.email")) return fail(403, {
                message: "A user with that registration number already exists"
            })
            if (e.message.includes("UNIQUE constraint failed: users.personal_email")) return fail(403, {
                message: "A user with that registration number already exists"
            })
            console.error(e);
            return fail(500, {
                message: "An internal error occured.  Please try again"
            })
        }
    }
}