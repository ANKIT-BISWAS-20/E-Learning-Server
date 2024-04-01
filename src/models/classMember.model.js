import mongoose, {Schema} from "mongoose";

const classMemberSchema = new Schema(
    {
        Member: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        class: {
            type: Schema.Types.ObjectId,
            ref: "Class",
            required: true
        },
        role: {
            type: String, 
            required: true,
        },
        Status: {
            type: String,
            default: "pending"
        }

    }, 
    {
        timestamps: true
    }
)


export const ClassMember = mongoose.model("ClassMember", classMemberSchema)