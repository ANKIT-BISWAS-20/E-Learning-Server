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



export default router