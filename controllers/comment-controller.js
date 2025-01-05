import { ERRORS } from '../constants/errors.js';
import { prisma } from '../prisma/prisma-client.js';

export const CommentController = {
  createComment: async (req, res) => {
    const { postId, content } = req.body;
    const { userId } = req.user;

    if (!postId || !content) {
      return res.status(400).json({ error: ERRORS.INVALID_REQUEST_BODY });
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
  deleteCommentById: async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
      const comment = await prisma.comment.findUnique({ where: { id } });

      if (!comment) {
        return res.status(404).json({ error: ERRORS.COMMENT_NOT_FOUND });
      }

      if (comment.userId !== userId) {
        return res.status(403).json({ error: ERRORS.NOT_ENOUGH_RIGHTS });
      }

      await prisma.comment.delete({ where: { id } });

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting comment by ID', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
};
