import { z } from "zod";

const hitEmail = z.string({ required_error: "An email is required" }).email({ message: "Invalid email address" }).refine((s) => s.includes("hit.ac.zw"), { message: "Email must be a valid HIT email address" });
const password = z.string({ required_error: "Password is required" }).min(8, { message: "Password minimum length is 7" }).max(60, { message: "Password maximum length is 60" })
const registrationNumber = z.string({ required_error: "Registration number is required" }).refine((s) => s.includes("H"), { message: "Registration number must be a valid H registration number" });

export {
    hitEmail,
    password,
    registrationNumber
}