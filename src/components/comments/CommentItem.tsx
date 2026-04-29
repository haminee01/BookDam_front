// src/components/comments/CommentItem.tsx

import { useState, useRef, memo, useEffect } from "react";
import { Link } from "react-router-dom";
import CommentList from "./CommentList";
import CommentInput, { type CommentInputRef } from "./CommentInput";
import { formatKoreanDateTime } from "../../utils/dateFormatter";

import type { Comment, TeamComment } from "../../types";

const getCommentIdentifier = (c: Comment | TeamComment): number => {
  if ("commentId" in c && typeof c.commentId === "number") {
    return c.commentId;
  }
  if ("teamCommentId" in c && typeof c.teamCommentId === "number") {
    return c.teamCommentId;
  }
  return 0;
};

interface CommentItemProps {
  comment: Comment | TeamComment;
  postLink?: string;
  onAddReply: (parentId: number, content: string) => Promise<void>;
  currentUserId: number;
  onEditComment: (commentId: number, newContent: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
}

const CommentItem: React.FC<CommentItemProps> = memo(
  ({
    comment,
    postLink,
    onAddReply,
    currentUserId,
    onEditComment,
    onDeleteComment,
  }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [isEditingComment, setIsEditingComment] = useState(false);
    const [editedCommentContent, setEditedContent] = useState(comment.content);
    const isAuthor = comment.userId === currentUserId;

    const replyInputRef = useRef<CommentInputRef>(null);
    const editInputRef = useRef<HTMLTextAreaElement>(null);

    console.log(
      `[CommentItem Render] ID: ${getCommentIdentifier(
        comment
      )}, isEditing: ${isEditingComment}`
    );

    useEffect(() => {
      if (isEditingComment && editInputRef.current) {
        editInputRef.current.focus();
        const length = editedCommentContent.length;
        editInputRef.current.setSelectionRange(length, length);
        console.log(
          `[CommentItem useEffect Focus] ID: ${getCommentIdentifier(
            comment
          )}, Focused`
        );
      }
    }, [isEditingComment, editedCommentContent, comment]);

    const handleReplyClick = () => {
      setShowReplyInput((prev: boolean) => {
        const newState = !prev;
        if (newState) {
          replyInputRef.current?.focus();
        }
        return newState;
      });
    };

    const handleReplySubmit = async (content: string) => {
      const commentActualId = getCommentIdentifier(comment);
      await onAddReply(commentActualId, content);
      setShowReplyInput(false);
      replyInputRef.current?.clear();
    };

    const handleCancelReply = () => {
      setShowReplyInput(false);
      replyInputRef.current?.clear();
    };

    const handleEditCommentClick = () => {
      if (comment.userId !== currentUserId) {
        alert("댓글 작성자만 수정할 수 있습니다.");
        return;
      }
      setIsEditingComment(true);
      setEditedContent(comment.content);
    };

    const handleSaveEditedComment = async () => {
      const trimmedContent = editedCommentContent.trim();
      if (!trimmedContent) {
        alert("댓글 내용을 입력해주세요.");
        return;
      }
      if (trimmedContent === comment.content.trim()) {
        alert("수정된 내용이 없습니다.");
        setIsEditingComment(false);
        return;
      }

      const commentActualId = getCommentIdentifier(comment);
      await onEditComment(commentActualId, trimmedContent);
      setIsEditingComment(false);
    };

    const handleCancelEditComment = () => {
      setIsEditingComment(false);
      setEditedContent(comment.content);
    };

    const handleDeleteCommentClick = async () => {
      if (comment.userId !== currentUserId) {
        alert("댓글 작성자만 삭제할 수 있습니다.");
        return;
      }

      const commentActualId = getCommentIdentifier(comment);
      await onDeleteComment(commentActualId);
    };

    const handleKeyDownForEdit = (
      event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSaveEditedComment();
        editInputRef.current?.blur();
      } else if (event.key === "Escape") {
        handleCancelEditComment();
        editInputRef.current?.blur();
      }
    };

    const OuterWrapper: React.FC<{ children: React.ReactNode }> = ({
      children,
    }) => {
      if (postLink) {
        return (
          <Link to={postLink} className="block rounded-lg">
            {children}
          </Link>
        );
      }
      return <div className="block rounded-lg">{children}</div>;
    };

    const indentationClass = comment.depth ? `ml-${comment.depth * 8}` : "ml-0";
    const basePadding = "p-4";

    const canReply = (comment.depth || 0) < 1;

    const getProfileImageUrl = (): string => {
      if (comment.user?.profileImage) {
        return comment.user.profileImage;
      }
      const encodedNickname = encodeURIComponent(
        comment.user?.nickname || "Guest"
      );
      return `https://api.dicebear.com/8.x/identicon/svg?seed=${encodedNickname}`;
    };

    return (
      <OuterWrapper>
        <div
          id={`comment-${getCommentIdentifier(comment)}`}
          className={`mb-2 ${basePadding} ${indentationClass}`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <img
                src={getProfileImageUrl()}
                alt={comment.user?.nickname || "작성자"}
                className="w-8 h-8 rounded-full mr-3 object-cover border border-gray-200"
              />
              <span className="font-semibold text-gray-700">
                {comment.user?.nickname || "작성자"}
              </span>
            </div>
            <span className="text-gray-500 text-sm">
              {comment.updatedAt && comment.updatedAt !== comment.createdAt
                ? "수정일: "
                : "게시일: "}
              {formatKoreanDateTime(
                comment.updatedAt && comment.updatedAt !== comment.createdAt
                  ? comment.updatedAt
                  : comment.createdAt
              )}
            </span>
          </div>

          {isEditingComment ? (
            <div className="mt-2">
              <textarea
                ref={editInputRef}
                className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent"
                rows={3}
                value={editedCommentContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={handleKeyDownForEdit}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={handleSaveEditedComment}
                  className="px-4 py-2 bg-main text-white rounded-md hover:bg-main-dark transition-colors focus:outline-none"
                >
                  저장
                </button>
                <button
                  onClick={handleCancelEditComment}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors focus:outline-none"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 mb-2 whitespace-pre-wrap mt-2">
              {comment.content}
            </p>
          )}

          <div className="flex text-sm text-gray-600 space-x-4">
            {!isEditingComment && canReply && (
              <button
                onClick={handleReplyClick}
                className="hover:text-main focus:outline-none"
              >
                답글
              </button>
            )}
            {!isEditingComment && isAuthor && (
              <>
                <button
                  onClick={handleEditCommentClick}
                  className="hover:text-main focus:outline-none"
                >
                  수정
                </button>
                <button
                  onClick={handleDeleteCommentClick}
                  className="hover:text-main focus:outline-none"
                >
                  삭제
                </button>
              </>
            )}
          </div>

          {showReplyInput && (
            <div className="mt-4">
              <CommentInput
                ref={replyInputRef}
                onAddComment={handleReplySubmit}
                placeholder="답글을 작성하세요..."
                onCancel={handleCancelReply}
              />

              <div className="flex justify-end mt-2">
                <button
                  onClick={handleCancelReply}
                  className="px-4 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm focus:outline-none"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {Array.isArray(comment.replies) && comment.replies.length > 0 && (
            <div className="mt-4">
              <CommentList
                comments={comment.replies as (Comment | TeamComment)[]}
                depth={(comment.depth || 0) + 1}
                onAddReply={onAddReply}
                currentUserId={currentUserId}
                onEditComment={onEditComment}
                onDeleteComment={onDeleteComment}
              />
            </div>
          )}

          {postLink && comment.postTitle && (
            <p className="text-sm text-main mt-2">
              <span className="font-medium">원문:</span> {comment.postTitle}
            </p>
          )}
        </div>
      </OuterWrapper>
    );
  }
);

export default CommentItem;
