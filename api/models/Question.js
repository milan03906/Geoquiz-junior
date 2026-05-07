import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["mcq", "drag_drop", "map_click"],
      default: "mcq",
    },

    options: {
      type: [String],
      default: [],
      validate: {
        validator: function (value) {
          const currentType = this.get ? this.get('type') : this.type;
          
          if (currentType !== "mcq") return true;
          return Array.isArray(value) && value.length >= 2;
        },
        message: "MCQ pitanja moraju imati najmanje 2 opcije.",
      },
    },

    correctAnswer: {
      type: String,
      default: "",
      validate: {
        validator: function (value) {
          const currentType = this.get ? this.get('type') : this.type;
          
          if (currentType !== "mcq") return true;
          return !!value;
        },
        message: "MCQ pitanja moraju imati tačan odgovor.",
      },
    },

    specialData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    category: {
      type: String,
      enum: ["Srbija", "Evropa", "Svet", "Priroda i društvo"],
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },

    grade: {
      type: Number,
      min: 5,
      max: 8,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Question", QuestionSchema);