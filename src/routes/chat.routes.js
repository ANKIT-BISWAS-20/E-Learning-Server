import { Router } from "express";
import { getChatsWithMentor } from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isMentor } from "../middlewares/isMentor.middleware.js";
import { isClassOwner } from "../middlewares/isClassOwner.middleware.js";
import { isStudent } from "../middlewares/isStudent.middleware.js";

const router = Router()

// Mentor Routes

router.route("/get-all-chats-with-mentor").get(
    verifyJWT,
    isStudent,
    getChatsWithMentor
)



export default router