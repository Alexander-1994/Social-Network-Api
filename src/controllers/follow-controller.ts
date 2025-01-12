import type { Request, Response } from 'express';

import { prisma } from '../../prisma';
import { ERRORS } from '../constants';

export const FollowController = {
  followUser: async (req: Request, res: Response) => {
    const { followingId } = req.body;
    const { userId = '' } = req.user ?? {};

    if (!followingId) {
      res.status(400).json({ error: ERRORS.INVALID_REQUEST_BODY });
      return;
    }

    if (followingId === userId) {
      res.status(500).json({ error: ERRORS.UNAVAILABLE_OPERATION });
      return;
    }

    try {
      const existingFollow = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      });

      if (existingFollow) {
        res.status(400).json({ error: ERRORS.SUBSCRIPTION_ALREADY_EXISTS });
        return;
      }

      await prisma.follows.create({
        data: { follower: { connect: { id: userId } }, following: { connect: { id: followingId } } },
      });

      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error in follow', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
  unfollowUser: async (req: Request, res: Response) => {
    const { followingId } = req.params;
    const { userId = '' } = req.user ?? {};

    try {
      const follows = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      });

      if (!follows) {
        res.status(404).json({ error: ERRORS.SUBSCRIPTION_NOT_FOUND });
        return;
      }

      await prisma.follows.delete({ where: { id: follows.id } });

      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error in unfollow', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
};
