import express, { json, urlencoded, static as fileStatic, Application, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import createError from 'http-errors';

import { router } from './routes';

export const app: Application = express();

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.set('view engine', 'jade');
// Раздавать статику из директории uploads
app.use('/uploads', fileStatic('uploads'));
app.use('/api', router);

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});
