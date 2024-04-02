import { Router } from "express";
import { getChatsWithMentor,getChatsWithStudent } from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isMentor } from "../middlewares/isMentor.middleware.js";
import { isClassOwner } from "../middlewares/isClassOwner.middleware.js";
import { isStudent } from "../middlewares/isStudent.middleware.js";

const router = Router()

// Student Routes

router.route("/get-all-chats-with-mentor").get(
    verifyJWT,
    isStudent,
    getChatsWithMentor
)

// Mentor Routes

router.route("/get-all-chats-with-student").get(
    verifyJWT,
    isMentor,
    getChatsWithStudent
)



export default router