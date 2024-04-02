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



const updateClass = asyncHandler( async (req, res) => {
    
        const {classname,title,description,category} = req.body
        const classId = req.params.id
    
        if (
            [classname, title, description, category].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required")
        }
    
        const myClass = await Class.findById(classId)
    
        if (!myClass) {
            throw new ApiError(404, "Class not found")
        }
    
        myClass.classname = classname
        myClass.title = title
        myClass.description = description
        myClass.category = category

        myClass.save()

        const updatedClass = await Class.findById(myClass._id)

        return res.status(200).json(
            new ApiResponse(200, updatedClass, "Class Updated Successfully")
        )
})


const updateThumbnail = asyncHandler( async (req, res) => {
        
        const classId = req.params.id
    
        const myClass = await Class.findById(classId)
    
        if (!myClass) {
            throw new ApiError(404, "Class not found")
        }
    
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    
        if (!thumbnailLocalPath) {
            throw new ApiError(400, "Thumbnail file is required")
        }
    
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if (!thumbnail) {
            throw new ApiError(400, "Thumbnail file is required")
        }
    
        myClass.thumbnail = thumbnail.url
        myClass.save()

        const updatedClass = await Class.findById(myClass._id)

        return res.status(200).json(
            new ApiResponse(200, updatedClass, "Thumbnail Updated Successfully")
        )
})

//TODO: Delete Class


const acceptJoinInvitation = asyncHandler( async (req, res) => {
            
            const classId = req.params.id
            const memberId = req.body.memberId
        
            const myClass = await Class.findById(classId)
        
            if (!myClass) {
                throw new ApiError(404, "Class not found")
            }
        
            const classMember = await ClassMember.findOne({
                class: classId,
                member: memberId
            })
        
            if (!classMember) {
                throw new ApiError(404, "Member not found")
            }
        
            classMember.status = "accepted"
            classMember.save()
    
            const updatedClassMember = await ClassMember.findById(classMember._id)

            return res.status(200).json(
                new ApiResponse(200, updatedClassMember, "Member accepted successfully")
            )
})


const rejectJoinInvitation = asyncHandler( async (req, res) => {
                
                const classId = req.params.id
                const memberId = req.body.memberId
            
                const myClass = await Class.findById(classId)
            
                if (!myClass) {
                    throw new ApiError(404, "Class not found")
                }
            
                const classMember = await ClassMember.findOne({
                    class: classId,
                    member: memberId
                })
            
                if (!classMember) {
                    throw new ApiError(404, "Member not found")
                }
            
                await ClassMember.findByIdAndDelete(classMember._id)
    
                return res.status(200).json(
                    new ApiResponse(200, [], "Member rejected successfully")
                )
})









// Student Class Controllers

const joinClass = asyncHandler( async (req, res) => {
        
        const classId = req.params.id
        const current_user = await User.findById(req.user?._id)
    
        const myClass = await Class.findById(classId)
    
        if (!myClass) {
            throw new ApiError(404, "Class not found")
        }
    
        const classMember = await ClassMember.findOne({
            class: classId,
            member: current_user._id
        })
    
        if (classMember.status === "accepted") {
            throw new ApiError(400, "You are already a member of this class")
        }
        if (classMember.status === "pending") {
            throw new ApiError(400, "You have already requested to join this class")
        }
    
        await ClassMember.create({
            class: classId,
            member: current_user._id,
            role: "student",
            status: "pending"
        })
    
        const createdClassMember = await ClassMember.findById(ClassMember._id)

        return res.status(200).json(
            new ApiResponse(200, createdClassMember, "Request to join class sent successfully")
        )
})


const leaveClass = asyncHandler( async (req, res) => {
            //TODO: Delete all assignments
            const classId = req.params.id
            const current_user = await User.findById(req.user?._id)
        
            const myClass = await Class.findById(classId)
        
            if (!myClass) {
                throw new ApiError(404, "Class not found")
            }
        
            const classMember = await ClassMember.findOne({
                class: classId,
                member: current_user._id
            })
        
            if (!classMember) {
                throw new ApiError(400, "You are not a member of this class")
            }
        
            await ClassMember.findByIdAndDelete(classMember._id)
    
            return res.status(200).json(
                new ApiResponse(200, null, "You have left the class successfully")
            )
})



export {
    createClass,
    updateClass,
    updateThumbnail,
    joinClass,
    leaveClass,
    acceptJoinInvitation,
    rejectJoinInvitation,
}