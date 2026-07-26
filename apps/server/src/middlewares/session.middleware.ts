import session from 'express-session';
import MongoStore from 'connect-mongo';
import { config } from '../config';

export const sessionMiddleware = session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.MONGO_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60, // 14 days
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
  },
});
