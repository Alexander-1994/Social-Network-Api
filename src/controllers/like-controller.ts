import type { Request, Response } from 'express';

import { prisma } from '../../prisma';
import { ERRORS } from '../constants';

export const LikeController = {
  likePost: async (req: Request, res: Response) => {
    const { postId } = req.body;
    const { userId = '' } = req.user ?? {};

    if (!postId) {
      res.status(400).json({ error: ERRORS.INVALID_REQUEST_BODY });
      return;
    }

    try {
      const existingLike = await prisma.like.findFirst({ where: { postId, userId } });

      if (existingLike) {
        res.status(400).json({ error: ERRORS.LIKE_ALREADY_EXISTS });
        return;
      }

      const like = await prisma.like.create({ data: { postId, userId } });

      res.json(like);
    } catch (error) {
      console.error('Error creating like', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
  unlikePostById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId = '' } = req.user ?? {};

    try {
      const like = await prisma.like.findFirst({ where: { postId: id, userId } });

      if (!like) {
        res.status(404).json({ error: ERRORS.LIKE_NOT_FOUND });
        return;
      }

      if (like.userId !== userId) {
        res.status(403).json({ error: ERRORS.NOT_ENOUGH_RIGHTS });
        return;
      }

      await prisma.like.deleteMany({ where: { postId: id, userId } });

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting like by ID', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
};
