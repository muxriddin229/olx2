const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token yo'q." });

  try {
    const decoded = jwt.verify(token, "salomlar");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Yaroqsiz token." });
  }
};

module.exports = protect;
