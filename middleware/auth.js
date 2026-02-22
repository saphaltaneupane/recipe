import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check for Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization header missing or malformed. Use 'Bearer <token>'",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    );
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default auth;

export const adminAuth = [
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
