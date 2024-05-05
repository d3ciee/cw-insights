import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"

import UserProfileLecturer from "../user/user-profile-lecturer";
import Program from "../program/program";

const Course = sqliteTable("courses", {
    id: text("id").notNull().primaryKey(),
    name: text("name").notNull(),
    createdAt: int("created_at").notNull(),
    semester: int("semester").notNull(),
    year: int("year").notNull(),
    programId: text("program").notNull().references(() => Program.id, {
        onDelete: "no action"
    }),
    assignedToId: text("assigned_to_id").notNull().references(() => UserProfileLecturer.employeeNumber, {
        onDelete: "no action"
    })
})

const courseRelations = relations(Course, ({ many, one }) => ({
    school: one(Program, {
        fields: [Course.programId],
        references: [Program.id],
    }),
    assignedTo: one(UserProfileLecturer, {
        fields: [Course.assignedToId],
        references: [UserProfileLecturer.employeeNumber]
    })
}))

export default Course;
export { courseRelations }
export type TCourse = typeof Course.$inferSelect;


