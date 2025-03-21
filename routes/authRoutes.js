const express = require("express");
const {
  register,
  login,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: "Yangi foydalanuvchi ro‘yxatdan o‘tadi"
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - password
 *               - role
 *               - regionID
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Ali Valiyev"
 *               email:
 *                 type: string
 *                 example: "ali@example.com"
 *               phone:
 *                 type: string
 *                 example: "+998901234567"
 *               password:
 *                 type: string
 *                 example: "12345678"
 *               role:
 *                 type: string
 *                 enum: ["ADMIN", "SUPER_ADMIN", "USER"]
 *                 example: "USER"
 *               regionID:
 *                 type: integer
 *                 example: 1
 *               image:
 *                 type: string
 *                 example: "aaa.png"
 *               year:
 *                 type: integer
 *                 example: 1999
 *     responses:
 *       201:
 *         description: "Foydalanuvchi muvaffaqiyatli yaratildi"
 *       400:
 *         description: "Email allaqachon mavjud yoki validatsiya xatosi"
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: "Foydalanuvchi tizimga kiradi"
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "ali@example.com"
 *               password:
 *                 type: string
 *                 example: "12345678"
 *     responses:
 *       200:
 *         description: "Tizimga muvaffaqiyatli kirdingiz"
 *       400:
 *         description: "Email yoki parol noto‘g‘ri"
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: "Foydalanuvchilarni olish (Pagination, Filter, Sorting)"
 *     tags: [Users]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *         description: "Qaysi sahifa (default = 1)"
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *         description: "Sahifada nechta natija (default = 10)"
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: "Foydalanuvchini izlash (fullName, email, phone)"
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *         description: "Saralash maydoni (masalan: createdAt, fullName)"
 *       - name: order
 *         in: query
 *         schema:
 *           type: string
 *           enum: ["ASC", "DESC"]
 *         description: "Saralash tartibi (ASC yoki DESC)"
 *     responses:
 *       200:
 *         description: "Foydalanuvchilar ro‘yxati"
 */
router.get("/users", getUsers);

/**
 * @swagger
 * /auth/users/{id}:
 *   get:
 *     summary: "Foydalanuvchini ID bo‘yicha olish"
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Foydalanuvchi ID-si"
 *     responses:
 *       200:
 *         description: "Foydalanuvchi ma'lumotlari"
 *       404:
 *         description: "Foydalanuvchi topilmadi"
 */
router.get("/users/:id", getUserById);

/**
 * @swagger
 * /auth/users/{id}:
 *   put:
 *     summary: "Foydalanuvchini yangilash"
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Foydalanuvchi ID-si"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Ali Valiyev"
 *               email:
 *                 type: string
 *                 example: "ali@example.com"
 *               phone:
 *                 type: string
 *                 example: "+998901234567"
 *               role:
 *                 type: string
 *                 enum: ["admin", "super_admin", "user"]
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: "Foydalanuvchi muvaffaqiyatli yangilandi"
 *       404:
 *         description: "Foydalanuvchi topilmadi"
 */
router.patch("/users/:id", updateUser);

/**
 * @swagger
 * /auth/users/{id}:
 *   delete:
 *     summary: "Foydalanuvchini o‘chirish"
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Foydalanuvchi ID-si"
 *     responses:
 *       200:
 *         description: "Foydalanuvchi o‘chirildi"
 *       404:
 *         description: "Foydalanuvchi topilmadi"
 */
router.delete("/users/:id", deleteUser);

module.exports = router;
