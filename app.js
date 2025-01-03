import express, { json, urlencoded, static as fileStatic } from 'express';
import fs from 'fs';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import createError from 'http-errors';

import { router } from './routes/router.js';

export const app = express();

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.set('view engine', 'jade');
// Раздавать статику из директории uploads
app.use('./uploads', fileStatic('uploads'));

app.use('/api', router);

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
