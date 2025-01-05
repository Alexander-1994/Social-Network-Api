import { Router } from 'express';
import multer, { diskStorage } from 'multer';

import { UserController } from '../controllers/user-controller.js';
import { PostController } from '../controllers/post-controller.js';

import { PATHS } from '../constants/paths.js';
import { authenticateToken } from '../middlewares/auth.js';

export const router = Router();

// Показываем, где хранить файлы
const storage = diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Создаем хранилище
const uploads = multer({ storage });

router.post(PATHS.USER.REGISTER, UserController.register);
router.post(PATHS.USER.LOGIN, UserController.login);
router.get(PATHS.USER.CURRENT, authenticateToken, UserController.current);
router.get(PATHS.USER.USER_BY_ID, authenticateToken, UserController.getUserById);
router.put(PATHS.USER.USER_BY_ID, authenticateToken, UserController.updateUserById);

router.post(PATHS.POST.POSTS, authenticateToken, PostController.createPost);
router.get(PATHS.POST.POSTS, authenticateToken, PostController.getAllPosts);
router.get(PATHS.POST.POST_BY_ID, authenticateToken, PostController.getPostById);
router.delete(PATHS.POST.POST_BY_ID, authenticateToken, PostController.deletePostById);
