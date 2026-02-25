import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      // removed unique: true so duplicates allowed
    },

    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// ✅ Safe model reuse (prevents nodemon crash)
const UserTable = mongoose.models.User || mongoose.model("User", userSchema);

export default UserTable;
