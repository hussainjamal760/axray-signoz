import { Request, Response, NextFunction } from 'express';
import { githubService } from '../services/github.service';
import { authService } from '../services/auth.service';
import { config } from '../config';

export class AuthController {
  login = (req: Request, res: Response): void => {
    const authUrl = githubService.getAuthUrl();
    res.redirect(authUrl);
  };

  callback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        res.status(400).json({ error: 'Code parameter is required and must be a string' });
        return;
      }

      const { user, accessToken } = await authService.handleGithubCallback(code);

      req.session.userId = user._id.toString();
      req.session.githubAccessToken = accessToken;

      // Save session explicitly before redirecting to avoid race conditions
      req.session.save((err: any) => {
        if (err) {
          return next(err);
        }
        res.redirect(`${config.FRONTEND_URL}/dashboard`);
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.session || !req.session.userId) {
        res.json({ authenticated: false, user: null });
        return;
      }

      const user = await authService.getUserById(req.session.userId);
      if (!user) {
        req.session.destroy(() => {
          res.json({ authenticated: false, user: null });
        });
        return;
      }

      res.json({
        authenticated: true,
        user: {
          id: user._id.toString(),
          githubId: user.githubId,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  logout = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session) {
      res.json({ success: true });
      return;
    }

    req.session.destroy((err: any) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  };
}

export const authController = new AuthController();
