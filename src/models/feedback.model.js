import mongoose, {Schema} from "mongoose";

const feedbackSchema = new Schema(
    {
        provider: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String, 
        },
        understandability: {
            type: Number, 
            default: 0
        },
        usefulness: {
            type: Number, 
            default: 0
        },
        reliability: {
            type: Number, 
            default: 0
        },
        emotion: {
            type: String, 
        },
        toWhich: {
            type: String, 
        }
    }, 
    {
        timestamps: true
    }
)


export const Feedback = mongoose.model("Feedback", feedbackSchema)