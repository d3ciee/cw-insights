// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	type DashboardView = {
		label: string;
		path: string;
	}
	namespace App {
		interface Locals {
			db: import('$lib/config/db').DB;
			user: Omit<import('$lib/models/user/user').TUser, "passwordHash"> | null;
			session: import("$lib/models/user/user-session").TUserSession | null
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
