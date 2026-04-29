// src/pages/posts/PostWritePage.tsx

import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PostWriteTemplate from "../../components/posts/PostWriteTemplate";
import { createPost, createRecruitmentPost } from "../../api/posts";
import { createTeamPost } from "../../api/teamPosts";

import { PostType, TeamPostType } from "../../types";

const PostWritePage: React.FC = () => {
  const { communityId } = useParams<{ communityId?: string }>();
  const navigate = useNavigate();
  const { currentUserProfile, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const isCommunityPost = !!communityId;

  const createGeneralPostMutation = useMutation({
    mutationFn: async (formData: {
      title: string;
      content: string;
      type: PostType;
    }) => {
      const postId = await createPost({
        title: formData.title,
        content: formData.content,
        type: formData.type as PostType,
      });
      return postId;
    },
    onSuccess: (postId) => {
      showToast("게시물이 성공적으로 작성되었습니다.", "success");
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      navigate(`/posts/${postId}`);
    },
    onError: (err: Error) => {
      showToast(
        `게시물 작성 중 오류가 발생했습니다: ${
          err.message || "알 수 없는 오류"
        }`,
        "error"
      );
    },
  });

  const createRecruitmentPostMutation = useMutation({
    mutationFn: async (formData: {
      title: string;
      content: string;
      type: PostType;
      communityId: string;
    }) => {
      const postId = await createRecruitmentPost({
        title: formData.title,
        content: formData.content,
        type: formData.type,
        communityId: formData.communityId,
      });
      return postId;
    },
    onSuccess: (postId) => {
      showToast("모집글이 성공적으로 작성되었습니다.", "success");
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      navigate(`/posts/${postId}`);
    },
    onError: (err: Error) => {
      showToast(
        `모집글 작성 중 오류가 발생했습니다: ${
          err.message || "알 수 없는 오류"
        }`,
        "error"
      );
    },
  });

  const createTeamPostMutation = useMutation({
    mutationFn: async (formData: {
      title: string;
      content: string;
      type?: TeamPostType;
    }) => {
      if (!communityId) {
        throw new Error("커뮤니티 ID가 없습니다.");
      }
      const postId = await createTeamPost(communityId, {
        title: formData.title,
        content: formData.content,
        type: formData.type as TeamPostType,
      });
      return postId;
    },
    onSuccess: (postId) => {
      showToast("팀 게시물이 성공적으로 작성되었습니다.", "success");
      queryClient.invalidateQueries({ queryKey: ["teamPosts", communityId] });
      navigate(`/communities/${communityId}/posts/${postId}`);
    },
    onError: (err: Error) => {
      showToast(
        `팀 게시물 작성 중 오류가 발생했습니다: ${
          err.message || "알 수 없는 오류"
        }`,
        "error"
      );
    },
  });

  const handlePostSubmit = useCallback(
    async (formData: {
      title: string;
      content: string;
      type?: PostType | TeamPostType;
      communityId?: string;
    }) => {
      if (!currentUserProfile || authLoading) {
        showToast("로그인이 필요합니다.", "warn");
        navigate("/auth/login");
        return;
      }

      if (formData.type === PostType.RECRUITMENT) {
        if (!formData.communityId) {
          showToast("연결할 커뮤니티를 선택해주세요.", "warn");
          return;
        }
        createRecruitmentPostMutation.mutate({
          title: formData.title,
          content:
            formData.content + `\n\n[커뮤니티 ID: ${formData.communityId}]`,
          type: formData.type,
          communityId: formData.communityId,
        });
      } else if (isCommunityPost) {
        createTeamPostMutation.mutate({
          title: formData.title,
          content: formData.content,
          type: formData.type as TeamPostType,
        });
      } else {
        createGeneralPostMutation.mutate({
          title: formData.title,
          content: formData.content,
          type: formData.type as PostType,
        });
      }
    },
    [
      currentUserProfile,
      authLoading,
      isCommunityPost,
      createGeneralPostMutation,
      createTeamPostMutation,
      createRecruitmentPostMutation,
      showToast,
      navigate,
    ]
  );

  const handleCancel = useCallback(() => {
    if (isCommunityPost) {
      navigate(`/communities/${communityId}/posts`);
    } else {
      navigate("/posts");
    }
  }, [isCommunityPost, navigate, communityId]);

  const isLoading =
    createGeneralPostMutation.isPending ||
    createTeamPostMutation.isPending ||
    createRecruitmentPostMutation.isPending;
  const error = createGeneralPostMutation.isError
    ? createGeneralPostMutation.error?.message || "오류 발생"
    : createTeamPostMutation.isError
    ? createTeamPostMutation.error?.message || "오류 발생"
    : createRecruitmentPostMutation.isError
    ? createRecruitmentPostMutation.error?.message || "오류 발생"
    : null;

  return (
    <PostWriteTemplate
      onSubmit={handlePostSubmit}
      onCancel={handleCancel}
      loading={isLoading}
      error={error}
      submitButtonText={communityId ? "팀 게시물 등록" : "게시물 등록"}
      isCommunityPost={!!communityId}
      initialData={{ title: "", content: "" }}
    />
  );
};

export default PostWritePage;
