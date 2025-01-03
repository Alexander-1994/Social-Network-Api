import path from 'path';
import fs from 'fs';
import bcryptjs from 'bcryptjs';
import * as jdenticon from 'jdenticon';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { __dirname, ERRORS } from '../constants/index.js';
import { prisma } from '../prisma/prisma-client.js';

dotenv.config();

export const UserController = {
  register: async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: ERRORS.INVALID_REQUEST_BODY });
    }

    try {
      /* Проверяем наличие email в бд */
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ error: ERRORS.USER_ALREADY_EXISTS });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);
      const png = jdenticon.toPng(name, 200);
      const avatarName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, '../uploads', avatarName);

      fs.writeFileSync(avatarPath, png);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          avatarUrl: `/uploads/${avatarPath}`,
        },
      });

      res.json(user);
    } catch (error) {
      console.error('Error in register', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: ERRORS.INVALID_REQUEST_BODY });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(400).json({ error: ERRORS.INCORRECT_LOGIN_OR_PASSWORD });
      }

      /* Проверяем, что полученный password соответствует password пользователя из бд */
      const isValid = await bcryptjs.compare(password, user.password);

      if (!isValid) {
        return res.status(400).json({ error: ERRORS.INCORRECT_LOGIN_OR_PASSWORD });
      }

      /* Т.к. полученные данные верны, создаём токен */
      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);

      res.json({ token });
    } catch (error) {
      console.error('Error in login', error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
  getUserById: async (req, res) => {
    res.send('getUserById');
  },
  updateUser: async (req, res) => {
    res.send('updateUser');
  },
  current: async (req, res) => {
    res.send('current');
  },
};
