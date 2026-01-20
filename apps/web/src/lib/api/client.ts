import type { ApiResponse, PaginatedResponse, ApiError } from '@repo/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * API 错误类
 */
export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * 请求配置
 */
interface RequestConfig extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * 构建 URL 带查询参数
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(endpoint, API_BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * 核心请求函数
 */
async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { body, params, headers: customHeaders, ...restConfig } = config;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // 添加 token（如果存在）
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildUrl(endpoint, params), {
    ...restConfig,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 处理空响应
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    throw new ApiClientError(
      response.status,
      error.code || 'UNKNOWN_ERROR',
      error.message || 'An error occurred',
      error.details
    );
  }

  // 返回 data 字段（统一响应格式）
  return (data as ApiResponse<T>).data ?? data;
}

/**
 * API 客户端
 */
export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

/**
 * 分页请求辅助函数
 */
export async function fetchPaginated<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<PaginatedResponse<T>> {
  return request<PaginatedResponse<T>>(endpoint, { method: 'GET', params });
}

export default apiClient;
