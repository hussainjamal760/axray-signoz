import { getAccessToken, getUserProfile } from './github.service';
import { User, IUser } from '../models/user.model';

export const handleGithubCallback = async (code: string): Promise<{ user: IUser; accessToken: string }> => {
  const accessToken = await getAccessToken(code);
  const profile = await getUserProfile(accessToken);

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
};

export const getUserById = async (id: string): Promise<IUser | null> => {
  return User.findById(id);
};
