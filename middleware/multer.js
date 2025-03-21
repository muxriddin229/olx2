const { Router } = require("express");
const multer = require("multer");
const path = require("path");

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Загрузка файла
 *     description: Загружает файл на сервер
 *     tags:
 *       - Upload
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Файл для загрузки
 *     responses:
 *       200:
 *         description: Файл успешно загружен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Файл загружен!"
 *                 file:
 *                   type: object
 *                   example: { "filename": "1678901234567.png", "path": "uploads/1678901234567.png" }
 *       400:
 *         description: Файл не загружен
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Файл не загружен!" });
  }
  res.json({
    message: "Файл загружен!",
    file: {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      url: `http://localhost:5000/uploads/${req.file.filename}`,
    },
  });
});

module.exports = router;
