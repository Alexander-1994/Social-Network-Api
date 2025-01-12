import type { Request, Response } from 'express';

import { prisma } from '../../prisma';
import { ERRORS } from '../constants';

export const PostController = {
  createPost: async (req: Request, res: Response) => {
    const { content } = req.body;
    const { userId = '' } = req.user ?? {};

    if (!content) {
      res.status(400).json({ error: ERRORS.INVALID_REQUEST_BODY });
      return;
    }

    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId: userId,
        },
      });

      res.json(post);
    } catch (error) {
      console.error('Error creating post', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
  getAllPosts: async (req: Request, res: Response) => {
    const { userId = '' } = req.user ?? {};

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
  getPostById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId = '' } = req.user ?? {};

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
        res.status(404).json({ error: ERRORS.POST_NOT_FOUND });
        return;
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
  deletePostById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId = '' } = req.user ?? {};

    try {
      const post = await prisma.post.findUnique({ where: { id } });

      if (!post) {
        res.status(404).json({ error: ERRORS.POST_NOT_FOUND });
        return;
      }

      if (post.authorId !== userId) {
        res.status(403).json({ error: ERRORS.NOT_ENOUGH_RIGHTS });
        return;
      }

      await prisma.$transaction([
        prisma.comment.deleteMany({ where: { postId: id } }),
        prisma.like.deleteMany({ where: { postId: id } }),
        prisma.post.delete({ where: { id } }),
      ]);

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting post by ID', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
};
