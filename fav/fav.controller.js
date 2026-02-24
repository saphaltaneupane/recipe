import express from "express";
import { auth } from "../middleware/auth.js";

import Recipe from "../models/Recipe.js";
import UserTable from "../user/user.schema.js";

const router = express.Router();

/* ======================================
   ADD OR REMOVE FAVORITE
   POST /api/favorites/:recipeId
====================================== */

router.post("/:recipeId", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.params;

    // Check recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    // Find user
    const user = await UserTable.findById(userId);

    // Check already favorite
    const alreadyFavorite = user.favorites.includes(recipeId);

    if (alreadyFavorite) {
      // REMOVE favorite
      user.favorites = user.favorites.filter(
        (id) => id.toString() !== recipeId,
      );

      await user.save();

      return res.json({
        success: true,
        message: "Removed from favorites",
        favorites: user.favorites,
      });
    } else {
      // ADD favorite
      user.favorites.push(recipeId);
      await user.save();

      return res.json({
        success: true,
        message: "Added to favorites",
        favorites: user.favorites,
      });
    }
  } catch (error) {
    console.error("Favorite error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ======================================
   GET MY FAVORITES
   GET /api/favorites
====================================== */

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate("favorites");

    return res.json({
      success: true,
      recipes: user.favorites,
    });
  } catch (error) {
    console.error("Get favorites error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export { router as FavController };
