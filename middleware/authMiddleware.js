const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token yo'q." });

  try {
    const decoded = jwt.verify(token, "soz");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Yaroqsiz token." });
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Sizda bu amalni bajarishga ruxsat yo'q." });
  }
  next();
};

module.exports = { protect, authorize };
