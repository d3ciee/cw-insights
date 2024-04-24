import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import User from "./user";
import { relations } from "drizzle-orm";
import Program from "../program/program";
import AssesmentMark from "../assesment/assesment-mark";

const UserProfileStudent = sqliteTable("user_profile_students", {
    userId: text("id").notNull().unique().references(() => User.id, {
        onDelete: "cascade",

    }),
    registrationNumber: text("registration_number").notNull().primaryKey(),
    firstName: text("f_name").notNull(),
    lastName: text("l_name").notNull(),
    programId: text("program_id").notNull(),
    enrolledAt: integer("enrolled_at").notNull(),
    personalEmail: text("personal_email").notNull(),
    year: integer("year").notNull(),
    semester: integer("semester").notNull()
})

const userProfileStudentRelations = relations(UserProfileStudent, ({ one, many }) => ({
    program: one(Program, {
        fields: [UserProfileStudent.programId],
        references: [Program.id],
        relationName: "program_student"
    }),
    marks: many(AssesmentMark)
}))

export default UserProfileStudent;
export { userProfileStudentRelations }
export type TUserProfileStudent = typeof UserProfileStudent.$inferSelect;