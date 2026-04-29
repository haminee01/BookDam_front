// src/api/teamPosts.ts

import apiClient from "./apiClient";
import type { TeamPost } from "../types";
import {
  createLocalTeamPost,
  readFrontOnlyStore,
  writeFrontOnlyStore,
} from "./frontOnlyStore";
import { isMockMode, isSupabaseConfigured, supabase, toNumericUserId } from "../lib/supabase";

const isFrontendOnlyMode = isMockMode;
const useSupabaseMode = isSupabaseConfigured && Boolean(supabase);

const mapSupabaseTeamPostToTeamPost = (row: any): TeamPost => ({
  teamPostId: row.id,
  teamId: row.community_id,
  userId: row.user_numeric_id,
  title: row.title,
  content: row.content,
  type: row.type,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  user: {
    nickname: row.nickname ?? "게스트",
    profileImage: row.profile_image ?? null,
  },
  _count: { comments: row.comment_count ?? 0 },
});

// =========================================================
// 팀 게시물 관련 API
// =========================================================

/**
 * 특정 커뮤니티의 팀 게시물 목록을 조회합니다.
 * GET /api/communities/:communityId/posts
 * @param communityId - 팀 커뮤니티 ID
 * @param page - 페이지 번호
 * @param pageSize - 페이지당 항목 수
 * @param sort - 정렬 기준 (예: 'latest')
 * @returns 팀 게시물 목록 배열
 */
export const fetchTeamPosts = async (
  communityId: string,
  page: number = 1,
  pageSize: number = 10,
  sort: string = "latest"
): Promise<{ posts: TeamPost[]; totalResults: number }> => {
  if (useSupabaseMode && supabase) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await supabase
      .from("team_posts")
      .select("*", { count: "exact" })
      .eq("community_id", Number(communityId))
      .order("created_at", { ascending: sort !== "latest" })
      .range(from, to);
    if (error) throw new Error(error.message);
    return {
      posts: (data ?? []).map(mapSupabaseTeamPostToTeamPost),
      totalResults: count ?? 0,
    };
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    const all = store.teamPosts.filter(
      (post) => post.teamId === Number(communityId)
    );
    const start = (page - 1) * pageSize;
    const posts = all.slice(start, start + pageSize);
    return { posts, totalResults: all.length };
  }

  try {
    const response = await apiClient.get<{
      message: string;
      data: TeamPost[];
    }>(
      `/mypage/communities/${communityId}/posts?page=${page}&size=${pageSize}&sort=${sort}`
    );

    return {
      posts: response.data.data,
      totalResults: response.data.data.length,
    };
  } catch (error) {
    console.error("Failed to fetch team posts:", error);
    throw error;
  }
};

/**
 * 새로운 팀 게시물을 생성합니다.
 * POST /api/communities/:communityId/posts/write
 * @param communityId - 팀 커뮤니티 ID
 * @param postData - 생성할 게시물 데이터 { title, content, type? }
 * @returns 생성된 게시물 ID
 */
export const createTeamPost = async (
  communityId: string,
  postData: { title: string; content: string; type?: string }
): Promise<string> => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error("로그인이 필요합니다.");
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, profile_image")
      .eq("id", authData.user.id)
      .maybeSingle();
    const { data, error } = await supabase
      .from("team_posts")
      .insert({
        community_id: Number(communityId),
        user_id: authData.user.id,
        user_numeric_id: toNumericUserId(authData.user.id),
        title: postData.title,
        content: postData.content,
        type: postData.type ?? "DISCUSSION",
        nickname: profile?.nickname ?? "게스트",
        profile_image: profile?.profile_image ?? null,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "팀 게시물 생성 실패");
    return String(data.id);
  }

  if (isFrontendOnlyMode) {
    const post = createLocalTeamPost(
      communityId,
      postData.title,
      postData.content,
      postData.type
    );
    return post.teamPostId.toString();
  }

  try {
    const response = await apiClient.post<{
      status: string;
      message: string;
      postId: number;
    }>(`/mypage/communities/${communityId}/posts/write`, postData);
    return response.data.postId.toString();
  } catch (error) {
    console.error("Failed to create team post:", error);
    throw error;
  }
};

