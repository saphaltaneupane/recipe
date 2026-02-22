import express from "express";
import User from "../models/user.model.js";
import Recipe from "../models/recipe.model.js";

const router = express.Router();

// ✅ Middleware to check admin
const adminAuth = [
  auth,
  (req, res, next) => {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }
    next();
  },
];

//////////////////////////
// ----- USERS CRUD -----
//////////////////////////

// Get all users
router.get("/admin/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user by ID
router.get("/admin/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Edit user
router.put("/admin/users/:id", adminAuth, async (req, res) => {
  try {
    const updates = req.body || {};
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
    }).select("-password");
    if (!updatedUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res
      .status(200)
      .json({ success: true, message: "User updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user
router.delete("/admin/users/:id", adminAuth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//////////////////////////
// --- RECIPES CRUD -----
//////////////////////////

// Get all recipes
router.get("/admin/recipes", adminAuth, async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("createdBy", "name email");
    res.status(200).json({ success: true, recipes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get recipe by ID
router.get("/admin/recipes/:id", adminAuth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!recipe)
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    res.status(200).json({ success: true, recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create recipe
router.post("/admin/recipes", adminAuth, async (req, res) => {
  try {
    const { title, description, ingredients, createdBy } = req.body;

    if (!title || !description || !ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const newRecipe = new Recipe({
      title,
      description,
      ingredients,
      createdBy, // Admin can assign any user as creator
    });

    await newRecipe.save();
    res
      .status(201)
      .json({ success: true, message: "Recipe created", recipe: newRecipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Edit recipe
router.put("/admin/recipes/:id", adminAuth, async (req, res) => {
  try {
    const updates = req.body || {};
    if ("ingredients" in updates && !Array.isArray(updates.ingredients)) {
      return res
        .status(400)
        .json({ success: false, message: "Ingredients must be an array" });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: "after" }
    );
    if (!updatedRecipe)
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });

    res.status(200).json({
      success: true,
      message: "Recipe updated",
      recipe: updatedRecipe,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete recipe
router.delete("/admin/recipes/:id", adminAuth, async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe)
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });

    res
      .status(200)
      .json({ success: true, message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
