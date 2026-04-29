// src/api/posts.ts

import apiClient from "./apiClient";
import type { Post, PostType, TeamPost } from "../types";
import {
  createLocalPost,
  getCurrentUserId,
  readFrontOnlyStore,
  writeFrontOnlyStore,
} from "./frontOnlyStore";
import { isMockMode, isSupabaseConfigured, supabase, toNumericUserId } from "../lib/supabase";

const isFrontendOnlyMode = isMockMode;
const useSupabaseMode = isSupabaseConfigured && Boolean(supabase);

const mapSupabasePostToPost = (row: any): Post => ({
  postId: row.id,
  userId: row.user_numeric_id ?? 0,
  title: row.title,
  content: row.content,
  type: row.type,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  user: {
    nickname: row.nickname ?? "게스트",
    profileImage: row.profile_image ?? null,
  },
  _count: {
    comments: row.comment_count ?? 0,
  },
});

// =========================================================
// 일반 게시물 관련 API
// =========================================================

export const createPost = async (postData: {
  title: string;
  content: string;
  type?: PostType;
}): Promise<string> => {
  if (useSupabaseMode && supabase) {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) throw new Error("로그인이 필요합니다.");
    const user = authData.user;
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, profile_image")
      .eq("id", user.id)
      .maybeSingle();
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        user_numeric_id: toNumericUserId(user.id),
        nickname: profile?.nickname ?? "게스트",
        profile_image: profile?.profile_image ?? null,
        title: postData.title,
        content: postData.content,
        type: postData.type ?? "GENERAL",
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "게시물 생성 실패");
    return String(data.id);
  }

  if (isFrontendOnlyMode) {
    const post = createLocalPost(postData.title, postData.content, postData.type ?? "GENERAL");
    return post.postId.toString();
  }

  try {
    const response = await apiClient.post<{
      status: string;
      message: string;
      postId: number;
    }>(`/posts/write`, postData);
    return response.data.postId.toString();
  } catch (error) {
    console.error("Failed to create post:", error);
    throw error;
  }
};

export const createRecruitmentPost = async (postData: {
  title: string;
  content: string;
  type: PostType;
  communityId: string;
}): Promise<string> => {
  if (useSupabaseMode && supabase) {
    return createPost({
      title: postData.title,
      content: postData.content,
      type: postData.type ?? "RECRUITMENT",
    });
  }

  if (isFrontendOnlyMode) {
    const post = createLocalPost(postData.title, postData.content, postData.type ?? "RECRUITMENT");
    return post.postId.toString();
  }

  try {
    const response = await apiClient.post<{
      status: string;
      message: string;
      postId: number;
    }>(`/posts/write`, postData);
    return response.data.postId.toString();
  } catch (error) {
    console.error("Failed to create recruitment post:", error);
    throw error;
  }
};

/**
 * 모든 일반 게시물 목록을 조회합니다. (일반 게시판용)
 * GET /api/posts
 * @param page - 페이지 번호
 * @param pageSize - 페이지당 항목 수
 * @param sort - 정렬 기준 (예: 'latest')
 * @param type - 게시물 타입 필터 ('GENERAL', 'RECRUITMENT', 또는 undefined/null이면 전체)
 * @returns 게시물 목록 배열 및 총 결과 수
 */
export const fetchAllPosts = async (
  page: number = 1,
  pageSize: number = 10,
  sort: string = "latest",
  type?: "GENERAL" | "RECRUITMENT"
): Promise<{ posts: Post[]; totalResults: number }> => {
  if (useSupabaseMode && supabase) {
    let query = supabase
      .from("posts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: sort !== "latest" });
    if (type) query = query.eq("type", type);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) throw new Error(error.message);
    return {
      posts: (data ?? []).map(mapSupabasePostToPost),
      totalResults: count ?? 0,
    };
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    const filtered = type
      ? store.posts.filter((post) => post.type === type)
      : store.posts;
    const start = (page - 1) * pageSize;
    const posts = filtered.slice(start, start + pageSize);
    return { posts, totalResults: filtered.length };
  }

  try {
    let url = `/posts?page=${page}&pageSize=${pageSize}&sort=${sort}`;

    if (type) {
      url += `&type=${type}`;
    }

    const response = await apiClient.get<{
      message: string;
      data: Post[];
    }>(url);

    return {
      posts: response.data.data,
      totalResults: response.data.data.length,
    };
  } catch (error) {
    console.error("Failed to fetch all posts:", error);
    throw error;
  }
};

/**
 * 특정 일반 게시물 상세 정보를 조회합니다.
 * GET /api/posts/:postId
 * @param postId - 게시물 ID (number)
 * @returns Post 객체
 */
