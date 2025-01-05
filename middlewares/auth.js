import jwt from 'jsonwebtoken';

import { ERRORS } from '../constants/index.js';

/** Мидлвара для проверки авторицации пользователя */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  /* извлекаем сам токен из заголовка (т.к. используем Bearer-токен)  */
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: ERRORS.USER_IS_NOT_AUTHORIZED });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: ERRORS.INVALID_TOKEN });
    }

    req.user = user;
    next();
  });
};
