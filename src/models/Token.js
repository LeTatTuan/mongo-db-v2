import { required } from "joi";
import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
    {
        accessTokens: [{ type: Object }],
        refreshToken: { type: String },
        ip: { type: String, required: true },
        userAgent: {
            type: String, required: true
        },
        isValid: { type: Boolean, default: true },
        user:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

    },
    {
        timestamps: true,
        versionKey: false,
    }
);


export default mongoose.model("Token", tokenSchema);
