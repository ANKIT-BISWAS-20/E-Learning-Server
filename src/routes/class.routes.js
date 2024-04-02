import { Router } from "express";
import { createClass , updateClass, updateThumbnail} from "../controllers/class.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isMentor } from "../middlewares/isMentor.middleware.js";
import { isClassOwner } from "../middlewares/isClassOwner.middleware.js";
import { isStudent } from "../middlewares/isStudent.middleware.js";

const router = Router()


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

export default router