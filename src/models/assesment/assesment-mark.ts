import { relations } from "drizzle-orm";
import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import UserProfileStudent from "../user/user-profile-student";
import Assesment from "./assesment";

const AssesmentMark = sqliteTable("assesment_mark", {
    id: text("id").notNull().primaryKey(),
    studentId: text("student_mark").notNull().references(() => UserProfileStudent.registrationNumber),
    assesmentId: text("assesment_mark").notNull().references(() => Assesment.id),
    mark: integer("mark").notNull(),
})

const assesmentMarkRelations = relations(AssesmentMark, ({ many, one }) => ({
    student: one(UserProfileStudent, {
        references: [UserProfileStudent.registrationNumber],
        fields: [AssesmentMark.studentId]
    }),
    assesment: one(Assesment, {
        references: [Assesment.id],
        fields: [AssesmentMark.assesmentId]
    }),

}))

export default AssesmentMark;
export { assesmentMarkRelations }
export type TAssesment = typeof Assesment.$inferSelect;