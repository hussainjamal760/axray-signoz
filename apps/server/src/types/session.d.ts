import 'express-session';

declare module 'express-session' {
  interface SessionData {
    githubAccessToken?: string;
    userId?: string;
  }
}
