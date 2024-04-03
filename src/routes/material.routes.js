import { Router } from "express";
import { uploadMaterial } from "../controllers/material.controller.js";
import { upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isMentor } from "../middlewares/isMentor.middleware.js";
import { isClassOwner } from "../middlewares/isClassOwner.middleware.js";
import { isStudent } from "../middlewares/isStudent.middleware.js";

const router = Router()

// Mentor Routes
router.route("/upload-material").post(
    verifyJWT,
    isMentor,
    upload.fields([
        {
            name: "file",
            maxCount: 1
        }
    ]),
    uploadMaterial
)

// Student Routes



export default router