import { Router } from "express";
import { createClass ,
     updateClass,
      updateThumbnail,
       joinClass,
        leaveClass,
        acceptJoinInvitation,
        rejectJoinInvitation,
        getAllClassesForStudent,
        getMyClassesForStudent,
        getMyClassesForMentor,
        getAllMentorsForStudent,
        removeStudentFromClass,
        getMyClassDashboardStudent,
        getMyClassDashboardMentor,
        viewAllJoinInvitation,
        getStudentsHavingDoubts,
        deleteClass
} from "../controllers/class.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isMentor } from "../middlewares/isMentor.middleware.js";
import { isClassOwner } from "../middlewares/isClassOwner.middleware.js";
import { isStudent } from "../middlewares/isStudent.middleware.js";

const router = Router()

// Mentor Routes
router.route("/create").post(
    verifyJWT,
    isMentor,
    upload.fields([
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    createClass
)

router.route("/update").patch(
    verifyJWT,
    isClassOwner,
    updateClass
)

router.route("/delete").delete(
    verifyJWT,
    deleteClass
)

router.route("/update-thumbnail").patch(
    verifyJWT,
    isClassOwner,
    upload.fields([
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    updateThumbnail
)
// TODO: delete class


router.route("/view-all-join-invitations").get(
    verifyJWT,
    isClassOwner,
    viewAllJoinInvitation
)

router.route("/accept-join-invitation").patch(
    verifyJWT,
    isClassOwner,
    acceptJoinInvitation
)

router.route("/reject-join-invitation").patch(
    verifyJWT,
    isClassOwner,
    rejectJoinInvitation
)

router.route("/get-my-classes-for-mentor").get(
    verifyJWT,
    isMentor,
    getMyClassesForMentor
)

router.route("/remove-student-from-class").delete(
    verifyJWT,
    isClassOwner,
    removeStudentFromClass
)

router.route("/get-my-class-dashboard-mentor").get(
    verifyJWT,
    isMentor,
    getMyClassDashboardMentor
)

router.route("/get-students-having-doubts").get(
    verifyJWT,
    isMentor,
    getStudentsHavingDoubts
)

// Student Routes

router.route("/join").post(
    verifyJWT,
    isStudent,
    joinClass
)

router.route("/leave").delete(
    verifyJWT,
    isStudent,
    leaveClass
)

router.route("/get-all-classes-for-student").get(
    verifyJWT,
    isStudent,
    getAllClassesForStudent
)

router.route("/get-my-classes-for-student").get(
    verifyJWT,
    isStudent,
    getMyClassesForStudent
)

router.route("/get-all-mentors-for-student").get(
    verifyJWT,
    isStudent,
    getAllMentorsForStudent
)

router.route("/get-my-class-dashboard-student").get(
    verifyJWT,
    isStudent,
    getMyClassDashboardStudent
)



export default router