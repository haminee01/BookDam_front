// src/pages/posts/PostDetailPage.tsx

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../hooks/useToast";
import PostDetailTemplate from "../../components/posts/PostDetailTemplate";
import CommentList from "../../components/comments/CommentList";
import type {
  Post,
  Comment,
  TeamPost,
  TeamComment,
  Community,
} from "../../types";
import CommentInput, {
  type CommentInputRef,
} from "../../components/comments/CommentInput";

import {
  fetchPostById,
  updatePost,
  deletePost,
  deleteRecruitmentPost,
} from "../../api/posts";
import {
  fetchTeamPostById,
  updateTeamPost,
  deleteTeamPost,
} from "../../api/teamPosts";
import {
  createComment,
  fetchCommentsByPost,
  updateComment,
  deleteComment,
} from "../../api/comments";
import {
  createTeamComment,
  fetchTeamComments,
  updateTeamComment,
  deleteTeamComment,
} from "../../api/teamComments";
import {
  fetchMyRecruitingCommunities,
  fetchCommunityById,
} from "../../api/communities";

const getCommentActualId = (comment: Comment | TeamComment): number | null => {
  if ("commentId" in comment) {
    return comment.commentId;
  }
  if ("teamCommentId" in comment) {
    return comment.teamCommentId;
  }
  return null;
};

const recursivelyAssignDepth = (
  comments: (Comment | TeamComment)[],
  currentDepth: number = 0
): (Comment | TeamComment)[] => {
  return comments.map((comment) => ({
    ...comment,
    depth: currentDepth,
    replies: comment.replies
      ? recursivelyAssignDepth(comment.replies, currentDepth + 1)
      : [],
  }));
};

