import Database from "better-sqlite3";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";

const createAdmin = async () => {
    console.log("Creating admin with the credentials:");
    console.log("Email: admin@hit.ac.zw");
    console.log("Password: 4dmin@Hit");

    const db = new Database("./.data/local.sqlite");
    const passwordHash = bcrypt.hashSync("4dmin@Hit", 10);

    const email = "admin@hit.ac.zw";
    const createdAt = Date.now();
    const userId = uuid();

    const query = `INSERT INTO users (created_at, email, id, password_hash, role) 
                   VALUES (?, ?, ?, ?, ?)`;

    db.prepare(query).run(createdAt, email, userId, passwordHash, "admin");

    console.log("Admin created successfully");
};

createAdmin();
