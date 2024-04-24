import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { z } from "zod";
import { and, eq } from 'drizzle-orm';
import Course from '../../../models/course/course';
import { BodyRow } from 'svelte-headless-table';
import { v4 as uuid } from "uuid"
import Assesment from '../../../models/assesment/assesment';
import AssesmentMark from '../../../models/assesment/assesment-mark';

export const load = (async (e) => {

    if (e.locals.user === null) throw error(400, "not_logged_in");

    const lecttProfile = await e.locals.db.query.UserProfileLecturer.findFirst({
        where: ({ userId }, { eq }) => eq(userId, e.locals.user?.id ?? "")
    })

    if (!lecttProfile) throw error(400, "user_doesnt_have_permission");



    const cId = e.url.searchParams.get("courseId");
    if (!cId) {
        const course = await e.locals.db.query.Course.findFirst({
            where: ({ assignedToId }, { eq }) => eq(assignedToId, lecttProfile.employeeNumber),
            columns: { id: true }
        });
        if (course)
            throw redirect(302, "?courseId=" + course.id);
        return {
            error: "no_course"
        }
    }

    const assignedCourses = await e.locals.db.query.Course.findMany({
        columns: {
            id: true,
            name: true
        },
        where: ({ assignedToId }, { eq }) => eq(assignedToId, lecttProfile.employeeNumber),

    })
    const lecturers = await e.locals.db.query.UserProfileLecturer.findMany({})

    if (lecturers.length === 0) return {
        error: "no_lecturer"
    }

    const assesments = await e.locals.db.query.Assesment.findMany({
        where: ({ courseId }, { eq }) => eq(courseId, cId)
    })

    const _course = await e.locals.db.query.Course.findFirst({
        where: ({ id }, { eq }) => eq(id, cId)
    })

    const studentsWithAssesmentMarks = (await e.locals.db.query.UserProfileStudent.findMany({
        where: ({ programId }, { eq }) => eq(programId, _course?.programId ?? ""),
        with: {
            marks: {
                where: ({ assesmentId }, { eq, inArray }) => inArray(assesmentId, assesments.map((a) => a.id))
            }
        }
    })).map((s) => {
        return {
            ...s,
            assesments: Object.fromEntries(assesments.map(a => {
                const mark: number = s.marks.find(m => m.assesmentId === a.id)?.mark ?? 0;
                return [a.id, {
                    mark,
                    ...a
                }]
            })),
            total: (s.marks.map((sm) => {
                const totalWeights = assesments.map(({ weight }) => weight).concat(0).reduce((x, y) => x + y);
                const weight = assesments.find((a) => a.id === sm.assesmentId)?.weight ?? 0;
                return sm.mark / 100 * weight / totalWeights;
            }).concat(0).reduce((x, y) => x + y) * 100).toFixed(1)
        }
    })

    console.log(studentsWithAssesmentMarks)

    return {
        currentCourse: cId,
        assesments,
        studentsWithAssesmentMarks,
        lecturers,
        assignedCourses,
        programs: (await e.locals.db.query.Program.findMany({
            columns: {
                id: true,
                name: true
            },
        })),
    };
}) satisfies PageServerLoad;

const validationSchema = z.object({
    courseId: z.string({ required_error: "Course is required" }),
    assignedAt: z.number({ required_error: "Assigned time is required" }),
    due: z.number({ required_error: "Due time is required" }),
    name: z.string({ required_error: "Assignment name is required" }),
    weight: z.number({ required_error: "Course weight is required" }),
});

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