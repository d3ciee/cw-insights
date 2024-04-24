import initializeDB from "$lib/config/db";
import { SESSION_COOKIE_NAME } from "$lib/consts";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const useAuth: Handle = async ({ event, resolve }) => {

	let user: App.Locals["user"] = null;
	let session: App.Locals["session"] = null;

	const sessionId = event.cookies.get(SESSION_COOKIE_NAME);

	session = sessionId ? (await event.locals.db.query.UserSession.findFirst({
		where: ({ id }, { eq }) => eq(id, sessionId)
	})) ?? null : null

	user = session?.userId ? await event.locals.db.query.User.findFirst({
		columns: {
			passwordHash: false
		},
		where: ({ id }, { eq }) => eq(id, session.userId)
	}) ?? null : null

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
}

const useDatabase: Handle = async ({ event, resolve }) => {
	event.locals.db = await initializeDB();
	return resolve(event);
};

export const handle: Handle = sequence(
	useDatabase,
	useAuth
)