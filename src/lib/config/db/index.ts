import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"

import * as schema from "./schema"

const initializeDB = async () => {
    const client = new Database("./.data/local.sqlite")

    const db = drizzle(client, { schema })
    return db
}

export default initializeDB;
export type DB = Awaited<ReturnType<typeof initializeDB>>