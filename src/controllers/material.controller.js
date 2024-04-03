import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { Material } from "../models/material.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import dotenv from "dotenv"
import { ClassMember } from "../models/classMember.model.js";

dotenv.config({
    path: './.env'
})




const uploadMaterial = asyncHandler( async (req, res) => {
    const classId = req.query.classId
    const userId = req.user._id

    const classMember = await ClassMember.findOne({
        member: userId,
        class: classId,
        role: "mentor",
        status: "accepted"
    })

    if (!classMember) {
        throw new ApiError(400, "You are not mentor of this class")
    }

    const {name, description,type} = req.body
    if (
        [userId, name, classId, description,type].some((field) => field?.trim() === "")
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
        type:type,
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


const deleteMaterial = asyncHandler( async (req, res) => {
    const classId = req.query.classId
    const materialId = req.query.materialId
    const userId = req.user._id

    const material = await Material.findById(materialId)
    if (!material) {
        throw new ApiError(400, "Material not found")
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

    await Material.findByIdAndDelete(materialId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Material Deleted Successfully")
    )
})


const getAllMaterials = asyncHandler( async (req, res) => {
    const classId = req.query.classId
    const userId = req.user._id

    const classMember = await ClassMember.findOne({
        member: userId,
        class: classId,
        status: "accepted"
    })

    if (!classMember) {
        throw new ApiError(400, "You are not member of this class")
    }

    const materials = await Material.find({
        class: classId
    })

    return res.status(200).json(
        new ApiResponse(200, {materials: materials}, "Materials Fetched Successfully")
    )
})


export {
    uploadMaterial,
    deleteMaterial,
    getAllMaterials
}