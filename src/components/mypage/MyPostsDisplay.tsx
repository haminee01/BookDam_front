// src/components/mypage/MyPostsDisplay.tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { formatKoreanDateTime } from "../../utils/dateFormatter";
import Pagination from "../common/Pagination";
import { fetchMyPosts } from "../../api/posts";

import type { MyPostsResponse } from "../../api/posts";
import type { Post, TeamPost } from "../../types";

const POSTS_PER_PAGE = 10;

function isTeamPost(post: Post | TeamPost): post is TeamPost {
  return (post as TeamPost).teamPostId !== undefined;
}

const MyPostsDisplay: React.FC = () => {
  const { currentUserProfile } = useAuth();
  const userId = currentUserProfile?.userId;

  const [currentPage, setCurrentPage] = useState(1);
  const selectedSort = "latest";

  const { data, isLoading, isError, error, isFetching } = useQuery<
    MyPostsResponse,
    Error
  >({
    queryKey: ["myPosts", userId, currentPage, selectedSort],
    queryFn: () => {
      if (!userId) {
        throw new Error("로그인이 필요합니다.");
      }
      return fetchMyPosts(currentPage, POSTS_PER_PAGE, selectedSort);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const posts = data?.data?.posts || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;
  const totalCount = data?.data?.pagination?.totalCount || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-500">
        로그인 후 내가 작성한 글을 확인할 수 있습니다.
      </div>
    );
  }

  if (isLoading && !isFetching) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-600">
        <p>글 목록을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-48 text-red-600">
        <p>오류 발생: {error?.message || "글 목록을 불러오지 못했습니다."}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        내가 작성한 글 ({totalCount}개)
      </h2>

      {isFetching && posts.length > 0 && (
        <div className="text-center text-gray-500 mb-4">
          목록을 업데이트 중...
        </div>
      )}

      {posts.length === 0 && !isLoading && !isFetching ? (
        <div className="text-center text-gray-500 py-10">
          작성한 글이 없습니다.
        </div>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => {
            const postIdOrTeamPostId = isTeamPost(post)
              ? post.teamPostId
              : post.postId;
            const linkTo = isTeamPost(post)
              ? `/communities/${post.teamId}/posts/${post.teamPostId}`
              : `/posts/${post.postId}`;

            return (
              <li
                key={postIdOrTeamPostId}
                className="p-4 border rounded-lg shadow-sm bg-white"
              >
                <Link to={linkTo} className="block hover:text-blue-600">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
                      {post.title}
                    </h3>
                  </div>
                  <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>작성일: {formatKoreanDateTime(post.createdAt)}</span>
                    <span>댓글: {post._count?.comments || 0}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default MyPostsDisplay;
