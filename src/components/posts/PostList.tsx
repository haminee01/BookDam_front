// src/components/posts/PostList.tsx

import { useState } from "react";
import { Link } from "react-router-dom";
import CommunityApplicationCard from "../modals/CommunityApplicationCard";

import type { Post, TeamPost } from "../../types";

interface PostListProps {
  posts: (Post | TeamPost)[];
  onPostClick: (postId: number) => void;
}

const PostList: React.FC<PostListProps> = ({ posts, onPostClick }) => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // 타입 라벨 계산 함수 (Post만 처리)
  const getTypeLabel = (post: Post | TeamPost) => {
    // TeamPost는 여기서 처리하지 않음 (일반 게시판에서는 나오지 않음)
    const postWithType = post as Post;
    return postWithType.type === "RECRUITMENT" ? "모집글" : "일반글";
  };

  const handlePostClick = (post: Post | TeamPost, e: React.MouseEvent) => {
    e.preventDefault();
    
    // 커뮤니티 모집글인 경우 신청 카드 표시
    if ("postId" in post && post.type === "RECRUITMENT") {
      setSelectedPost(post);
    } else {
      // 일반 글인 경우 기존 동작
      const postId = "postId" in post ? post.postId : post.teamPostId;
      onPostClick(postId);
    }
  };

  const handleCloseCard = () => {
    setSelectedPost(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="border-t border-gray-300">
        {posts.map((post) => {
          const postId = "postId" in post ? post.postId : post.teamPostId;
          const commentCount = post._count?.comments || 0;

          return (
            <Link
              key={postId}
              to={
                "teamPostId" in post
                  ? `/communities/${post.teamId}/posts/${post.teamPostId}`
                  : `/posts/${post.postId}`
              }
              onClick={(e) => handlePostClick(post, e)}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-5 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                <div className="flex items-start space-x-3">
                  {/* 타입 배지 */}
                  {"postId" in post && (
                    <span 
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 mt-1`}
                      style={
                        (post as Post).type === "RECRUITMENT" 
                          ? { backgroundColor: '#fef3cd', color: '#856404' }
                          : { backgroundColor: '#f3f4f6', color: '#374151' }
                      }
                    >
                      {getTypeLabel(post)}
                    </span>
                  )}
                  
                  {/* 제목과 메타 정보 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2 group-hover:text-main transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    {/* 메타 정보 */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        <span>{post.user.nickname}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        <span>{formatDate(post.createdAt)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        <span>댓글 {commentCount}개</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 우측 화살표 (모바일에서만 표시) */}
              <div className="sm:hidden flex justify-end">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-main transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}
        
        {posts.length === 0 && (
          <div className="text-center py-12 md:py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm md:text-base">
              아직 게시글이 없습니다.
            </p>
            <p className="text-gray-400 text-xs md:text-sm mt-2">
              첫 번째 게시글을 작성해보세요!
            </p>
          </div>
        )}
      </div>

      {/* 커뮤니티 신청 카드 */}
      {selectedPost && (
        <CommunityApplicationCard
          post={selectedPost}
          onClose={handleCloseCard}
        />
      )}
    </>
  );
};

export default PostList;