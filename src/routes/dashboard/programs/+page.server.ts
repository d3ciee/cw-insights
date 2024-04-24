import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { z } from "zod";
import School from '../../../models/school/school';
import { eq } from 'drizzle-orm';
import Program from '../../../models/program/program';
import UserProfileLecturer from '../../../models/user/user-profile-lecturer';
import User from '../../../models/user/user';

export const load = (async (e) => {
    const sId = e.url.searchParams.get("schoolId");
    if (!sId) {
        const school = await e.locals.db.query.School.findFirst({ columns: { id: true } });
        if (school)
            throw redirect(302, "?schoolId=" + school.id);
        return {
            error: "no_school"
        }
    }

    const lecturers = await e.locals.db.query.UserProfileLecturer.findMany({})

    if (lecturers.length === 0) return {
        error: "no_lecturer"
    }

    return {
        currentSchool: sId,
        lecturers,


        programs: (await e.locals.db.query.Program.findMany({
            with: {
                headOfDepartment: {
                    columns: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            where: ({ schoolId }, { eq }) => eq(schoolId, sId)
        })).map(s => ({
            ...s,
            numberOfStudents: 0,
            headOfDepartment: s.headOfDepartment.firstName + " " + s.headOfDepartment.lastName,
            numberOfCourses: 0
        })),
        schools: (await e.locals.db.query.School.findMany({
            columns: {
                id: true,
                name: true
            }
        }))
    };
}) satisfies PageServerLoad;

const validationSchema = z.object({
    id: z.string({ required_error: "School ID is required" }),
    name: z.string({ required_error: "School Name is required" }),
    school: z.string({ required_error: "School is required" }),
    numberOfYears: z.number({ required_error: "Number of years is required" }),
    headOfDepartment: z.string({ required_error: "Head of department is required" })
});

export const actions: Actions = {
    delete: async (e) => {
        const formData = await e.request.formData()
        const id = formData.get("id")?.toString();

        if (!id) return fail(404, {
            message: "No ID was attached"
        })

        try {
            await e.locals.db.delete(Program).where(eq(Program.id, id))
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
            school: formData.get("school"),
            numberOfYears: Number(formData.get("numberOfYears")),
            headOfDepartment: formData.get("headOfDepartment"),
            id: formData.get("id")
        })

        if (!body.success) return fail(404, {
            message: body.error.errors[0].message
        })

        try {
            const createdAt: number = Date.now();

            await e.locals.db.insert(Program).values({
                id: body.data.id,
                name: body.data.name,
                numberOfYears: body.data.numberOfYears,
                schoolId: body.data.school,
                headOfDepartment: body.data.headOfDepartment,
                createdAt
            })

            const lecturer = await e.locals.db.query.UserProfileLecturer.findFirst({
                columns: {
                    firstName: true,
                    lastName: true,
                    userId: true
                },
                where: ({ employeeNumber }, { eq }) => eq(employeeNumber, body.data.headOfDepartment)
            })
            await e.locals.db.update(User).set({
                role: "hod"
            }).where(eq(User.id, (lecturer as any)?.userId))

            return (
                {
                    ...body.data,
                    headOfDepartment: lecturer?.firstName + " " + lecturer?.lastName,
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