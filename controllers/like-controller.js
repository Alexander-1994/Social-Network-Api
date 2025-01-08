import { ERRORS } from '../constants/errors.js';
import { prisma } from '../prisma/prisma-client.js';

export const LikeController = {
  likePost: async (req, res) => {
    const { postId } = req.body;
    const { userId } = req.user;

    if (!postId) {
      return res.status(400).json({ error: ERRORS.INVALID_REQUEST_BODY });
    }

    try {
      const existingLike = await prisma.like.findFirst({ where: { postId, userId } });

      if (existingLike) {
        return res.status(400).json({ error: ERRORS.LIKE_ALREADY_EXISTS });
      }

      const like = await prisma.like.create({ data: { postId, userId } });

      res.json(like);
    } catch (error) {
      console.error('Error creating like', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
  unlikePostById: async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
      const like = await prisma.like.findFirst({ where: { postId: id, userId } });

      if (!like) {
        return res.status(404).json({ error: ERRORS.LIKE_NOT_FOUND });
      }

      if (like.userId !== userId) {
        return res.status(403).json({ error: ERRORS.NOT_ENOUGH_RIGHTS });
      }

      await prisma.like.deleteMany({ where: { postId: id, userId } });

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting like by ID', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
};
