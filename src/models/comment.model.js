import mongoose, {Schema} from "mongoose";

const commentSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            required: true
        },
        message: {
            type: String, 
            required: true,
        },
        assignemnt: {
            type: Schema.Types.ObjectId,
            ref: "Assignment",

        },
        material: {
            type: Schema.Types.ObjectId,
            ref: "Material",

        }
    }, 
    {
        timestamps: true
    }
)


export const Comment = mongoose.model("Comment", commentSchema)