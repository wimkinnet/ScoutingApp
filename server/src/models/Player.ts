import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        dateOfBirth: {
            type: String,
            required: false,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export type PlayerDoc = mongoose.InferSchemaType<typeof PlayerSchema>;

export const Player = mongoose.model('Player', PlayerSchema);