import { ERRORS } from '../constants/errors.js';
import { prisma } from '../prisma/prisma-client.js';

export const PostController = {
  createPost: async (req, res) => {
    const { content } = req.body;
    const authorId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: ERRORS.INVALID_REQUEST_BODY });
    }

    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId,
        },
      });

      res.json(post);
    } catch (error) {
      console.error('Error creating post', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
  getAllPosts: async (req, res) => {
    const { userId } = req.user;

    try {
      const posts = await prisma.post.findMany({
        include: {
          likes: true,
          author: true,
          comments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const postWithLikeInfo = posts.map((post) => ({
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      }));

      res.json(postWithLikeInfo);
    } catch (error) {
      console.error('Error getting all posts', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
  getPostById: async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
      const post = await prisma.post.findUnique({
        where: {
          id,
        },
        include: {
          likes: true,
          author: true,
          comments: {
            include: { user: true },
          },
        },
      });

      if (!post) {
        return res.status(404).json({ error: ERRORS.POST_NOT_FOUND });
      }

      const postWithLikeInfo = {
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      };

      res.json(postWithLikeInfo);
    } catch (error) {
      console.error('Error getting post by ID', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
  deletePostById: async (req, res) => {
    res.send('deletePostById');
  },
};
