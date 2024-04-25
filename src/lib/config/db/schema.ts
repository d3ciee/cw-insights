import User from "../../../models/user/user";
import UserSession, { userSessionRelations } from "../../../models/user/user-session";
import School, { schoolRelations } from "../../../models/school/school";
import Program, { programRelations } from "../../../models/program/program";
import UserProfileStudent, { userProfileStudentRelations } from "../../../models/user/user-profile-student";
import UserProfileLecturer, { userProfileLecturerRelations } from "../../../models/user/user-profile-lecturer";
import Course, { courseRelations } from "../../../models/course/course";
import Assesment, { assesmentRelations } from "../../../models/assesment/assesment";
import AssesmentMark, { assesmentMarkRelations } from "../../../models/assesment/assesment-mark";

export {
    User,
    UserSession,
    UserProfileStudent,
    School,
    UserProfileLecturer,
    userProfileStudentRelations,
    userProfileLecturerRelations,
    assesmentMarkRelations,
    userSessionRelations,
    assesmentRelations,
    Assesment,
    AssesmentMark,
    Program,
    Course,
    courseRelations,
    programRelations,
    schoolRelations
}