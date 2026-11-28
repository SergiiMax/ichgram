export interface CurrentUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  bio: string;
  website: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  avatarUrl: string | null;
}
