import mongoose from "mongoose";

const ClubSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        shortName: {
            type: String,
            required: true,
            trim: true,
        },
        registrationNumber: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export type ClubDoc = mongoose.InferSchemaType<typeof ClubSchema>;

export const Club = mongoose.model('Club', ClubSchema);