import { githubService } from './github.service';
import { User, IUser } from '../models/user.model';

export class AuthService {
  async handleGithubCallback(code: string): Promise<{ user: IUser; accessToken: string }> {
    const accessToken = await githubService.getAccessToken(code);
    const profile = await githubService.getUserProfile(accessToken);

    const user = await User.findOneAndUpdate(
      { githubId: profile.githubId },
      {
        username: profile.username,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return { user, accessToken };
  }

  async getUserById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }
}

export const authService = new AuthService();
