// src/pages/communities/GeneralBoardPage.tsx

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BoardTemplate from "../../components/posts/BoardTemplate";
import { fetchAllPosts } from "../../api/posts";

import type { Post } from "../../types";

const GeneralBoardPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(() => {
    return Math.ceil(totalPosts / itemsPerPage);
  }, [totalPosts, itemsPerPage]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllPosts(
        currentPage,
        itemsPerPage,
        "latest",
        undefined
      );
      setPosts(response.posts);
      setTotalPosts(response.totalResults);
    } catch (err: unknown) {
      console.error("게시물 불러오기 실패:", err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
      setPosts([]);
      setTotalPosts(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    loadPosts();
    window.scrollTo(0, 0);
  }, [loadPosts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleWritePostClick = () => {
    navigate("/posts/write");
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 md:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6">
            책담
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            어떤 책이든, 어떤 이야기든 좋아요. '책담'에서 당신의 목소리를
            들려주세요.
          </p>
        </div>

        {/* 게시판 내용 */}
        {loading ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-main mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              게시물을 불러오는 중...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-red-400 mb-4">
                <svg className="w-12 h-12 mx-auto text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 text-sm sm:text-base md:text-lg font-medium">
                오류: {error}
              </p>
              <button
                onClick={() => loadPosts()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                다시 시도
              </button>
            </div>
          </div>
        ) : (
          <BoardTemplate
            boardTitle=""
            posts={posts}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onWritePostClick={handleWritePostClick}
            onPostClick={(postId) => navigate(`/posts/${postId}`)}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default GeneralBoardPage;
