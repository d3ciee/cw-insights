import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { z } from "zod";
import School from '../../../models/school/school';
import { eq } from 'drizzle-orm';

export const load = (async (e) => {
    return {
        schools: (await e.locals.db.query.School.findMany({
            with: {
                programs: {
                    with: {
                        students: {
                            columns: {
                                registrationNumber: true
                            }
                        }
                    },
                    columns: {
                        id: true
                    }
                }
            }
        })).map(s => ({
            id: s.id,
            name: s.name,
            createdAt: s.createdAt,
            numberOfPrograms: s.programs.length,
            numberOfStudents: s.programs.map(p => p.students.length).concat(0).reduce((x, y) => x + y)
        })
        )
    };
}) satisfies PageServerLoad;

const validationSchema = z.object({
    id: z.string({ required_error: "School ID is required" }),
    name: z.string({ required_error: "School Name is required" })
});

export const actions: Actions = {
    delete: async (e) => {
        const formData = await e.request.formData()
        const id = formData.get("id")?.toString();

        if (!id) return fail(404, {
            message: "No ID was attached"
        })

        try {
            await e.locals.db.delete(School).where(eq(School.id, id))
        }
        catch (e: any) {
            console.log(e)
            if (e.code === "SQLITE_CONSTRAINT_FOREIGNKEY") return fail(400, {
                message: "To delete the school, start by deleting all the programs underneath it."
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
            id: formData.get("id")
        })

        if (!body.success) return fail(404, {
            message: body.error.errors[0].message
        })

        try {
            const createdAt: number = Date.now();

            await e.locals.db.insert(School).values({
                ...body.data,
                createdAt
            })

            return (
                {
                    ...body.data,
                    createdAt
                }
            );
        }
        catch (e: any) {
            if (e.code === "SQLITE_CONSTRAINT_PRIMARYKEY") return fail(403, {
                message: "A school with that id already exists"
            })
            console.error(e);
            return fail(500, {
                message: "An internal error occured.  Please try again"
            })
        }
    }
}