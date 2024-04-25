import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import User from './user';
import { relations } from 'drizzle-orm';

const UserSession = sqliteTable('user_sessions', {
    id: text('id').notNull().primaryKey(),
    userId: text('user_id').notNull(),
    expiresAt: integer('expires_at').notNull(),
    createdAt: integer('created_at').notNull(),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address')
});

const userSessionRelations = relations(UserSession, ({ one }) => ({
    user: one(User, {
        references: [User.id],
        fields: [UserSession.userId]
    })
}))

export default UserSession;
export { userSessionRelations }
export type TUserSession = typeof UserSession.$inferSelect;