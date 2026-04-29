// src/components/posts/BoardTemplate.tsx

import PostList from "./PostList";
import Button from "../common/Button";
import Pagination from "../common/Pagination";

import type { Post, TeamPost } from "../../types";

interface BoardTemplateProps {
  posts: (Post | TeamPost)[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onWritePostClick: () => void;
  onPostClick: (postId: number) => void;
  boardTitle: string;
  isLoading: boolean;
}

const BoardTemplate: React.FC<BoardTemplateProps> = ({
  posts,
  currentPage,
  totalPages,
  onPageChange,
  onWritePostClick,
  onPostClick,
  boardTitle,
  isLoading,
}) => {
  return (
    <div className="min-h-full py-6 sm:py-8 md:py-10">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        {boardTitle && (
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {boardTitle}
          </h1>
        )}
        <Button
          onClick={onWritePostClick}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium shadow-sm hover:shadow-md transition-all duration-200"
        >
          <span className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>게시물 작성</span>
          </span>
        </Button>
      </div>

      {/* 게시물 목록 */}
      <div className="mb-6 sm:mb-8">
        {isLoading ? (
          <div className="text-center py-12 sm:py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-main mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">
              게시물을 불러오는 중...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm sm:text-base mb-2">
              게시물이 없습니다.
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              첫 번째 게시물을 작성해보세요!
            </p>
          </div>
        ) : (
          <PostList posts={posts} onPostClick={onPostClick} />
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default BoardTemplate;
