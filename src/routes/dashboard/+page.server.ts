import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (e) => {
    if (e.locals.user) {
        if (e.locals.user.role === "admin")
            throw redirect(302, "/dashboard/overview")
        if (e.locals.user.role === "hod")
            throw redirect(302, "/dashboard/courses")
    }
}) satisfies PageServerLoad;