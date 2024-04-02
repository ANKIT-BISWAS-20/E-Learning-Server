import { Router } from "express";
import { registerUser , loginUser, logoutUser, refreshAccessToken,updateUserAvatar,updateAccountDetails,getCurrentStudent,getCurrentMentor} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isMentor } from "../middlewares/isMentor.middleware.js";
import { isStudent } from "../middlewares/isStudent.middleware.js";

const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

//student features
router.route("/get-current-student").get(verifyJWT, isStudent, getCurrentStudent)

//mentor features
router.route("/get-current-mentor").get(verifyJWT, isMentor, getCurrentMentor)

export default router