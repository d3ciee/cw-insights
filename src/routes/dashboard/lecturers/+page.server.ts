import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { z } from "zod";
import School from '../../../models/school/school';
import { eq } from 'drizzle-orm';
import { password } from '$lib/validators';
import User from '../../../models/user/user';
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid"
import UserProfileLecturer from '../../../models/user/user-profile-lecturer';

export const load = (async (e) => {
    return {
        lecturers: await e.locals.db.query.UserProfileLecturer.findMany({
            columns: {
                userId: false
            }
        })
    };
}) satisfies PageServerLoad;

const validationSchema = z.object({
    employeeNumber: z.string({ required_error: "Employee number is required" }),
    firstName: z.string({ required_error: "First name is required" }),
    lastName: z.string({ required_error: "Last name is required" }),
    personalEmail: z.string({ required_error: "Email is required" }).email({ message: "Enter a valid email address" }),
    defaultPassword: password
});

export const actions: Actions = {
    delete: async (e) => {
        const formData = await e.request.formData()
        const employeeNumber = formData.get("id")?.toString();

        if (!employeeNumber) return fail(404, {
            message: "No ID was attached"
        })

        try {
            await e.locals.db.delete(UserProfileLecturer).where(eq(UserProfileLecturer.employeeNumber, employeeNumber))
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
            employeeNumber: formData.get("employeeNumber"),
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            personalEmail: formData.get("personalEmail"),
            defaultPassword: formData.get("defaultPassword")
        })

        if (!body.success) return fail(404, {
            message: body.error.errors[0].message
        })

        try {
            const passwordHash: string = await bcrypt.hash(body.data.defaultPassword, 10)
            const userId: string = uuid()

            await e.locals.db.transaction(async (tx) => {
                await tx.insert(User).values({
                    createdAt: Date.now(),
                    email: body.data.employeeNumber + "@hit.ac.zw",
                    id: userId,
                    passwordHash,
                    role: "lecturer"
                })
                await tx.insert(UserProfileLecturer).values({
                    employeeNumber: body.data.employeeNumber,
                    firstName: body.data.firstName,
                    lastName: body.data.lastName,
                    personalEmail: body.data.personalEmail,
                    userId
                })
            })

            return (
                {
                    ...body.data,
                }
            );
        }
        catch (e: any) {
            if (e.code === "SQLITE_CONSTRAINT_PRIMARYKEY") return fail(403, {
                message: "A lecturer with that employee id already exists"
            })
            console.error(e);
            return fail(500, {
                message: "An internal error occured.  Please try again"
            })
        }
    }
}