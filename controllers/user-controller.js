import path from "path";
import fs from "fs";
import bcryptjs from "bcryptjs";
import { toPng } from "jdenticon";

import { __dirname, ERRORS } from "../constants/index.js";
import { prisma } from "../prisma/prisma-client.js";

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
      const png = toPng(name, 200);
      const avatarName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, "../uploads", avatarName);

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
      console.error("Error in register", error);
      res.status(500).json({ error: ERRORS.INTERVAL_SERVER_ERROR });
    }
  },
  login: async (req, res) => {
    res.send("login");
  },
  getUserById: async (req, res) => {
    res.send("getUserById");
  },
  updateUser: async (req, res) => {
    res.send("updateUser");
  },
  current: async (req, res) => {
    res.send("current");
  },
};
