import mongoose from "mongoose";

const SeasonSchema = new mongoose.Schema(
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
    },
    {
        timestamps: true,
    }
);

export type SeasonDoc = mongoose.InferSchemaType<typeof SeasonSchema>;

export const Season = mongoose.model('Season', SeasonSchema);