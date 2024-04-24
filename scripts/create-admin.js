import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { v4 as uuid } from "uuid"
import bcrypt from "bcryptjs"
import { sql } from "drizzle-orm"

const createAdmin = async () => {
    console.log("Creating admin with the credentials:")
    console.log("Email: admin@hit.ac.zw")
    console.log("Password: 4dmin@Hit")

    const db = new Database("./.data/local.sqlite");
    const passwordHash = bcrypt.hashSync("4dmin@Hit", 10)

    db.exec(`INSERT INTO user (createdAt, email, id, passwordHash, role) VALUES (${Date.now()}, "admin@hit.ac.zw", "${uuid()}", ${passwordHash}, "admin")`.toString())
    console.log("Admin created successfully")
}

createAdmin();