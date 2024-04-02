import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { Class} from "../models/class.model.js"
import { ClassMember } from "../models/classMember.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config({
    path: './.env'
})


const createClass = asyncHandler( async (req, res) => {


    const current_user = await User.findById(req.user?._id)
    const {classname,title,description,category} = req.body

    if (
        [classname, title, description, category].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }


    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail file is required")
    }
   

    const myClass = await Class.create({
        classname,
        thumbnail: thumbnail.url,
        title, 
        description,
        category,
        owner: current_user._id,
    })

    const createdClass = await Class.findById(myClass._id)

    if (!createdClass) {
        throw new ApiError(500, "Something went wrong while creating the class")
    }

    await ClassMember.create({
        class: createdClass._id,
        member: current_user._id,
        role: "teacher",
        status: "accepted"
    })

    const createdClassMember = await ClassMember.findById(ClassMember._id)

    if (!createdClassMember) {
        throw new ApiError(500, "Something went wrong while creating the class")
    }


    return res.status(201).json(
        new ApiResponse(200, {user: current_user,
            createdClass:createdClass,
            createdClassMember:createdClassMember
        }, "Class Created Successfully")
    )

} )





export {
    createClass,
}