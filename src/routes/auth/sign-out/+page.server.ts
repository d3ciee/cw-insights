import { SESSION_COOKIE_NAME } from '$lib/consts';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (e) => {
    e.cookies.delete(SESSION_COOKIE_NAME, { path: '/' })
    throw redirect(302, '/auth/sign-in');
}) satisfies PageServerLoad;