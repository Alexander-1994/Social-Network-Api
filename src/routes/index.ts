import { Router } from 'express';
import multer, { diskStorage } from 'multer';

import { UserController, PostController, CommentController, LikeController, FollowController } from '../controllers';
import { PATHS } from '../constants';
import { authenticateToken } from '../middlewares';

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

router.post(PATHS.COMMENT.COMMENTS, authenticateToken, CommentController.createComment);
router.delete(PATHS.COMMENT.COMMENT_BY_ID, authenticateToken, CommentController.deleteCommentById);

router.post(PATHS.LIKE.LIKES, authenticateToken, LikeController.likePost);
router.delete(PATHS.LIKE.LIKE_BY_ID, authenticateToken, LikeController.unlikePostById);

router.post(PATHS.FOLLOW.FOLLOW, authenticateToken, FollowController.followUser);
router.delete(PATHS.FOLLOW.UNFOLLOW_BY_ID, authenticateToken, FollowController.unfollowUser);
