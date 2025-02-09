export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  authorId: string;
  isAnonymous: boolean;
  status: 'pending' | 'answered' | 'closed';
  followUpCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  questionsCount: number;
  lastActive: string;
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  status?: 'active' | 'suspended' | 'deleted';
  search?: string;
  sortBy?: 'createdAt' | 'questionsCount' | 'lastActive';
  sortOrder?: 'asc' | 'desc';
}

export interface Notification {
  id: string;
  type: 'new_question' | 'follow_up' | 'system';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

export interface NotificationPreferences {
  email: {
    newQuestions: boolean;
    followUps: boolean;
    systemUpdates: boolean;
  };
  push: {
    newQuestions: boolean;
    followUps: boolean;
    systemUpdates: boolean;
  };
  desktop: {
    enabled: boolean;
    newQuestions: boolean;
    followUps: boolean;
    systemUpdates: boolean;
  };
}

export interface NavigationItem {
  label: string;
  href: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  children?: NavigationItem[];
}

export interface HeaderProps {
  currentPath?: string;
}

// Add any other types you need here 