// src/api/teamComments.ts

import apiClient from "./apiClient";
import type { TeamComment } from "../types";
import {
  createLocalTeamComment,
  readFrontOnlyStore,
  writeFrontOnlyStore,
} from "./frontOnlyStore";
import { isMockMode, isSupabaseConfigured, supabase, toNumericUserId } from "../lib/supabase";

const isFrontendOnlyMode = isMockMode;
const useSupabaseMode = isSupabaseConfigured && Boolean(supabase);

const mapSupabaseTeamComment = (row: any): TeamComment => ({
  teamCommentId: row.id,
  teamPostId: row.team_post_id,
  userId: row.user_numeric_id,
  content: row.content,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  parentId: row.parent_id,
  communityId: row.community_id,
  user: {
    nickname: row.nickname ?? "게스트",
    profileImage: row.profile_image ?? null,
  },
});

// =========================================================
// 팀 게시물 댓글 관련 API
// =========================================================
export const fetchTeamComments = async (
  communityId: string,
  teamPostId: number
) => {
  if (useSupabaseMode && supabase) {
    const { data, error } = await supabase
      .from("team_comments")
      .select("*")
      .eq("community_id", Number(communityId))
      .eq("team_post_id", teamPostId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSupabaseTeamComment);
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    return store.teamComments.filter(
      (comment) =>
        comment.teamPostId === teamPostId &&
        comment.communityId === Number(communityId)
    );
  }

  try {
    const response = await apiClient.get<{
      status: string;
      message: string;
      data: TeamComment[];
    }>(
      `/mypage/communities/team-posts/${teamPostId}/comments?communityId=${communityId}`
    );
    return response.data.data;
  } catch (error) {
    console.error(
      `Error fetching team comments for community ${communityId}, post ${teamPostId}:`,
      error
    );
    throw error;
  }
};

export const createTeamComment = async (
  communityId: string,
  teamPostId: number,
  userId: number,
  content: string,
  parentId: number | null
): Promise<TeamComment> => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error("로그인이 필요합니다.");
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, profile_image")
      .eq("id", authData.user.id)
      .maybeSingle();
    const { data, error } = await supabase
      .from("team_comments")
      .insert({
        community_id: Number(communityId),
        team_post_id: teamPostId,
        user_id: authData.user.id,
        user_numeric_id: toNumericUserId(authData.user.id),
        content,
        parent_id: parentId,
        nickname: profile?.nickname ?? "게스트",
        profile_image: profile?.profile_image ?? null,
      })
      .select("*")
      .single();
    if (error || !data) throw new Error(error?.message ?? "댓글 작성 실패");
    return mapSupabaseTeamComment(data);
  }

  if (isFrontendOnlyMode) {
    const created = createLocalTeamComment(teamPostId, content, parentId);
    const store = readFrontOnlyStore();
    const idx = store.teamComments.findIndex(
      (item) => item.teamCommentId === created.teamCommentId
    );
    if (idx >= 0) {
      store.teamComments[idx] = {
        ...store.teamComments[idx],
        communityId: Number(communityId),
        userId,
      };
      writeFrontOnlyStore(store);
      return store.teamComments[idx];
    }
    return created;
  }

  try {
    const response = await apiClient.post<{
      status: string;
      message: string;
      data: TeamComment;
      teamCommentId: number;
    }>(
      `/mypage/communities/team-posts/${teamPostId}/comments?communityId=${communityId}`,
      {
        userId,
        content,
        parentId,
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to create team comment:", error);
    throw error;
  }
};

export const updateTeamComment = async (
  communityId: string,
  teamCommentId: number,
  content: string
): Promise<void> => {
  if (useSupabaseMode && supabase) {
    const { error } = await supabase
      .from("team_comments")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", teamCommentId)
      .eq("community_id", Number(communityId));
    if (error) throw new Error(error.message);
    return;
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    const idx = store.teamComments.findIndex(
      (comment) =>
        comment.teamCommentId === teamCommentId &&
        comment.communityId === Number(communityId)
    );
    if (idx < 0) return;
    store.teamComments[idx] = {
      ...store.teamComments[idx],
      content,
      updatedAt: new Date().toISOString(),
    };
    writeFrontOnlyStore(store);
    return;
  }

  try {
    await apiClient.put(
      `/mypage/communities/team-comments/${teamCommentId}?communityId=${communityId}`,
      { content }
    );
  } catch (error) {
    console.error("Failed to update team comment:", error);
    throw error;
  }
};

export const deleteTeamComment = async (
  communityId: string,
  teamPostId: number,
  teamCommentId: number,
  userId: number
): Promise<void> => {
  if (useSupabaseMode && supabase) {
    const { error } = await supabase
      .from("team_comments")
      .delete()
      .eq("id", teamCommentId)
      .eq("community_id", Number(communityId))
      .eq("team_post_id", teamPostId)
      .eq("user_numeric_id", userId);
    if (error) throw new Error(error.message);
    return;
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    store.teamComments = store.teamComments.filter(
      (comment) =>
        !(
          comment.teamCommentId === teamCommentId &&
          comment.teamPostId === teamPostId &&
          comment.userId === userId &&
          comment.communityId === Number(communityId)
        )
    );
    writeFrontOnlyStore(store);
    return;
  }

  try {
    await apiClient.delete(
      `/mypage/communities/team-comments/${teamCommentId}?communityId=${communityId}&teamPostId=${teamPostId}`,
      { data: { userId } }
    );
  } catch (error) {
    console.error("Failed to delete team comment:", error);
    throw error;
  }
};
