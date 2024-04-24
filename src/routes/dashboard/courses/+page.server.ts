import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { z } from "zod";
import { eq } from 'drizzle-orm';
import Program from '../../../models/program/program';
import User from '../../../models/user/user';
import Course from '../../../models/course/course';

export const load = (async (e) => {
    const pId = e.url.searchParams.get("programId");
    if (!pId) {
        const program = await e.locals.db.query.Program.findFirst({ columns: { id: true } });
        if (program)
            throw redirect(302, "?programId=" + program.id);
        return {
            error: "no_program"
        }
    }

    const lecturers = await e.locals.db.query.UserProfileLecturer.findMany({})

    if (lecturers.length === 0) return {
        error: "no_lecturer"
    }

    return {
        currentProgram: pId,
        lecturers,
        courses: (await e.locals.db.query.Course.findMany({
            with: {
                assignedTo: {
                    columns: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            where: ({ programId }, { eq }) => eq(programId, pId)
        })).map(s => ({
            ...s,
            assignedTo: s.assignedTo.firstName + " " + s.assignedTo.lastName
        })),


        programs: (await e.locals.db.query.Program.findMany({
            columns: {
                id: true,
                name: true
            },
        })),
    };
}) satisfies PageServerLoad;

const validationSchema = z.object({
    id: z.string({ required_error: "School ID is required" }),
    name: z.string({ required_error: "School Name is required" }),
    semester: z.number({ required_error: "Semester is required" }),
    year: z.number({ required_error: "Year is required" }),
    programId: z.string({ required_error: "Program ID is required" }),
    assignedToId: z.string({ required_error: "Assigned lecturer is required" }),
});

export const actions: Actions = {
    delete: async (e) => {
        const formData = await e.request.formData()
        const id = formData.get("id")?.toString();

        if (!id) return fail(404, {
            message: "No ID was attached"
        })

        try {
            await e.locals.db.delete(Course).where(eq(Course.id, id))
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
        const formData = await e.request.formData()

        const body = validationSchema.safeParse({
            name: formData.get("name"),
            id: formData.get("id"),
            semester: Number(formData.get("semester")),
            year: Number(formData.get("year")),
            programId: formData.get("programId"),
            assignedToId: formData.get("assignedToId"),
        })

        if (!body.success) return fail(404, {
            message: body.error.errors[0].message
        })

        try {
            const createdAt: number = Date.now();

            await e.locals.db.insert(Course).values({
                createdAt,
                assignedToId: body.data.assignedToId,
                id: body.data.id,
                name: body.data.name,
                programId: body.data.programId,
                semester: body.data.semester,
                year: body.data.year
            })

            const lecturer = await e.locals.db.query.UserProfileLecturer.findFirst({
                columns: {
                    firstName: true,
                    lastName: true,
                    userId: true
                },
                where: ({ employeeNumber }, { eq }) => eq(employeeNumber, body.data.assignedToId)
            })

            return (
                {
                    ...body.data,
                    assignedTo: lecturer?.firstName + " " + lecturer?.lastName,
                    createdAt
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