// API Routes
export const API_ROUTES = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/users/me',
  },
  // Posts
  POSTS: '/posts',
  POST: (slug: string) => `/posts/${slug}`,
  // Categories
  CATEGORIES: '/categories',
  CATEGORY: (id: string) => `/categories/${id}`,
  // Tags
  TAGS: '/tags',
  TAG: (id: string) => `/tags/${id}`,
  // Comments
  COMMENTS: '/comments',
  POST_COMMENTS: (slug: string) => `/posts/${slug}/comments`,
  // Works
  WORKS: '/works',
  WORK: (slug: string) => `/works/${slug}`,
  // Search
  SEARCH: '/search',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Post Status
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

// User Roles
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const;

// Error Codes
export const ERROR_CODES = {
  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  // Resource
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
