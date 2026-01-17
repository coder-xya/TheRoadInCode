// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

// Post Types
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  coverImage?: string;
  published: boolean;
  featured: boolean;
  views: number;
  author: User;
  authorId: string;
  category?: Category;
  categoryId?: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  coverImage?: string;
  published: boolean;
  featured: boolean;
  views: number;
  author: Pick<User, 'id' | 'username' | 'avatar'>;
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
  tags: Pick<Tag, 'id' | 'name' | 'slug'>[];
  createdAt: string;
  publishedAt?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Tag Types
export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  author?: User;
  authorId?: string;
  guestName?: string;
  guestEmail?: string;
  postId: string;
  parentId?: string;
  replies?: Comment[];
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Work Types
export interface Work {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  coverImage?: string;
  demoUrl?: string;
  sourceUrl?: string;
  techStack: string[];
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