/**
 * 특정 팀 게시물 상세 정보를 조회합니다.
 * GET /api/communities/:communityId/posts/:teamPostId
 * @param communityId - 팀 커뮤니티 ID
 * @param teamPostId - 팀 게시물 ID (number)
 * @returns TeamPost 객체
 */
export const fetchTeamPostById = async (
  communityId: string,
  teamPostId: number
): Promise<TeamPost> => {
  if (useSupabaseMode && supabase) {
    const { data, error } = await supabase
      .from("team_posts")
      .select("*")
      .eq("id", teamPostId)
      .eq("community_id", Number(communityId))
      .single();
    if (error || !data) throw new Error("팀 게시물을 찾을 수 없습니다.");
    return mapSupabaseTeamPostToTeamPost(data);
  }

  if (isFrontendOnlyMode) {
    const post = readFrontOnlyStore().teamPosts.find(
      (item) =>
        item.teamPostId === teamPostId && item.teamId === Number(communityId)
    );
    if (!post) throw new Error("팀 게시물을 찾을 수 없습니다.");
    return post;
  }

  try {
    const response = await apiClient.get<{ message: string; data: TeamPost }>(
      `/mypage/communities/${communityId}/posts/${teamPostId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch team post by ID:", error);
    throw error;
  }
};

/**
 * 특정 팀 게시물을 수정합니다.
 * PUT /api/communities/:communityId/posts/:teamPostId
 * @param communityId - 팀 커뮤니티 ID
 * @param teamPostId - 수정할 팀 게시물 ID (number)
 * @param updateData - 업데이트할 데이터 { title?, content? }
 */
export const updateTeamPost = async (
  communityId: string,
  teamPostId: number,
  updateData: { title?: string; content?: string }
): Promise<void> => {
  if (useSupabaseMode && supabase) {
    const { error } = await supabase
      .from("team_posts")
      .update({
        title: updateData.title,
        content: updateData.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", teamPostId)
      .eq("community_id", Number(communityId));
    if (error) throw new Error(error.message);
    return;
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    const idx = store.teamPosts.findIndex(
      (post) =>
        post.teamPostId === teamPostId && post.teamId === Number(communityId)
    );
    if (idx < 0) return;
    store.teamPosts[idx] = {
      ...store.teamPosts[idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    writeFrontOnlyStore(store);
    return;
  }

  try {
    await apiClient.put(
      `/mypage/communities/${communityId}/posts/${teamPostId}`,
      updateData
    );
  } catch (error) {
    console.error("Failed to update team post:", error);
    throw error;
  }
};

/**
 * 특정 팀 게시물을 삭제합니다.
 * DELETE /api/communities/:communityId/posts/:teamPostId
 * @param communityId - 팀 커뮤니티 ID
 * @param teamPostId - 삭제할 팀 게시물 ID (number)
 */
export const deleteTeamPost = async (
  communityId: string,
  teamPostId: number
): Promise<void> => {
  if (useSupabaseMode && supabase) {
    const { error } = await supabase
      .from("team_posts")
      .delete()
      .eq("id", teamPostId)
      .eq("community_id", Number(communityId));
    if (error) throw new Error(error.message);
    return;
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    store.teamPosts = store.teamPosts.filter(
      (post) =>
        !(post.teamPostId === teamPostId && post.teamId === Number(communityId))
    );
    store.teamComments = store.teamComments.filter(
      (comment) => comment.teamPostId !== teamPostId
    );
    writeFrontOnlyStore(store);
    return;
  }

  try {
    await apiClient.delete(
      `/mypage/communities/${communityId}/posts/${teamPostId}`
    );
  } catch (error) {
    console.error("Failed to delete team post:", error);
    throw error;
  }
};
