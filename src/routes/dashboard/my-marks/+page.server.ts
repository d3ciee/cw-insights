import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { z } from "zod";
import { and, eq } from 'drizzle-orm';
import { v4 as uuid } from "uuid"
import Assesment from '../../../models/assesment/assesment';
import AssesmentMark from '../../../models/assesment/assesment-mark';

type CourseworkMarks = {
    id: string;
    name: string;
    lecturer: string;
    classAvarage: string;
    total: string;
    programId: string;
    marks: {
        assesmentName: string;
        mark: number;
    }[]
}

export const load = (async (e) => {

    const studentProfile = await e.locals.db.query.UserProfileStudent.findFirst({
        where: ({ userId }, { eq }) => eq(userId, e.locals.user?.id ?? "")
    })

    const courseworkMarks = await Promise.all((await e.locals.db.query.Course.findMany({
        where: ({ programId }, { eq }) => eq(programId, studentProfile?.programId ?? ""),
        with: {
            assignedTo: {
                columns: {
                    lastName: true,
                    firstName: true
                }
            },
        },
        columns: {
            id: true,
            name: true,
            programId: true
        }
    }
    )).map(async (c) => {
        const courseAssesments = await e.locals.db.query.Assesment.findMany({
            where: ({ courseId }, { eq }) => eq(courseId, c.id)
        })

        const totalWeight = courseAssesments.map((a) => a.weight).reduce((x, y) => x + y, 0)

        const totalStudentsInCourse = (await e.locals.db.query.UserProfileStudent.findMany({
            where: ({ programId }, { eq }) => eq(programId, c.programId),
            columns: {
                registrationNumber: true
            }
        })).length

        const classAvarage = ((await e.locals.db.query.AssesmentMark.findMany({
            with: {
                assesment: {
                    columns: {
                        weight: true
                    }
                }
            },
            where: ({ assesmentId }, { inArray }) => inArray(assesmentId, courseAssesments.map((a) => a.id).concat("_ID"))
        })).map((m) => {
            return m.mark / 100 * m.assesment.weight / totalWeight
        }).reduce((x, y) => x + y, 0) * 100) / totalStudentsInCourse

        let marks: { mark: number, name: string }[] = [];

        const total = (await e.locals.db.query.AssesmentMark.findMany({
            with: {
                assesment: {
                    columns: {
                        weight: true,
                        name: true,
                    }
                }
            },
            where: ({ assesmentId, studentId }, { inArray, and, eq }) => and(eq(studentId, studentProfile?.registrationNumber ?? ""), inArray(assesmentId, courseAssesments.map((a) => a.id).concat("_ID")))
        })).map((m) => {
            marks.push({
                mark: m.mark,
                name: m.assesment.name
            });
            return m.mark / 100 * m.assesment.weight / totalWeight
        }).reduce((x, y) => x + y, 0) * 100


        return {
            id: c.id,
            name: c.name,
            classAvarage,
            lecturer: c.assignedTo?.firstName + " " + c.assignedTo?.lastName,
            total,
            programId: c.programId,
            marks: marks
        }
    })
    )

    console.log("cwMarks", courseworkMarks)

    if (e.locals.user === null) throw error(400, "not_logged_in");

    const lecturers = await e.locals.db.query.UserProfileLecturer.findMany({})

    if (lecturers.length === 0) return {
        error: "no_lecturer"
    }

    return {
        courseworkMarks
    };
}) satisfies PageServerLoad;


export const actions: Actions = {
    delete: async (e) => {
        const formData = await e.request.formData()
        const id = formData.get("id")?.toString();

        if (!id) return fail(404, {
            message: "No ID was attached"
        })

        try {
            await e.locals.db.delete(Assesment).where(eq(Assesment.id, id))
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