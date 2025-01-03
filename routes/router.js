import { Router } from "express";
import multer, { diskStorage } from "multer";

import { UserController } from "../controllers/user-controller.js";

export const router = Router();

// Показываем, где хранить файлы
const storage = diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Создаем хранилище
const uploads = multer({ storage });

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current", UserController.current);
router.get("/users/:id", UserController.getUserById);
router.put("/users/:id", UserController.updateUser);
