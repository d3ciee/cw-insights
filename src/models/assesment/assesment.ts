import { relations } from "drizzle-orm";
import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

import Course from "../course/course";

const Assesment = sqliteTable("assesment", {
    id: text("id").notNull().primaryKey(),
    weight: integer("weight").notNull(),
    name: text("name").notNull(),
    createdAt: integer("created_at").notNull(),
    courseId: text("course_id").notNull().references(() => Course.id, {
        onDelete: "no action"
    }),
    due: integer("due").notNull(),
    assignedAt: int("assigned_at").notNull()
})

const assesmentRelations = relations(Assesment, ({ many, one }) => ({
    course: one(Course, {
        references: [Course.programId],
        fields: [Assesment.courseId],
    }),
}))

export default Assesment;
export { assesmentRelations }
export type TAssesment = typeof Assesment.$inferSelect;