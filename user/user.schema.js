import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      match: [/^\+?[0-9]{7,15}$/, "Please enter a valid mobile number"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    confirmPassword: {
      type: String,
      required: false, // not stored in DB
      validate: {
        validator: function (value) {
          if (this.password) {
            return value === this.password;
          }
          return true;
        },
        message: "Passwords do not match",
      },
    },
  },
  { timestamps: true }
);

// Pre-save hook
userSchema.pre("save", function () {
  this.confirmPassword = undefined;
});

// Hot reload safe
const UserTable = mongoose.models.User || mongoose.model("User", userSchema);

export default UserTable;
