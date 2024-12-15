import { Router } from "express";
import multer, { diskStorage } from "multer";

const router = Router();

// Показываем, где хранить файлы
const storage = diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Создаем хранилище
const uploads = multer({ storage });

router.get("/register", (req, res) => {
  res.send("register");
});

export default router;