const PostDetailPage: React.FC = () => {
  const { postId, communityId } = useParams<{
    postId: string;
    communityId?: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUserProfile, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  const [scrollToCommentId, setScrollToCommentId] = useState<number | null>(
    null
  );

  const parsedPostId = postId ? Number(postId) : NaN;

  const topCommentInputRef = useRef<CommentInputRef>(null);

  const isTeamPostPageCalculated = useMemo(() => {
    return location.pathname.startsWith("/communities/");
  }, [location.pathname]);

  const backToBoardPath = useMemo(() => {
    if (isTeamPostPageCalculated) {
      const communityIdFromPath = location.pathname.split("/")[2];
      return communityIdFromPath
        ? `/communities/${communityIdFromPath}/posts`
        : "/posts";
    }
    return "/posts";
  }, [isTeamPostPageCalculated, location.pathname]);

  const backToBoardText = useMemo(() => {
    return isTeamPostPageCalculated ? "커뮤니티 게시판으로" : "전체 게시판으로";
  }, [isTeamPostPageCalculated]);

  const fetchPostDetailQueryFn = useCallback(async (): Promise<
    Post | TeamPost
  > => {
    if (isNaN(parsedPostId)) {
      throw new Error("유효하지 않은 게시물 ID입니다.");
    }

    if (isTeamPostPageCalculated) {
      if (!communityId) {
        throw new Error("커뮤니티 ID가 유효하지 않습니다.");
      }
      return await fetchTeamPostById(communityId, parsedPostId);
    } else {
      return await fetchPostById(parsedPostId);
    }
  }, [parsedPostId, communityId, isTeamPostPageCalculated]);

  const {
    data: post,
    isLoading: isLoadingPost,
    isError: isErrorPost,
    error: errorPost,
    refetch: refetchPost,
  } = useQuery<Post | TeamPost, Error>({
    queryKey: ["postDetail", parsedPostId, communityId] as const,
    queryFn: fetchPostDetailQueryFn,
    enabled:
      !authLoading &&
      !isNaN(parsedPostId) &&
      (isTeamPostPageCalculated ? !!communityId : true),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const {
    data: comments,
    isLoading: isLoadingComments,
    isError: isErrorComments,
    error: errorComments,
  } = useQuery<(Comment | TeamComment)[], Error>({
    queryKey: ["comments", parsedPostId, communityId] as const,
    queryFn: async () => {
      let fetchedComments: (Comment | TeamComment)[];
      if (isTeamPostPageCalculated) {
        if (!communityId) throw new Error("커뮤니티 ID가 유효하지 않습니다.");
        fetchedComments = await fetchTeamComments(communityId, parsedPostId);
      } else {
        fetchedComments = await fetchCommentsByPost(parsedPostId);
      }
      return recursivelyAssignDepth(fetchedComments);
    },
    enabled: !isLoadingPost && !isErrorPost && !!post && !authLoading,
  });

  const isRecruitmentPost = (post as Post)?.type === "RECRUITMENT";

  const recruitmentCommunityId = useMemo(() => {
    if (isRecruitmentPost) {
      const match = post?.content.match(/\[커뮤니티 ID: (\d+)\]/);
      return match ? match[1] : null;
    }
    return null;
  }, [post, isRecruitmentPost]);

  const contentForDisplay = useMemo(() => {
    if (!post) return "";
    let content = post.content;
    if (isRecruitmentPost) {
      content = content.replace(/\[커뮤니티 ID: (\d+)\]/, "").trim();
    }
    return content;
  }, [post, isRecruitmentPost]);

  const { data: myRecruitingCommunities, isLoading: isLoadingMyCommunities } =
    useQuery<Community[], Error>({
      queryKey: ["myRecruitingCommunities", currentUserProfile?.userId],
      queryFn: fetchMyRecruitingCommunities,
      enabled: !!recruitmentCommunityId && !!currentUserProfile?.userId,
      staleTime: 1000 * 60 * 5,
      retry: false,
    });

  const { isLoading: isLoadingGeneralCommunity } = useQuery<Community, Error>({
    queryKey: ["communityDetail", recruitmentCommunityId],
    queryFn: async () => {
      if (!recruitmentCommunityId) {
        throw new Error("커뮤니티 ID가 없습니다.");
      }
      const response = await fetchCommunityById(Number(recruitmentCommunityId));
      return {
        id: response.teamId.toString(),
        title: response.postTitle,
        description: response.postContent,
        hostName: response.postAuthor,
        hostId: 0,
        currentMembers: 0,
        maxMembers: 0,
        role: "member",
        status: "모집중",
        createdAt: response.createdAt,
      };
    },
    enabled:
      isRecruitmentPost &&
      !!recruitmentCommunityId &&
      !isLoadingMyCommunities &&
      !myRecruitingCommunities,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (scrollToCommentId) {
      const element = document.getElementById(`comment-${scrollToCommentId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setScrollToCommentId(null);
      }
    }
  }, [scrollToCommentId, comments]);

  useEffect(() => {
    if (!isLoadingPost && !isErrorPost && post) {
      setEditedContent(contentForDisplay);
    }
    if (isErrorPost) {
      console.error("게시물 불러오기 오류 (useEffect):", errorPost);
    }
    window.scrollTo(0, 0);
    setIsEditing(false);
  }, [
    parsedPostId,
    communityId,
    isTeamPostPageCalculated,
    isLoadingPost,
    isErrorPost,
    post,
    errorPost,
    contentForDisplay,
  ]);

  const isPostAuthor = useMemo(
    () => post?.userId === currentUserProfile?.userId,
    [post, currentUserProfile]
  );

  const addCommentMutation = useMutation({
    mutationFn: async ({
      parentId,
      content,
    }: {
      parentId: number | null;
      content: string;
    }) => {
      if (!currentUserProfile || authLoading) {
        throw new Error("로그인이 필요합니다.");
      }
      if (isTeamPostPageCalculated && communityId) {
        return await createTeamComment(
          communityId,
          parsedPostId,
          currentUserProfile.userId,
          content,
          parentId
        );
      } else {
        return await createComment(parsedPostId, {
          userId: currentUserProfile.userId,
          content: content,
          parentId: parentId,
        });
      }
    },
    onSuccess: (newComment) => {
      showToast("댓글이 성공적으로 작성되었습니다.", "success");
      queryClient.invalidateQueries({
        queryKey: ["comments", parsedPostId, communityId],
      });
      const idToScroll = getCommentActualId(newComment);
      if (idToScroll !== null) {
        setScrollToCommentId(idToScroll);
      }
    },
    onError: (err) => {
      showToast(
        `댓글 작성 중 오류가 발생했습니다: ${err.message || "알 수 없는 오류"}`,
        "error"
      );
    },
  });

  const handleAddComment = useCallback(
    async (parentId: number | null, content: string) => {
      if (addCommentMutation.isPending) return;
      addCommentMutation.mutate({ parentId, content });
    },
    [addCommentMutation]
  );

  const handleAddCommentForInput = useCallback(
    async (content: string) => {
      await handleAddComment(null, content);
    },
    [handleAddComment]
  );

  const updateCommentMutation = useMutation({
    mutationFn: async ({
      commentId,
      newContent,
    }: {
      commentId: number;
      newContent: string;
    }) => {
      if (!currentUserProfile) {
        throw new Error("로그인이 필요합니다.");
      }
      if (isTeamPostPageCalculated && communityId) {
        return await updateTeamComment(communityId, commentId, newContent);
      } else {
        return await updateComment(commentId, {
          content: newContent,
          userId: currentUserProfile.userId,
        });
      }
    },
    onSuccess: () => {
      showToast("댓글이 성공적으로 수정되었습니다.", "success");
      queryClient.invalidateQueries({
        queryKey: ["comments", parsedPostId, communityId],
      });
    },
    onError: (err) => {
      showToast(
        `댓글 수정 중 오류가 발생했습니다: ${err.message || "알 수 없는 오류"}`,
        "error"
      );
    },
  });

  const handleEditComment = useCallback(
    async (commentId: number, newContent: string) => {
      if (updateCommentMutation.isPending) return;
      updateCommentMutation.mutate({ commentId, newContent });
    },
    [updateCommentMutation]
  );

  const handleCancelTopCommentInput = useCallback(() => {
    if (topCommentInputRef.current) {
      topCommentInputRef.current.clear();
    }
  }, []);

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      if (!currentUserProfile) {
        throw new Error("로그인이 필요합니다.");
      }
      if (isTeamPostPageCalculated && communityId) {
        return await deleteTeamComment(
          communityId,
          parsedPostId,
          commentId,
          currentUserProfile.userId
        );
      } else {
        return await deleteComment(commentId, currentUserProfile.userId);
      }
    },
    onSuccess: () => {
      showToast("댓글이 성공적으로 삭제되었습니다.", "success");
      queryClient.invalidateQueries({
        queryKey: ["comments", parsedPostId, communityId],
      });
    },
    onError: (err) => {
      showToast(
        `댓글 삭제 중 오류가 발생했습니다: ${err.message || "알 수 없는 오류"}`,
        "error"
      );
    },
  });

  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      if (deleteCommentMutation.isPending) return;
      if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
        deleteCommentMutation.mutate(commentId);
      }
    },
    [deleteCommentMutation]
  );

  const handleEditPost = useCallback(() => {
    if (!post) return;
    if (!currentUserProfile || authLoading) {
      showToast("로그인이 필요합니다.", "warn");
      return;
    }
    if (post.userId !== currentUserProfile.userId) {
      showToast("게시물 작성자만 수정할 수 있습니다.", "warn");
      return;
    }
    setIsEditing(true);
  }, [post, currentUserProfile, authLoading, showToast]);

  const handleSavePost = useCallback(
    async (updatedTitle?: string) => {
      if (!post) return;
      if (!currentUserProfile || authLoading) {
        showToast("로그인이 필요합니다.", "warn");
        return;
      }

      const finalTitle = updatedTitle || post.title;
      const trimmedEditedContent = editedContent.trim();
      const trimmedOriginalContent = post.content.trim() || "";

      if (!finalTitle.trim()) {
        showToast("게시물 제목을 입력해주세요.", "warn");
        return;
      }
      if (!trimmedEditedContent) {
        showToast("게시물 내용을 입력해주세요.", "warn");
        return;
      }
      if (
        trimmedEditedContent === trimmedOriginalContent &&
        finalTitle === post.title
      ) {
        showToast("수정된 내용이 없습니다.", "info");
        setIsEditing(false);
        return;
      }

      try {
        if (isTeamPostPageCalculated) {
          const communityIdFromPath = location.pathname.split("/")[2];
          if (!communityIdFromPath) throw new Error("커뮤니티 ID가 없습니다.");
          await updateTeamPost(communityIdFromPath, parsedPostId, {
            title: finalTitle,
            content: trimmedEditedContent,
          });
        } else {
          await updatePost(parsedPostId, {
            title: finalTitle,
            content: trimmedEditedContent,
          });
        }

        refetchPost();
        showToast("게시물이 성공적으로 수정되었습니다.", "success");
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("게시물 수정 실패:", err);
          showToast(
            `게시물 수정 중 오류가 발생했습니다: ${
              err.message || "알 수 없는 오류"
            }`,
            "error"
          );
        } else {
          showToast("알 수 없는 오류가 발생했습니다.", "error");
        }
      } finally {
        setIsEditing(false);
      }
    },
    [
      post,
      editedContent,
      parsedPostId,
      currentUserProfile,
      authLoading,
      isTeamPostPageCalculated,
      location.pathname,
      refetchPost,
      showToast,
    ]
  );

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    if (post) {
      setEditedContent(contentForDisplay);
    }
  }, [post, contentForDisplay]);

  const handleDeletePost = useCallback(async () => {
    if (!post) return;
    if (!currentUserProfile || authLoading) {
      showToast("로그인이 필요합니다.", "warn");
      return;
    }
    if (post.userId !== currentUserProfile.userId) {
      showToast("게시물 작성자만 삭제할 수 있습니다.", "warn");
      return;
    }

    if (window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      try {
        if (isTeamPostPageCalculated) {
          const communityIdFromPath = location.pathname.split("/")[2];
          if (!communityIdFromPath) throw new Error("커뮤니티 ID가 없습니다.");
          await deleteTeamPost(communityIdFromPath, parsedPostId);
        } else {
          if (isRecruitmentPost) {
            await deleteRecruitmentPost(
              parsedPostId,
              currentUserProfile.userId
            );
          } else {
            await deletePost(parsedPostId, currentUserProfile.userId);
          }
        }
        showToast("게시물이 성공적으로 삭제되었습니다.", "success");
        navigate(backToBoardPath);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("게시물 삭제 실패:", err);
          showToast(
            `게시물 삭제 중 오류가 발생했습니다: ${
              err.message || "알 수 없는 오류"
            }`,
            "error"
          );
        } else {
          showToast("알 수 없는 오류가 발생했습니다.", "error");
        }
      }
    }
  }, [
    post,
    parsedPostId,
    currentUserProfile,
    authLoading,
    isTeamPostPageCalculated,
    navigate,
    backToBoardPath,
    location.pathname,
    showToast,
    isRecruitmentPost,
  ]);

  const isLoadingCombined =
    isLoadingPost || isLoadingMyCommunities || isLoadingGeneralCommunity;

  if (isLoadingCombined) {
    return (
      <div className="text-center py-12 text-xl text-gray-700">
        게시물 로딩 중...
      </div>
    );
  }

  if (isErrorPost) {
    return (
      <div className="text-center py-12 text-xl text-red-700">
        오류: {errorPost?.message || "게시물을 불러오는 데 실패했습니다."}
      </div>
    );
  }
  if (!post) {
    return (
      <div className="text-center py-12 text-xl text-gray-700">
        게시물을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <PostDetailTemplate
      post={post}
      onEditPost={handleEditPost}
      onDeletePost={handleDeletePost}
      backToBoardPath={backToBoardPath}
      backToBoardText={backToBoardText}
      isEditing={isEditing}
      editedContent={editedContent}
      onEditedContentChange={setEditedContent}
      onSavePost={handleSavePost}
      onCancelEdit={handleCancelEdit}
      isPostAuthor={isPostAuthor}
      currentUserProfile={currentUserProfile || undefined}
      displayContent={contentForDisplay}
    >
      {/* {shouldRenderRecruitingCard && (
        <div className="mt-8 px-10">
          <RecruitingPostCard community={finalRecruitingCommunity} />
        </div>
      )} */}
      <div className="mt-12 px-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4">댓글</h3>
        <CommentInput
          ref={topCommentInputRef}
          onAddComment={handleAddCommentForInput}
          onCancel={handleCancelTopCommentInput}
        />
        {isLoadingComments && (
          <div className="text-center text-gray-600 py-4">댓글 로딩 중...</div>
        )}
        {isErrorComments && (
          <div className="text-center text-red-600 py-4">
            댓글 불러오기 오류: {errorComments?.message}
          </div>
        )}
        {!isLoadingComments && !isErrorComments && (
          <CommentList
            comments={comments || []}
            onAddReply={handleAddComment}
            currentUserId={currentUserProfile?.userId || 0}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
          />
        )}
      </div>
    </PostDetailTemplate>
  );
};

export default PostDetailPage;
