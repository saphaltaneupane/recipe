import express from "express";
import auth from "../middleware/auth.js";
import Recipe from "./recepie.schema.js";
import { upload } from "../config/upload.js";

import { uploadBufferToCloudinary } from "../config/cloudinary.upload.js";
const router = express.Router();

/**
 * @route POST /add/recipe
 * @desc  Add a recipe (requires login)
 * @access Private
 */
router.post(
  "/add/recipe",
  upload.fields([{ name: "image", maxCount: 5 }]),
  auth,
  async (req, res) => {
    try {
      const { name, description, ingredients, duration, instructions } =
        req.body;

      // Validate required fields
      if (!name || !description || !duration || !instructions || !ingredients) {
        return res.status(400).json({
          success: false,
          message: "All fields except image are required",
        });
      }

      // Ensure ingredients is array
      const parsedIngredients = Array.isArray(ingredients)
        ? ingredients
        : [ingredients];

      // 🔥 Get image files from multer
      const imageFiles = req.files?.image || [];

      let imageUrls = [];

      if (imageFiles.length > 0) {
        const uploadedImages = await Promise.all(
          imageFiles.map((file) =>
            uploadBufferToCloudinary(file.buffer, "recipes"),
          ),
        );

        imageUrls = uploadedImages.map((img) => img.secure_url);
      }

      const recipe = await Recipe.create({
        name,
        description,
        ingredients: parsedIngredients,
        duration,
        instructions,
        image: imageUrls, // store array of image URLs
        createdBy: req.user.id,
      });

      return res.status(201).json({
        success: true,
        message: "Recipe created successfully",
        recipe,
      });
    } catch (error) {
      console.error("Error creating recipe:", error);
      return res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
  },
);

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
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id).populate(
      "createdBy",
      "name email",
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // send the recipe object directly (frontend matches this)
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Recipe detail error:", error);
    res.status(500).json({ message: "Failed to fetch recipe details" });
  }
});
router.get("/recipe/:id", auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // ownership check
    if (recipe.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({ data: recipe });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   EDIT RECIPE (FORMDATA)
================================ */
router.put(
  "/edit/recipe/:id",
  auth,
  upload.array("image"),
  async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id);

      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      if (recipe.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const { name, description, duration, instructions } = req.body;

      // 🔑 FIX INGREDIENTS (FormData issue)
      let ingredients = req.body.ingredients;
      if (ingredients && !Array.isArray(ingredients)) {
        ingredients = [ingredients];
      }

      // update fields
      recipe.name = name ?? recipe.name;
      recipe.description = description ?? recipe.description;
      recipe.duration = duration ?? recipe.duration;
      recipe.instructions = instructions ?? recipe.instructions;
      recipe.ingredients = ingredients ?? recipe.ingredients;

      // images optional
      if (req.files && req.files.length > 0) {
        recipe.image = req.files.map((f) => f.originalname);
      }

      await recipe.save();

      res.status(200).json({
        message: "Recipe updated successfully",
        recipe,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ✅ Delete Recipe by ID
router.delete("/delete/recipe/:id", auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    // Only allow creator to delete
    if (recipe.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this recipe",
      });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting recipe:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error: " + error.message });
  }
});

router.get("/recipes/my", auth, async (req, res) => {
  try {
    const userId = req.user.id; // comes from auth middleware

    // Fetch recipes created by this user
    const recipes = await Recipe.find({ createdBy: userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: recipes.length,
      recipes,
    });
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

export { router as RecipeController };
