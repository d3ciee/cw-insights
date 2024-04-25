import { redirect } from '@sveltejs/kit';
import type { TUser } from '../../models/user/user';
import type { LayoutServerLoad } from './$types';


export const load = (async (e) => {
    if (!e.locals.user) throw redirect(302, "/auth/sign-in");

    const dashboardViews = new Map<TUser["role"], DashboardView[]>()
        .set("admin", [
            { label: "Overview", path: "overview" },
            { label: "Schools", path: "schools" },
            { label: "Programs", path: "programs" },
            { label: "Lecturers", path: "lecturers" },
            { label: "Students", path: "students" },
            { label: "Security manager", path: "security-manager" }
        ])
        .set("hod", [
            { label: "Courses", path: "courses" },
            { label: "Assesments", path: "assesments" },
            { label: "Marks", path: "marks" },

        ])
        .set("lecturer", [
            { label: "Assesments", path: "assesments" },
            { label: "Marks", path: "marks" },

        ])
        .set("student", [
            { label: "My marks", path: "my-marks" },
        ])

    const userRole: TUser["role"] = e.locals.user.role;
    console.log(userRole)
    const availableViews = dashboardViews.get(userRole);

    const currentDashboardView: string = e.url.pathname.split("/")[2];

    //@ts-ignore
    if (!availableViews.find(v => v.path === currentDashboardView)) {
        //@ts-ignore
        throw redirect(302, `/dashboard/${availableViews[0].path}`);
    }
    return {
        user: e.locals.user,
        availableViews,
    };
}) satisfies LayoutServerLoad;