import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { Chat } from "../models/chat.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config({
    path: './.env'
})




const getChatsWithMentor = asyncHandler( async (req, res) => {

    const mentorId = req.query.mentorId
    const studentId = req.user._id

    if(!mentorId) {
        throw new ApiError(400, "Mentor is required")
    }

    const mentor = await User.findById(mentorId)

    if(!mentor) {
        throw new ApiError(404, "Mentor not found")
    }

    const chats = await Chat.aggregate([
        [
            {
                $match: {
                    $or: [
                        { studentId: mongoose.Types.ObjectId(studentId), mentorId: mongoose.Types.ObjectId(mentorId) },
                        { studentId: mongoose.Types.ObjectId(mentorId), mentorId: mongoose.Types.ObjectId(studentId) }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "mentorId",
                    foreignField: "_id",
                    as: "mentorInfo"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "studentInfo"
                }
            },
            {
                $unwind: "$mentorInfo"
            },
            {
                $unwind: "$studentInfo"
            },
            {
                $project: {
                    mentorInfo: {
                        _id: 1,
                        fulname: 1,
                        email: 1,
                        avatar: 1
                    },
                    studentInfo: {
                        _id: 1,
                        fulname: 1,
                        email: 1
                    },
                    createdAt: 1
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ]
    ])

    

    return res.status(200).json(new ApiResponse(201, chats,"Chat created successfully"))

} )




export {
    getChatsWithMentor,
}