import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    ingredients: {
      type: [String],
      required: true,
    },
    duration: {
      type: String, // or Number if you want minutes
      required: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    image: {
      type: String, // URL of the image
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to User
    },
  },
  { timestamps: true },
);

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
