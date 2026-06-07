import mongoose, { Schema, model, InferSchemaType } from "mongoose";

const LogSchema = new Schema(
    {
        id: {
            type: String,
            required: [true, 'Unique ID is required'],
            unique: true,
            index: true,
            trim: true,
        },
        gameId: {
            type: String,
            required: [true, 'Game ID is required'],
            trim: true,
        },
        actionId: {
            type: String,
            required: [true, 'Action ID is required'],
            trim: true,
        },
        playerId: {
            type: String,
            required: [true, 'Player ID is required'],
            trim: true,
        },
        positionX: {
            type: Number,
            // Mongoose validation treats 0 as truthy, but custom messages are cleaner
            required: [true, 'Position X is required'], 
        },
        positionY: {
            type: Number,
            required: [true, 'Position Y is required'],
        },
        quarter: {
            type: Number,
            required: [true, 'Quarter is required'],
        },
        secRem: {
            type: Number,
            required: [true, 'Seconds remaining is required'],
        },
    },
    {
        timestamps: true,
    }
);

// Correctly infer the TypeScript type from the Schema
export type LogDoc = InferSchemaType<typeof LogSchema>;

// Export model safely (prevents re-compilation issues in development environments like Next.js)
export const Log = mongoose.models.Log || model('Log', LogSchema);