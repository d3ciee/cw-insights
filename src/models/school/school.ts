import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"
import Program from "../program/program";
import UserProfileStudent from "../user/user-profile-student";

const School = sqliteTable("schools", {
    id: text("id").notNull().primaryKey(),
    name: text("name").notNull(),
    createdAt: int("created_at").notNull(),
})

const schoolRelations = relations(School, ({ one, many }) => ({
    programs: many(Program, { relationName: "program_school" }),
}))

export default School;
export { schoolRelations }
export type TSchool = typeof School.$inferSelect;