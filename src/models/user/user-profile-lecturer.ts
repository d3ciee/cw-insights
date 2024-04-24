import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import User from "./user";
import { relations } from "drizzle-orm";

const UserProfileLecturer = sqliteTable("user_profile_lecturer", {
    userId: text("id").notNull().primaryKey().references(() => User.id),
    employeeNumber: text("registration_number").notNull().unique(),
    firstName: text("f_name").notNull(),
    lastName: text("l_name").notNull(),
    personalEmail: text("personal_email").notNull(),
})

const userProfileLecturerRelations = relations(UserProfileLecturer, ({ one }) => ({
    user: one(User, {
        fields: [UserProfileLecturer.userId],
        references: [User.id]
    })
}))

export default UserProfileLecturer;
export { userProfileLecturerRelations }
export type TUserProfileLecturer = typeof UserProfileLecturer.$inferSelect;