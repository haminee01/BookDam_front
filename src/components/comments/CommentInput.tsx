// src/components/comments/CommentInput.tsx

import { useState, useRef, forwardRef, useImperativeHandle } from "react";

export interface CommentInputRef {
  focus: () => void;
  getValue: () => string;
  clear: () => void;
}

interface CommentInputProps {
  onAddComment: (content: string) => Promise<void>;
  placeholder?: string;
  onCancel?: () => void;
}

const CommentInput = forwardRef<CommentInputRef, CommentInputProps>(
  ({ onAddComment, placeholder = "댓글을 작성하세요...", onCancel }, ref) => {
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
      getValue: () => comment,
      clear: () => setComment(""),
    }));

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setComment(event.target.value);
    };

    const handleSubmit = async () => {
      if (!comment.trim()) {
        alert("댓글 내용을 입력해주세요.");
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
        return;
      }

      setIsLoading(true);

      try {
        await onAddComment(comment);
        setComment("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.blur();
        }
      } catch (error) {
        console.error("댓글 제출 실패:", error);
        alert("댓글 제출 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.nativeEvent.isComposing) {
        return;
      }
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        handleSubmit();
      } else if (event.key === "Escape") {
        setComment("");
        textareaRef.current?.blur();
        if (onCancel) {
          onCancel();
        }
      }
    };

    const handleTextareaResize = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };

    return (
      <div className="mb-4">
        <textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={comment}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onInput={handleTextareaResize}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-2 space-x-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors focus:outline-none"
              disabled={isLoading}
            >
              취소
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-main text-white rounded-md hover:bg-main-dark transition-colors focus:outline-none"
            disabled={isLoading}
          >
            {isLoading ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>
    );
  }
);

CommentInput.displayName = "CommentInput";
export default CommentInput;
