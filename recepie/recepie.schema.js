const mongoose = require("mongoose");

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
      type: String, // you can also use Number if storing minutes
      required: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    image: {
      type: String, // URL or path to the image
      required: false,
    },
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
