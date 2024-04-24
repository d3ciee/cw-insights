import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"
import UserProfileStudent from "../user/user-profile-student";
import School from "../school/school";
import UserProfileLecturer from "../user/user-profile-lecturer";

const Program = sqliteTable("programs", {
    id: text("id").notNull().primaryKey(),
    name: text("name").notNull(),
    createdAt: int("created_at").notNull(),
    numberOfYears: int("number_of_years").notNull(),
    schoolId: text("school_id").notNull().references(() => School.id),
    headOfDepartment: text("head_of_department").notNull().references(() => UserProfileLecturer.employeeNumber)
})

const programRelations = relations(Program, ({ many, one }) => ({
    students: many(UserProfileStudent, { relationName: "program_student" }),
    school: one(School, {
        fields: [Program.schoolId],
        references: [School.id],
        relationName: "program_school"
    }),
    headOfDepartment: one(UserProfileLecturer, {
        fields: [Program.headOfDepartment],
        references: [UserProfileLecturer.employeeNumber]
    })
}))

export default Program;
export { programRelations }
export type TProgram = typeof Program.$inferSelect;