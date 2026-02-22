import express from "express";
import auth from "../middleware/auth.js";
import Recipe from "./recepie.schema.js";

const router = express.Router();

router.post("/add/recipe", auth, async (req, res) => {
  try {
    const { name, description, ingredients, duration, instructions, image } =
      req.body;

    if (
      !name ||
      !description ||
      !duration ||
      !instructions ||
      !ingredients ||
      !Array.isArray(ingredients)
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields except image are required",
      });
    }

    const recipe = await Recipe.create({
      name,
      description,
      ingredients,
      duration,
      instructions,
      image,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Recipe created successfully",
      recipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export { router as RecipeController };
