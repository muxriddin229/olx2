const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    "salomlar",
    { expiresIn: "15m" } // 15 daqiqa amal qiladi
  );
};

module.exports = generateToken;
