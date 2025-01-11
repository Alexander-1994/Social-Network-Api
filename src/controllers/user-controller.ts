import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import bcryptjs from 'bcryptjs';
import jdenticon from 'jdenticon';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { prisma } from '../../prisma';
import { ERRORS } from '../constants';

dotenv.config();

export const UserController = {
  register: async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: ERRORS.INVALID_REQUEST_BODY });
      return;
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        res.status(400).json({ error: ERRORS.USER_ALREADY_EXISTS });
        return;
      }

      const hashedPassword = await bcryptjs.hash(password, 10);
      const png = jdenticon.toPng(`${name}${Date.now()}`, 200);
      const avatarName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, '/../../uploads', avatarName);

      fs.writeFileSync(avatarPath, png);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          avatarUrl: `/uploads/${avatarName}`,
        },
      });

      res.json(user);
    } catch (error) {
      console.error('Error in register', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: ERRORS.INVALID_REQUEST_BODY });
      return;
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        res.status(400).json({ error: ERRORS.INCORRECT_LOGIN_OR_PASSWORD });
        return;
      }

      /* Проверяем, что полученный password соответствует password пользователя из бд */
      const isValid = await bcryptjs.compare(password, user.password);

      if (!isValid) {
        res.status(400).json({ error: ERRORS.INCORRECT_LOGIN_OR_PASSWORD });
        return;
      }

      /* Т.к. полученные данные верны, создаём токен */
      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY || '');

      res.json({ token });
    } catch (error) {
      console.error('Error in login', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
  getUserById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId = '' } = req.user ?? {};

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          followers: true,
          following: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: ERRORS.USER_NOT_FOUND });
        return;
      }

      const isFollowing = !!(await prisma.follows.findFirst({
        where: { AND: [{ followerId: userId }, { followingId: id }] },
      }));

      res.json({ ...user, isFollowing });
    } catch (error) {
      console.error('Error getting user by ID', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
  updateUserById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, name, dateOfBirth, bio, location } = req.body;
    const { userId = '' } = req.user ?? {};

    let filePath;

    if (req.file?.path) {
      filePath = req.file.path;
    }

    if (id !== userId) {
      res.status(403).json({ error: ERRORS.NOT_ENOUGH_RIGHTS });
      return;
    }

    try {
      if (email) {
        const existingUser = await prisma.user.findFirst({ where: { email } });

        if (existingUser && existingUser.id !== id) {
          res.status(400).json({ error: ERRORS.EMAIL_ALREADY_IN_USE });
          return;
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: { email, name, dateOfBirth, bio, location, avatarUrl: filePath ? `/${filePath}` : undefined },
      });

      res.json(user);
    } catch (error) {
      console.error('Error updating user by ID', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
  current: async (req: Request, res: Response) => {
    const { userId = '' } = req.user ?? {};

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          followers: {
            include: {
              follower: true,
            },
          },
          following: {
            include: {
              following: true,
            },
          },
        },
      });

      if (!user) {
        res.status(400).json({ error: ERRORS.USER_NOT_FOUND });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Error in current', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
};
