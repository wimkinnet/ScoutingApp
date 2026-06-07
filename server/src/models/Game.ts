import mongoose from "mongoose";

const GamePlayerSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    trim: true,
  },
  shirtNumber: {
    type: Number,
    required: true,
  },
  homeTeam: {
    type: Boolean,
    required: true,
  }
}, { _id: false }); // Prevents Mongoose from generating an automatic _id for every single player row

const GameSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },
        homeTeamId: {
            type: String,
            required: true,
            trim: true,
        },
        awayTeamId: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: String,
            required: true,
            trim: true,
        },
        homePlayers : {
            type: [GamePlayerSchema],
            required: true,
            default: [] 
        },
        awayPlayers : {
            type: [GamePlayerSchema],
            required: true,
            default: [] 
        },
    },
    {
        timestamps: true,
    }
);

export type GameDoc = mongoose.InferSchemaType<typeof GameSchema>;

export const Game = mongoose.model('Game', GameSchema);