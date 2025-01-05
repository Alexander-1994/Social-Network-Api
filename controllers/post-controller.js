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
    res.send('getAllPosts');
  },
  getPostById: async (req, res) => {
    res.send('getPostById');
  },
  deletePostById: async (req, res) => {
    res.send('deletePostById');
  },
};
