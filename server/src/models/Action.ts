import mongoose, { Schema, model, InferSchemaType } from "mongoose";

const ActionSchema = new Schema(
    {
        id: {
            type: String,
            required: [true, 'Unique ID is required'],
            unique: true,
            index: true,
            trim: true,
        },
        name: {
            type: String,
            required: [true, 'name is required'],
            trim: true,
        },
        label: {
            type: String,
            required: [true, 'Label is required'],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Correctly infer the TypeScript type from the Schema
export type ActionDoc = InferSchemaType<typeof ActionSchema>;

// Export model safely (prevents re-compilation issues in development environments like Next.js)
export const Action = mongoose.models.Action || model('Action', ActionSchema);