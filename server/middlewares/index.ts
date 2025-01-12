import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { ERRORS } from '../constants';

/** Мидлвара для проверки авторицации пользователя */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  /* извлекаем сам токен из заголовка (т.к. используем Bearer-токен)  */
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: ERRORS.USER_NOT_AUTHORIZED });
    return;
  }

  jwt.verify(token, process.env.SECRET_KEY ?? '', (err, user) => {
    if (err) {
      res.status(403).json({ error: ERRORS.INVALID_TOKEN });
      return;
    }

    req.user = user as Request['user'];
    next();
  });
};
