'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, fetchPaginated } from '../client';
import type { Post, PostListItem, PaginatedResponse } from '@repo/shared';

// Query Keys
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (slug: string) => [...postKeys.details(), slug] as const,
};

// 获取文章列表
interface PostListParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  tagId?: string;
  featured?: boolean;
  published?: boolean;
}

export function usePosts(params: PostListParams = {}) {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => fetchPaginated<PostListItem>('/posts', {
      page: params.page,
      limit: params.limit,
      categoryId: params.categoryId,
      tagId: params.tagId,
      featured: params.featured,
      published: params.published,
    }),
    staleTime: 1000 * 60 * 5, // 5 分钟
  });
}

// 获取文章详情
export function usePost(slug: string) {
  return useQuery({
    queryKey: postKeys.detail(slug),
    queryFn: () => apiClient.get<Post>(`/posts/${slug}`),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10, // 10 分钟
  });
}

// 获取精选文章
export function useFeaturedPosts(limit = 5) {
  return useQuery({
    queryKey: postKeys.list({ featured: true, limit }),
    queryFn: () => fetchPaginated<PostListItem>('/posts', {
      featured: true,
      published: true,
      limit,
    }),
    staleTime: 1000 * 60 * 5,
  });
}

// 创建文章（管理端使用）
interface CreatePostData {
  title: string;
  slug: string;
  content: string;
  summary?: string;
  categoryId?: string;
  tagIds?: string[];
  published?: boolean;
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => apiClient.post<Post>('/posts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

// 更新文章
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<CreatePostData>) =>
      apiClient.patch<Post>(`/posts/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.id) });
    },
  });
}

// 删除文章
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}
