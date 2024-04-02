import { Router } from "express";
import { createClass } from "../controllers/class.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isMentor } from "../middlewares/isMentor.middleware.js";
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

export default router