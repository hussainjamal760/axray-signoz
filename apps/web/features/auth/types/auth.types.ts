export interface UserProfile {
  id: string;
  githubId: string;
  username: string;
  email?: string;
  avatarUrl?: string;
}

export interface AuthMeResponse {
  authenticated: boolean;
  user: UserProfile | null;
}
