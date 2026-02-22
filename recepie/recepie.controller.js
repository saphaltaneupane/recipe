import express from "express";
import auth from "../middleware/auth.js";
import Recipe from "./recepie.schema.js";

const router = express.Router();

/**
 * @route POST /add/recipe
 * @desc  Add a recipe (requires login)
 * @access Private
 */
router.post("/add/recipe", auth, async (req, res) => {
  try {
    const { name, description, ingredients, duration, instructions, image } =
      req.body;

    // Validate required fields
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
        message:
          "All fields except image are required, and ingredients must be an array",
      });
    }

    // Create recipe and attach user ID from auth middleware
    const recipe = await Recipe.create({
      name,
      description,
      ingredients,
      duration,
      instructions,
      image: image || null,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Recipe created successfully",
      recipe,
    });
  } catch (error) {
    console.error("Error creating recipe:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error: " + error.message });
  }
});

router.get("/recipes", async (req, res) => {
  try {
    // Fetch all recipes, latest first
    const recipes = await Recipe.find().sort({ createdAt: -1 });

    return res.status(200).json({ success: true, recipes });
  } catch (error) {
    console.error("Error fetching recipes:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error: " + error.message });
  }
});
router.put("/edit/recipe/:id", auth, async (req, res) => {
  try {
    const updates = req.body || {};

    // Validate ingredients if provided
    if ("ingredients" in updates && !Array.isArray(updates.ingredients)) {
      return res
        .status(400)
        .json({ success: false, message: "Ingredients must be an array" });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    if (recipe.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: "after" } // ✅ Mongoose 7+ fix
    );

    return res.status(200).json({
      success: true,
      message: "Recipe updated successfully",
      recipe: updatedRecipe,
    });
  } catch (error) {
    console.error("Error updating recipe:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error: " + error.message });
  }
});

export { router as RecipeController };
