export interface UserProfile {
  id: string;
  githubId: string;
  username: string;
  email?: string;
  avatarUrl?: string;
}

/** Mirrors the exact shape returned by GET /api/auth/me */
export interface CurrentUserResponse {
  authenticated: boolean;
  user: UserProfile | null;
}
