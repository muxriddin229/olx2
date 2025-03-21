const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const User = require("../model/user");
const Region = require("../model/region");
const sendSms = require("../utils/eskiz");
const { totp } = require("otplib");
const nodemailer = require("nodemailer");

totp.options = {
  step: 3000,
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hadiyhadiy2008@gmail.com",
    pass: "cbzk bmns kqyz xsqn",
  },
});

async function sendMail(email, otp) {
  try {
    await transporter.sendMail({
      to: email,
      text: `Your one-time password: ${otp}`,
    });
  } catch (error) {
    console.log(error);
  }
}
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");
const upload = require("../middleware/multer");
const {
  registerSchema,
  loginSchema,
} = require("../validations/authValidation");
const { authorize, protect } = require("../middleware/authMiddleware");
const { userValidation } = require("../validations/userValidation");

// 🔹 Foydalanuvchini ro‘yxatdan o‘tkazish (Register) - OTP yuboriladi
exports.register = async (req, res) => {
  try {
    const { email, password, phone, regionID } = req.body;

    const { error } = userValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email allaqachon mavjud." });

    let region = await Region.findByPk(regionID);
    if (!region) return res.status(404).json({ message: "Region topilmadi." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = totp.generate(email + "soz");

    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
      status: "PENDING",
    });

    await sendSms(phone, otp);
    await sendMail(email, otp);
    res.status(201).json({
      message: "Foydalanuvchi yaratildi. OTP yuborildi.",
      userId: newUser.id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server xatosi", error });
  }
};

// 🔹 Foydalanuvchini tasdiqlash (OTP tekshirish)
exports.verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findByPk(userId);

    if (!user)
      return res.status(404).json({ message: "Foydalanuvchi topilmadi." });
    if (user.otp !== otp)
      return res.status(400).json({ message: "Noto‘g‘ri OTP." });

    await user.update({ status: "ACTIVE", otp: null });
    res.json({ message: "Foydalanuvchi tasdiqlandi." });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

// 🔹 Tizimga kirish (Login) - Faqat tasdiqlangan foydalanuvchilar
exports.login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Email noto'g'ri." });
    if (user.status !== "ACTIVE")
      return res
        .status(403)
        .json({ message: "Foydalanuvchi hali tasdiqlanmagan." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Parol noto'g'ri." });

    const actoken = generateAccessToken(user);
    const retoken = generateRefreshToken(user);
    res.json({
      message: "Tizimga muvaffaqiyatli kirdingiz.",
      actoken,
      retoken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

// 🔹 Barcha foydalanuvchilarni olish (RBAC bilan)
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "DESC",
      role,
      search,
    } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const users = await User.findAndCountAll({
      where,
      include: { model: Region, attributes: ["name"] },
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json({
      total: users.count,
      page: parseInt(page),
      totalPages: Math.ceil(users.count / parseInt(limit)),
      data: users.rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

// 🔹 Foydalanuvchini ID bo‘yicha olish
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: { model: Region, attributes: ["name"] },
    });
    if (!user)
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

// 🔹 Foydalanuvchini yangilash (RBAC bilan)
(exports.updateUser = authorize(["ADMIN", "SUPER_ADMIN"])),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user)
        return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
      await user.update(req.body);
      res.json({ message: "Foydalanuvchi yangilandi", user });
    } catch (error) {
      res.status(500).json({ message: "Server xatosi", error });
    }
  };

// 🔹 Foydalanuvchini o‘chirish (RBAC bilan)
(exports.deleteUser = authorize(["ADMIN"])),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user)
        return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
      await user.destroy();
      res.json({ message: "Foydalanuvchi o'chirildi" });
    } catch (error) {
      res.status(500).json({ message: "Server xatosi", error });
    }
  };
