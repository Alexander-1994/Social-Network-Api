import type { Request, Response } from 'express';

import { prisma } from '../../prisma';
import { ERRORS } from '../constants';

export const CommentController = {
  createComment: async (req: Request, res: Response) => {
    const { postId, content } = req.body;
    const { userId = '' } = req.user ?? {};

    if (!postId || !content) {
      res.status(400).json({ error: ERRORS.INVALID_REQUEST_BODY });
      return;
    }

    try {
      const comment = await prisma.comment.create({
        data: {
          postId,
          userId,
          content,
        },
      });

      res.json(comment);
    } catch (error) {
      console.error('Error creating comment', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
  deleteCommentById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId = '' } = req.user ?? {};

    try {
      const comment = await prisma.comment.findUnique({ where: { id } });

      if (!comment) {
        res.status(404).json({ error: ERRORS.COMMENT_NOT_FOUND });
        return;
      }

      if (comment.userId !== userId) {
        res.status(403).json({ error: ERRORS.NOT_ENOUGH_RIGHTS });
        return;
      }

      await prisma.comment.delete({ where: { id } });

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting comment by ID', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
};