export const fetchPostById = async (postId: number): Promise<Post> => {
  if (useSupabaseMode && supabase) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();
    if (error || !data) throw new Error("게시물을 찾을 수 없습니다.");
    return mapSupabasePostToPost(data);
  }

  if (isFrontendOnlyMode) {
    const post = readFrontOnlyStore().posts.find((item) => item.postId === postId);
    if (!post) throw new Error("게시물을 찾을 수 없습니다.");
    return post;
  }

  try {
    const response = await apiClient.get<{ message: string; data: Post }>(
      `/posts/${postId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch post by ID:", error);
    throw error;
  }
};

/**
 * 특정 일반 게시물을 수정합니다.
 * PUT /api/posts/:postId
 * @param postId - 수정할 게시물 ID (number)
 * @param updateData - 업데이트할 데이터 { title?, content? }
 */
export const updatePost = async (
  postId: number,
  updateData: { title?: string; content?: string }
): Promise<void> => {
  if (useSupabaseMode && supabase) {
    const { error } = await supabase
      .from("posts")
      .update({
        title: updateData.title,
        content: updateData.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);
    if (error) throw new Error(error.message);
    return;
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    const idx = store.posts.findIndex((post) => post.postId === postId);
    if (idx < 0) return;
    store.posts[idx] = {
      ...store.posts[idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    writeFrontOnlyStore(store);
    return;
  }

  try {
    await apiClient.put(`/posts/${postId}`, updateData);
  } catch (error) {
    console.error("Failed to update post:", error);
    throw error;
  }
};

/**
 * 특정 일반 게시물을 삭제합니다.
 * DELETE /api/posts/:postId
 * @param postId - 삭제할 게시물 ID (number)
 * @param userId - 삭제를 요청하는 사용자 ID (권한 확인용)
 */
export const deletePost = async (
  postId: number,
  userId: number
): Promise<void> => {
  if (useSupabaseMode && supabase) {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) throw new Error(error.message);
    return;
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    store.posts = store.posts.filter((post) => !(post.postId === postId && post.userId === userId));
    store.comments = store.comments.filter((comment) => comment.postId !== postId);
    writeFrontOnlyStore(store);
    return;
  }

  try {
    await apiClient.delete(`/posts/${postId}`, { data: { userId } });
  } catch (error) {
    console.error("Failed to delete post:", error);
    throw error;
  }
};

/**
 * 특정 모집 게시글만 삭제합니다. (커뮤니티는 유지)
 * DELETE /api/posts/:postId/recruitment-only
 * @param postId - 삭제할 게시물 ID (number)
 * @param userId - 삭제를 요청하는 사용자 ID (권한 확인용)
 */
export const deleteRecruitmentPost = async (
  postId: number,
  userId: number
): Promise<void> => {
  if (useSupabaseMode && supabase) {
    return deletePost(postId, userId);
  }

  if (isFrontendOnlyMode) {
    return deletePost(postId, userId);
  }

  try {
    await apiClient.delete(`/posts/${postId}/recruitment-only`, {
      data: { userId },
    });
  } catch (error) {
    console.error("Failed to delete recruitment post:", error);
    throw error;
  }
};

export interface MyPostsResponse {
  message: string;
  data: {
    posts: (Post | TeamPost)[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export const fetchMyPosts = async (
  page: number = 1,
  pageSize: number = 10,
  sort: string = "latest"
): Promise<MyPostsResponse> => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      return {
        message: "ok",
        data: {
          posts: [],
          pagination: {
            currentPage: page,
            pageSize,
            totalCount: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      };
    }
    const userNumericId = toNumericUserId(authData.user.id);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await supabase
      .from("posts")
      .select("*", { count: "exact" })
      .eq("user_numeric_id", userNumericId)
      .order("created_at", { ascending: sort !== "latest" })
      .range(from, to);
    if (error) throw new Error(error.message);
    const totalCount = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    return {
      message: "ok",
      data: {
        posts: (data ?? []).map(mapSupabasePostToPost) as (Post | TeamPost)[],
        pagination: {
          currentPage: page,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    };
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    const myPosts = store.posts.filter((post) => post.userId === getCurrentUserId());
    const start = (page - 1) * pageSize;
    const sliced = myPosts.slice(start, start + pageSize);
    const totalPages = Math.max(1, Math.ceil(myPosts.length / pageSize));
    return {
      message: "ok",
      data: {
        posts: sliced as (Post | TeamPost)[],
        pagination: {
          currentPage: page,
          pageSize,
          totalCount: myPosts.length,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    };
  }

  const response = await apiClient.get<MyPostsResponse>(`/mypage/my-posts`, {
    params: { page, size: pageSize, sort },
  });
  return response.data;
};
