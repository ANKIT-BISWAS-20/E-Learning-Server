import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config({
    path: './.env'
})




const getAllComments = asyncHandler( async (req, res) => {
    const assignemntId = req.query.assignmentId;
    const materialId = req.query.materialId;
    if (!(assignemntId||materialId)) {
        throw new ApiError(400, "Assignment or Material id is required")
    }
    const type = assignemntId ? "assignment" : "material"
    let comments;
    if (type === "assignment") {
        comments = await Comment.aggregate([
            {
                $match: {
                    assignemnt: mongoose.Types.ObjectId(assignemntId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "sender",
                    foreignField: "_id",
                    as: "sender"
                }
            },
            {
                $unwind: "$sender"
            },
            {
                $project: {
                    "sender.password": 0
                }
            }
        ])
    } else {
        comments = await Comment.aggregate([
            {
                $match: {
                    material: mongoose.Types.ObjectId(materialId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "sender",
                    foreignField: "_id",
                    as: "sender"
                }
            },
            {
                $unwind: "$sender"
            },
            {
                $project: {
                    "sender.password": 0
                }
            }
        ])
    }

    if (!comments) {
        throw new ApiError(404, "No comments found")
    }
    res.status(200).json(new ApiResponse(200, comments, "Comments Fetched Successfully"))
})


const createComment = asyncHandler( async (req, res) => {
    const {message} = req.body
    const assignemntId = req.query.assignmentId;
    const materialId = req.query.materialId;
    if (!(assignemntId||materialId)) {
        throw new ApiError(400, "Assignment or Material id is required")
    }
    const type = assignemntId ? "assignment" : "material"
    const sender = req.user._id
    const comment = new Comment({
        sender,
        type,
        message,
        assignemnt: assignemntId,
        material: materialId
    })
    await comment.save()
    res.status(201).json(new ApiResponse(201, comment, "Comment Added Successfully"))
})


export { getAllComments, createComment }