import mongoose from "mongoose";

const AttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      default: "mixed",
    },
    difficulty: {
      type: String,
      default: "mixed",
    },
    grade: {
      type: Number,
      default: null,
    },
    
    score: {
      type: Number,
      required: true,
      default: 0,
    },
  
    totalQuestions: {
      type: Number,
      required: true,
      default: 0,
    },
    
    correctCount: {
      type: Number,
      default: 0,
    },
    
    totalPoints: {
      type: Number,
      default: 0
    },
    timeElapsed: {
      type: Number,
      default: 0
    },
    
    questions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        questionText: String,
        selectedAnswer: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
        correctAnswer: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
        isCorrect: {
          type: Boolean,
          default: false
        },
        pointsEarned: {
          type: Number,
          default: 0
        }
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Attempt", AttemptSchema);