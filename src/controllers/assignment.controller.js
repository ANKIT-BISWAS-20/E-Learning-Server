import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {Class} from "../models/class.model.js"
import { Assignment } from "../models/assignment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import dotenv from "dotenv"
import { ClassMember } from "../models/classMember.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

dotenv.config({
    path: './.env'
})




const createAssignment = asyncHandler( async (req, res) => {
    const classId = req.query.classId
    const userId = req.user._id

    const current_user = await User.findById(userId)
    const current_class= await Class.findById(classId)
    if (current_class.owner.toString() !== current_user._id.toString()) {
 
        throw new ApiError(400, "You are not owner of this class")
    }

    const {description,deadline,fullmarks} = req.body
    if (
        [userId, deadline, classId, description,fullmarks].some((field) => field === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }


    const documentLocalPath = req.files?.file[0]?.path;

    if (!documentLocalPath) {
        throw new ApiError(400, " file is required")
    }

    const doc = await uploadOnCloudinary(documentLocalPath)
    if (!doc) {
        throw new ApiError(400, " file is required")
    }
   
    const deadlineDate = new Date(deadline)
    const myAssignemnt = await Assignment.create({
        class: classId,
        document: doc.url,
        deadline:deadlineDate, 
        description:description,
        owner: current_user._id,
        fullmarks:fullmarks,
    })

    const createdAssignment = await Assignment.findById(myAssignemnt._id)

    if (!createdAssignment) {
        throw new ApiError(500, "Something went wrong while creating the class")
    }

    return res.status(201).json(
        new ApiResponse(200, {user: current_user,
            createdAssignment:createdAssignment,
        }, "Assignment Added Successfully")
    )
})


const deleteAssignment = asyncHandler( async (req, res) => {
    const classId = req.query.classId
    const assignmentId = req.query.assignmentId
    const userId = req.user._id

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
        throw new ApiError(400, "Assignment not found")
    }

    const classMember = await ClassMember.findOne({
        member: userId,
        class: classId,
        role: "mentor",
        status: "accepted"
    })

    if (!classMember) {
        throw new ApiError(400, "You are not mentor of this class")
    }

    await Assignment.findByIdAndDelete(assignmentId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Assignment Deleted Successfully")
    )
})


const getAllAssignment = asyncHandler( async (req, res) => {
    const classId = req.query.classId
    const userId = req.user._id


    const current_class= await Class.findById(classId)
    const current_user = await User.findById(userId)
    if (current_class.owner.toString() !== current_user._id.toString()) {
        const classMember = await ClassMember.findOne({
            member: userId,
            class: classId,
            status: "accepted"
        })


        if (!classMember) {
            throw new ApiError(400, "You are not member of this class")
        }
    }

    const assignments = await Assignment.aggregate([
        {
            "$match": {
                "class": current_class._id
            }
        },
        {
            "$sort": {
                "createdAt": 1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200,  assignments, "Assignments Fetched Successfully")
    )
})


export {
    createAssignment,
    deleteAssignment,
    getAllAssignment
}