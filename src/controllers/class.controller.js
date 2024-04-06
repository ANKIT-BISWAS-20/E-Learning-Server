import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { Class} from "../models/class.model.js"
import { Chat } from "../models/chat.model.js";
import { ClassMember } from "../models/classMember.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import dotenv from "dotenv"
const { ObjectId } = mongoose.Types;

dotenv.config({
    path: './.env'
})


const createClass = asyncHandler( async (req, res) => {


    const current_user = await User.findById(req.user?._id)
    const {classname,title,description,category} = req.body
    // console.log(classname)
    // console.log(title)
    // console.log(description)
    // console.log(category)
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

    const createdClassMember = await ClassMember.create({
        class: createdClass._id,
        member: current_user._id,
        role: "mentor",
        status: "accepted"
    })

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

const viewAllJoinInvitation = asyncHandler( async (req, res) => {
    const classId = req.classId
    console.log(classId)
    const myClass = await Class.findById(classId)
    if (!myClass) {
        throw new ApiError(404, "Class not found")
    }
    const classMembers = await ClassMember.aggregate([
        {
            "$match": {
                "class": myClass._id,
                "status": "accepted"
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "member",
                "foreignField": "_id",
                "as": "memberInfo"
            }
        },
        {
            "$unwind": "$memberInfo"
        },
        {
            "$project": {
                "memberInfo.password": 0,
                "memberInfo.refreshToken": 0
            }
        }
    ]
    )

    return res.status(200).json(
        new ApiResponse(200, classMembers, "Join Invitations fetched successfully")
    )
})


const acceptJoinInvitation = asyncHandler( async (req, res) => {
            
            const classId = req.query.id
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



const getMyClassesForMentor = asyncHandler( async (req, res) => {
    const current_user = await User.findById(req.user?._id)
    const myClasses = await ClassMember.aggregate([
        {
            '$match': {
                'member': current_user._id,
                'role': 'mentor'
            }
        }, {
            '$lookup': {
                'from': 'classes',
                'localField': 'class',
                'foreignField': '_id',
                'as': 'classInfo'
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'classInfo.owner',
                'foreignField': '_id',
                'as': 'ownerInfo'
            }
        }, {
            '$unset': [
                'ownerInfo.password', 'ownerInfo.refreshToken'
            ]
        }
    ])
    return res.status(200).json(
        new ApiResponse(200, myClasses, "My Classes fetched successfully")
    )
})

const getStudentsHavingDoubts = asyncHandler( async (req, res) => {
    const current_user = await User.findById(req.user?._id)
    const students = await Chat.aggregate([
        {
            "$match": {
                "receiver": current_user._id
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "sender",
                "foreignField": "_id",
                "as": "senderInfo"
            }
        },
        {
            "$unwind": "$senderInfo"
        },
        {
            "$group": {
                "_id": "$senderInfo._id",
                "senderInfo": { "$first": "$senderInfo" }
            }
        },
        {
            "$project": {
                "senderInfo.password": 0,
                "senderInfo.refreshToken": 0
            }
        }
    ]
    )

    return res.status(200).json(
        new ApiResponse(200, students, "Students having doubts fetched successfully")
    )
})

const removeStudentFromClass = asyncHandler( async (req, res) => {
    const classId = req.query.id
    const memberId = req.query.memberId

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
        new ApiResponse(200, [], "Member removed successfully")
    )
})


const getMyClassDashboardMentor = asyncHandler( async (req, res) => {
    const current_user = await User.findById(req.user?._id)
    const classId = req.query.id
    const myClass = await Class.findById(classId)
    if (!myClass) {
        throw new ApiError(404, "Class not found")
    }
    const classMember = await ClassMember.findOne({
        class: classId,
        member: current_user._id,
        role: "mentor",
        status: "accepted"
    })
    if (!classMember) {
        throw new ApiError(401, "unauthorized")
    }
    const classInfo = await Class.aggregate([
        {
            "$match": {
                        "_id": myClass._id
            }
        },
        {
            "$lookup": {
                "from": "classmembers",
                "localField": "_id",
                "foreignField": "class",
                "as": "members"
            }
        },
        {
            "$unwind": "$members"
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "members.member",
                "foreignField": "_id",
                "as": "memberInfo"
            }
        },
        {
            "$unwind": "$memberInfo"
        },
        {
            "$project": {
                "memberInfo.password": 0,
                "memberInfo.refreshToken": 0
            }
        }
    ]
    )
    return res.status(200).json(
        new ApiResponse(200, classInfo, "Class Info fetched successfully")
    )
})



// Student Class Controllers

const joinClass = asyncHandler( async (req, res) => {
        
        const classId = req.body.id
        const current_user = await User.findById(req.user?._id)
    
        const myClass = await Class.findById(classId)
    
        if (!myClass) {
            throw new ApiError(404, "Class not found")
        }
    
        const classMember = await ClassMember.findOne({
            class: classId,
            member: current_user._id
        })
    
        if (classMember?.status === "accepted") {
            throw new ApiError(400, "You are already a member of this class")
        }
        if (classMember?.status === "pending") {
            throw new ApiError(409, "You have already requested to join this class")
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

//TODO: Get Student ClassRoom

const getAllClassesForStudent = asyncHandler( async (req, res) => {
    const query = req.query.input
    let classes;
    if (query=="") {
        classes = await Class.aggregate([
            {
              "$lookup": {
                "from": "users",
                "localField": "owner",
                "foreignField": "_id",
                "as": "owner"
              }
            },
            {
              "$lookup": {
                "from": "classmembers",
                "localField": "_id",
                "foreignField": "class",
                "as": "members"
              }
            },
            {
              "$addFields": {
                "owner": {
                  "$map": {
                    "input": "$owner",
                    "as": "owner",
                    "in": {
                      "_id": "$$owner._id",
                      "fullName":	"$$owner.fullName",
                      "username": "$$owner.username",
                      "email": "$$owner.email",
                      "createdAt": "$$owner.createdAt"
                    }
                  }
                },
                "membersCount": {
                  "$size": "$members"
                }
              }
            },
            {
              "$unset": [
                "members",
                "owner.password",
                "owner.refreshToken"
              ]
            }
          ]);
    } else {
        classes = await Class.aggregate([
            {
              "$match": {
                "classname": query
              }
            },
            {
              "$lookup": {
                "from": "users",
                "localField": "owner",
                "foreignField": "_id",
                "as": "owner"
              }
            },
            {
              "$lookup": {
                "from": "classmembers",
                "localField": "_id",
                "foreignField": "class",
                "as": "members"
              }
            },
            {
              "$addFields": {
                "owner": {
                  "$map": {
                    "input": "$owner",
                    "as": "owner",
                    "in": {
                      "_id": "$$owner._id",
                      "username": "$$owner.username",
                      "email": "$$owner.email",
                      "createdAt": "$$owner.createdAt"
                    }
                  }
                },
                "membersCount": {
                  "$size": "$members"
                }
              }
            },
            {
              "$unset": [
                "members",
                "owner.password",
                "owner.refreshToken"
              ]
            }
          ]);
    }

    return res.status(200).json(
        new ApiResponse(200, classes, "Classes fetched successfully")
    )
})


const getMyClassesForStudent = asyncHandler(async (req, res) => {
    const current_user = await User.findById(req.user?._id)
    const query = req.query.input
    let myClasses;
    if (query == "") {
        myClasses = await ClassMember.aggregate([
            {
                '$match': {
                    'member': current_user._id
                }
            }, {
                '$lookup': {
                    'from': 'classes',
                    'localField': 'class',
                    'foreignField': '_id',
                    'as': 'classInfo'
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'classInfo.owner',
                    'foreignField': '_id',
                    'as': 'ownerInfo'
                }
            }, {
                '$unset': [
                    'ownerInfo.password', 'ownerInfo.refreshToken'
                ]
            }
        ])
    } else {
        myClasses = await ClassMember.aggregate([
            {
                '$lookup': {
                    'from': 'classes',
                    'localField': 'class',
                    'foreignField': '_id',
                    'as': 'classInfo'
                }
            }, {
                '$match': {
                    '$or': [
                        {
                            'classInfo.classname': query
                        }, {
                            'member': current_user._id
                        }
                    ]
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'classInfo.owner',
                    'foreignField': '_id',
                    'as': 'ownerInfo'
                }
            }, {
                '$unset': [
                    'ownerInfo.password', 'ownerInfo.refreshToken'
                ]
            }
        ])
    }

    return res.status(200).json(
        new ApiResponse(200, myClasses, "My Classes fetched successfully")
    )

})




const getAllMentorsForStudent = asyncHandler( async (req, res) => {
    const query = req.params.input
    let mentors;
    if (query=="") {
        mentors = await User.aggregate([
            {
                $match: {
                    role: "mentor"
                }
            },
            {
                $project: {
                    _id: 1,
                    fullName: 1,
                    email: 1,
                    role: 1,
                    avatar: 1
                }
            }
        ])
    } else {
        mentors = await User.aggregate([
            {
                $match: {
                    role: "mentor"
                }
            },
            {
                $match: {
                     name: query
                }
            },
            {
                $project: {
                    _id: 1,
                    fullName: 1,
                    email: 1,
                    role: 1,
                    avatar: 1
                }
            }
        ])
    }

    return res.status(200).json(
        new ApiResponse(200, mentors, "Mentors fetched successfully")
    )
})

const getMyClassDashboardStudent = asyncHandler( async (req, res) => {
    const current_user = await User.findById(req.user?._id)
    const classId = req.query.id
    const myClass = await Class.findById(classId)
    if (!myClass) {
        throw new ApiError(404, "Class not found")
    }
    const classMember = await ClassMember.findOne({
        class: classId,
        member: current_user._id,
        role: "student",
        status: "accepted"
    })
    if (!classMember) {
        throw new ApiError(401, "unauthorized")
    }
    const classInfo = await Class.aggregate([
        {
            "$match": {
                        "_id": myClass._id
            }
        },
        {
            "$lookup": {
                "from": "classmembers",
                "localField": "_id",
                "foreignField": "class",
                "as": "members"
            }
        },
        {
            "$unwind": "$members"
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "members.member",
                "foreignField": "_id",
                "as": "memberInfo"
            }
        },
        {
            "$unwind": "$memberInfo"
        },
        {
            "$project": {
                "memberInfo.password": 0,
                "memberInfo.refreshToken": 0
            }
        }
    ])

    const owner = await User.findById(myClass.owner).select("-password -refreshToken")


    return res.status(200).json(
        new ApiResponse(200, {class:myClass ,members: classInfo, owner: owner}, "Class Info fetched successfully")
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
    getAllClassesForStudent,
    getMyClassesForStudent,
    getMyClassesForMentor,
    getAllMentorsForStudent,
    removeStudentFromClass,
    getMyClassDashboardStudent,
    getMyClassDashboardMentor,
    viewAllJoinInvitation,
    getStudentsHavingDoubts
}