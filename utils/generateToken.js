const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

// 🔹 Refresh token (7 kun)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || "refreshsalom",
    { expiresIn: "7d" }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
