// src/api/comments.ts

import apiClient from "./apiClient";
import type { Comment, TeamComment } from "../types";
import {
  createLocalComment,
  getCurrentUserId,
  readFrontOnlyStore,
  writeFrontOnlyStore,
} from "./frontOnlyStore";
import { isMockMode, isSupabaseConfigured, supabase, toNumericUserId } from "../lib/supabase";

const isFrontendOnlyMode = isMockMode;
const useSupabaseMode = isSupabaseConfigured && Boolean(supabase);

const mapSupabaseCommentToComment = (row: any): Comment => ({
  commentId: row.id,
  postId: row.post_id,
  userId: row.user_numeric_id,
  content: row.content,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  parentId: row.parent_id,
  user: {
    nickname: row.nickname ?? "게스트",
    profileImage: row.profile_image ?? null,
  },
});

export interface MyCommentsResponse {
  message: string;
  data: {
    comments: (Comment | TeamComment)[];
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

// =========================================================
// 일반 게시물 댓글 관련 API
// =========================================================

export const fetchCommentsByPost = async (
  postId: number,
  page?: number,
  size?: number,
  sort?: string
): Promise<Comment[]> => {
  if (useSupabaseMode && supabase) {
    let query = supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: sort !== "latest" });
    if (page && size) {
      const from = (page - 1) * size;
      const to = from + size - 1;
      query = query.range(from, to);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSupabaseCommentToComment);
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    return store.comments.filter((comment) => comment.postId === postId);
  }

  try {
    let url = `/posts/${postId}/comments`;
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (size) params.append("size", size.toString());
    if (sort) params.append("sort", sort);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await apiClient.get<{
      message: string;
      data: Comment[];
    }>(url);
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch comments by post:", error);
    throw error;
  }
};

export const createComment = async (
  postId: number,
  commentData: { userId: number; content: string; parentId: number | null }
): Promise<Comment> => {
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
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        user_numeric_id: toNumericUserId(user.id),
        content: commentData.content,
        parent_id: commentData.parentId,
        nickname: profile?.nickname ?? "게스트",
        profile_image: profile?.profile_image ?? null,
      })
      .select("*")
      .single();
    if (error || !data) throw new Error(error?.message ?? "댓글 생성 실패");
    return mapSupabaseCommentToComment(data);
  }

  if (isFrontendOnlyMode) {
    return createLocalComment(postId, commentData.content, commentData.parentId);
  }

  try {
    const response = await apiClient.post<{
      status: string;
      message: string;
      commentId: number;
    }>(`/posts/${postId}/comments`, commentData);

    const fetchedComment = await apiClient.get<{
      status: string;
      message: string;
      data: Comment;
    }>(`/comments/${response.data.commentId}`);
    return fetchedComment.data.data;
  } catch (error) {
    console.error("Failed to create comment:", error);
    throw error;
  }
};

export const updateComment = async (
  commentId: number,
  updateData: { content: string; userId: number }
): Promise<void> => {
  if (useSupabaseMode && supabase) {
    const { error } = await supabase
      .from("comments")
      .update({
        content: updateData.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .eq("user_numeric_id", updateData.userId);
    if (error) throw new Error(error.message);
    return;
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    const idx = store.comments.findIndex((comment) => comment.commentId === commentId);
    if (idx < 0) return;
    if (store.comments[idx].userId !== updateData.userId) return;
    store.comments[idx] = {
      ...store.comments[idx],
      content: updateData.content,
      updatedAt: new Date().toISOString(),
    };
    writeFrontOnlyStore(store);
    return;
  }

  try {
    await apiClient.put(`/comments/${commentId}`, updateData);
  } catch (error) {
    console.error("Failed to update comment:", error);
    throw error;
  }
};

export const deleteComment = async (
  commentId: number,
  userId: number
): Promise<void> => {
  if (useSupabaseMode && supabase) {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_numeric_id", userId);
    if (error) throw new Error(error.message);
    return;
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    store.comments = store.comments.filter(
      (comment) => !(comment.commentId === commentId && comment.userId === userId)
    );
    writeFrontOnlyStore(store);
    return;
  }

  try {
    await apiClient.delete(`/comments/${commentId}`, { data: { userId } });
  } catch (error) {
    console.error("Failed to delete comment:", error);
    throw error;
  }
};

// =========================================================
// 마이페이지 - 내가 작성한 댓글 관련 API
// =========================================================

export const fetchMyComments = async (
  page: number = 1,
  pageSize: number = 10,
  sort: string = "latest"
): Promise<MyCommentsResponse> => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      return {
        message: "ok",
        data: {
          comments: [],
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
      .from("comments")
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
        comments: (data ?? []).map(mapSupabaseCommentToComment) as (Comment | TeamComment)[],
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
    const mine = store.comments.filter((comment) => comment.userId === getCurrentUserId());
    const start = (page - 1) * pageSize;
    const sliced = mine.slice(start, start + pageSize);
    const totalPages = Math.max(1, Math.ceil(mine.length / pageSize));
    return {
      message: "ok",
      data: {
        comments: sliced as (Comment | TeamComment)[],
        pagination: {
          currentPage: page,
          pageSize,
          totalCount: mine.length,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    };
  }

  const response = await apiClient.get<MyCommentsResponse>(
    `/mypage/my-comments`,
    {
      params: { page, size: pageSize, sort },
    }
  );
  return response.data;
};
