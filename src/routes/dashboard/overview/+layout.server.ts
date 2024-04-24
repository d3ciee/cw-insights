import { count } from 'drizzle-orm';
import School from '../../../models/school/school';
import type { LayoutServerLoad } from './$types';
import Program from '../../../models/program/program';
import UserProfileLecturer from '../../../models/user/user-profile-lecturer';
import UserProfileStudent from '../../../models/user/user-profile-student';

export const load = (async (e) => {
    return {
        totals: {
            schools: (await e.locals.db.select({ count: count() }).from(School))[0].count,
            programs: (await e.locals.db.select({ count: count() }).from(Program))[0].count,
            lecturers: (await e.locals.db.select({ count: count() }).from(UserProfileLecturer))[0].count,
            students: (await e.locals.db.select({ count: count() }).from(UserProfileStudent))[0].count,
        }
    };
}) satisfies LayoutServerLoad;