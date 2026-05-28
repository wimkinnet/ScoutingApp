import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
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
        clubId: {
            type: String,
            required: true,
            trim: true,
        },
        seasonId: {
            type: String,
            required: true,
            trim: true,
        },
        playerIds : {
            type: [String],
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

export type TeamDoc = mongoose.InferSchemaType<typeof TeamSchema>;

export const Team = mongoose.model('Team', TeamSchema);