import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applyToCommunityByPostId } from '../../api/communities';
import { useToast } from '../../hooks/useToast';
import Button from '../common/Button';
import { FaUserFriends, FaTimes, FaBookOpen, FaUser } from 'react-icons/fa';

interface CommunityApplicationCardProps {
  post: {
    postId: number;
    title: string;
    content: string;
    type: string;
    userId: number;
    book?: {
      title: string;
      author: string;
      cover: string | null;
      isbn13: string;
    } | null;
    recruitmentStatus?: string;
    maxMembers?: number;
    user: {
      nickname: string;
      profileImage: string | null;
    };
    createdAt: string;
  };
  onClose: () => void;
}

const CommunityApplicationCard: React.FC<CommunityApplicationCardProps> = ({
  post,
  onClose,
}) => {
  const { isLoggedIn, currentUserProfile } = useAuthContext();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [applicationMessage, setApplicationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 커뮤니티 신청 뮤테이션
  const applyMutation = useMutation({
    mutationFn: async () => {
      return await applyToCommunityByPostId(post.postId, applicationMessage);
    },
    onSuccess: () => {
      // 토스트는 onSuccess 콜백에서 처리하도록 제거
      // showToast('커뮤니티 신청이 완료되었습니다!', 'success');
      
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['allCommunities'] });
      queryClient.invalidateQueries({ queryKey: ['appliedCommunities'] });
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || '신청 중 오류가 발생했습니다.';
      showToast(errorMessage, 'error');
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleApply = async () => {
    if (!isLoggedIn) {
      showToast('로그인이 필요한 서비스입니다.', 'warn');
      navigate('/auth/login');
      return;
    }

    if (!applicationMessage.trim()) {
      showToast('신청 메시지를 입력해주세요.', 'warn');
      return;
    }

    setIsSubmitting(true);
    applyMutation.mutate();
  };

  const handleViewPost = () => {
    navigate(`/posts/${post.postId}`);
  };

  const isCurrentUserPost = currentUserProfile?.userId === post.userId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">커뮤니티 신청</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-main transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="닫기"
          >
            <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* 커뮤니티 정보 */}
        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
              {post.title}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-3">
              {post.content}
            </p>
            
            {/* 책 정보 */}
            {post.book && (
              <div className="flex items-start space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                {post.book.cover && (
                  <img
                    src={post.book.cover}
                    alt={post.book.title}
                    className="w-16 h-20 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 text-sm sm:text-base line-clamp-2">
                    {post.book.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{post.book.author}</p>
                </div>
              </div>
            )}

            {/* 커뮤니티 메타 정보 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div className="flex items-center space-x-2 text-gray-600 text-sm">
                <FaUserFriends className="w-4 h-4 flex-shrink-0 text-main" />
                <span>모집 인원: {post.maxMembers || '미정'}명</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 text-sm">
                <FaBookOpen className="w-4 h-4 flex-shrink-0 text-main" />
                <span>모집자: {post.user.nickname}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 text-sm">
                <FaUser className="w-4 h-4 flex-shrink-0 text-main" />
                <span>타입: {post.type === 'RECRUITMENT' ? '모집글' : '일반글'}</span>
              </div>
            </div>
          </div>

          {/* 신청 폼 */}
          {!isCurrentUserPost && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                신청 메시지
              </label>
              <textarea
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                placeholder="커뮤니티에 참여하고 싶은 이유나 자기소개를 작성해주세요."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {applicationMessage.length}/500
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {isCurrentUserPost ? (
              <Button
                onClick={handleViewPost}
                className="w-full sm:w-auto py-3 text-sm sm:text-base"
                bgColor="bg-blue-600"
                textColor="text-white"
                hoverBgColor="hover:bg-blue-700"
              >
                게시글 보기
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleApply}
                  disabled={isSubmitting || !applicationMessage.trim()}
                  className="w-full sm:w-auto py-3 text-sm sm:text-base"
                  bgColor="bg-apply"
                  textColor="text-white"
                  hoverBgColor="hover:bg-apply"
                >
                  {isSubmitting ? '신청 중...' : '신청하기'}
                </Button>
                <Button
                  onClick={handleViewPost}
                  className="w-full sm:w-auto py-3 text-sm sm:text-base"
                  bgColor="bg-gray-600"
                  textColor="text-white"
                  hoverBgColor="hover:bg-gray-700"
                >
                  게시글 보기
                </Button>
              </>
            )}
          </div>

          {/* 안내 메시지 */}
          {!isLoggedIn && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                커뮤니티에 신청하려면 로그인이 필요합니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityApplicationCard;
