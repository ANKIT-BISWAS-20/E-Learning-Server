import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { Material } from "../models/material.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config({
    path: './.env'
})




const uploadMaterial = asyncHandler( async (req, res) => {
    const classId = req.query.classId
    const userId = req.user._id
    const {name, description} = req.body
    if (
        [userId, name, classId, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }


    const fileLocalPath = req.files?.file[0]?.path;

    if (!fileLocalPath) {
        throw new ApiError(400, " file is required")
    }

    const file = await uploadOnCloudinary(fileLocalPath)
    if (!file) {
        throw new ApiError(400, " file is required")
    }
   

    const myMaterial = await Material.create({
        class: classId,
        file: file.url,
        name:name, 
        description:description,
        owner: current_user._id,
    })

    const createdMaterial = await Material.findById(myMaterial._id)

    if (!createdMaterial) {
        throw new ApiError(500, "Something went wrong while creating the class")
    }

    return res.status(201).json(
        new ApiResponse(200, {user: current_user,
            createdMaterial:createdMaterial,
        }, "Material Added Successfully")
    )
})




export {
    uploadMaterial,
}