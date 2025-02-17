export type UserRole = 'PARTICIPANT' | 'EXPERT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  roles: UserRole[];
  display_name: string;
  created_at: string;
  post_count: number;
} 