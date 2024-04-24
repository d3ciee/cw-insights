import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"

const User = sqliteTable("users",{
    id:text("id").notNull().primaryKey(),
    role:text("role", {enum:["admin","hod","lecturer", "student"]}),
    email:text("email").notNull().unique(),
    passwordHash:text("password_hash").notNull(),
    createdAt:int("created_at").notNull(),
})

export default User;
export type TUser = typeof User.$inferSelect;