import { writable } from "svelte/store";

const dashboardState = writable({
    isAddSchoolModalOpen: false
})

export default dashboardState;