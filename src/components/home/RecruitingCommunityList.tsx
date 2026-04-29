// src/components/home/RecruitingCommunityList.tsx

import { useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import Button from "../common/Button";
import ApplyToCommunityModal from "../modals/ApplyToCommunityModal";
import { FaUserFriends, FaUser } from "react-icons/fa";
import { fetchCommunities } from "../../api/communities";

import type { Community } from "../../types";

const itemsPerPage = 6;

const RecruitingCommunityList: React.FC = () => {
  const { currentUserProfile } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  );
  const [listError, setListError] = useState<string | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["allCommunities", currentUserProfile?.userId],
    queryFn: ({ pageParam = 1 }) => {
      return fetchCommunities(
        pageParam,
        itemsPerPage,
        "latest",
        currentUserProfile?.userId
      );
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = lastPage.communities.length
        ? allPages.length + 1
        : undefined;
      return nextPage;
    },
    staleTime: 1000 * 60,
    enabled: true, // 항상 활성화하여 로그인 상태 변화 시 자동으로 다시 불러오기
  });

  const communities = data?.pages.flatMap((page) => page.communities) || [];

  const totalResults = data?.pages[0].totalResults || 0;

  const handleLoadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const handleCommunityClick = (communityId: string) => {
    navigate(`/posts/${communityId}`);
  };

  const handleJoinClick = (community: Community) => {
    if (
      community.hasApplied ||
      currentUserProfile?.userId === community.hostId
    ) {
      return;
    }

    setListError(null);
    setSelectedCommunityId(community.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCommunityId(null);
  };

  const handleApplyModalError = (message: string) => {
    setListError(message);
    setIsModalOpen(false);
  };

  const handleApplySuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["allCommunities", currentUserProfile?.userId],
    });
    queryClient.invalidateQueries({
      queryKey: ["appliedCommunities"],
    });
    handleCloseModal();
  };

  return (
    <section className="py-8 md:py-12 lg:py-16">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
          현재 모집 중인 커뮤니티
        </h2>
        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
          함께 읽고 이야기할 독서 모임에 참여해보세요
        </p>
      </div>

      {listError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 max-w-2xl mx-auto"
          role="alert"
        >
          <strong className="font-bold">오류: </strong>
          <span className="block sm:inline">{listError}</span>
        </div>
      )}

      <div className="space-y-4 md:space-y-6">
        {isLoading && !isFetchingNextPage ? (
          <div className="text-center py-12 md:py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-main mb-4"></div>
            <p className="text-gray-500 text-sm md:text-base">
              커뮤니티 목록을 불러오는 중...
            </p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 md:py-16">
            <p className="text-red-500 text-sm md:text-base">
              오류: {error?.message || "커뮤니티 목록을 불러오는 데 실패했습니다."}
            </p>
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="text-gray-400 mb-4">
              <FaUserFriends className="w-16 h-16 mx-auto text-main" />
            </div>
            <p className="text-gray-500 text-sm md:text-base">
              현재 모집 중인 커뮤니티가 없습니다.
            </p>
            <p className="text-gray-400 text-xs md:text-sm mt-2">
              새로운 커뮤니티를 만들어보세요!
            </p>
          </div>
        ) : (
          communities.map((community) => {
            const isCurrentUserHost =
              currentUserProfile?.userId === community.hostId;
            const hasApplied = community.hasApplied;

            return (
              <div
                key={community.id}
                className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* 커뮤니티 정보 */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-main to-apply rounded-full flex items-center justify-center">
                          <FaUserFriends className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-lg md:text-xl font-semibold text-gray-800 mb-2 cursor-pointer hover:text-main transition-colors line-clamp-2"
                          onClick={() => handleCommunityClick(community.id)}
                        >
                          {community.title}
                        </h3>
                        <p className="text-gray-600 text-sm md:text-base mb-3 line-clamp-2">
                          {community.description}
                        </p>
                        
                        {/* 커뮤니티 메타 정보 */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <FaUser className="w-4 h-4 text-main" />
                            <span>{community.hostName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FaUserFriends className="w-4 h-4 text-main" />
                            <span>{community.currentMembers}/{community.maxMembers}명</span>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => handleJoinClick(community)}
                      className="w-full lg:w-auto px-6 py-2 md:py-3 text-sm md:text-base"
                      bgColor={hasApplied ? "bg-gray-400" : "bg-apply"}
                      textColor="text-white"
                      hoverBgColor={
                        hasApplied ? "hover:bg-gray-500" : "hover:bg-apply"
                      }
                      disabled={isCurrentUserHost || hasApplied}
                    >
                      {isCurrentUserHost
                        ? "나의 커뮤니티"
                        : hasApplied
                        ? "신청 완료"
                        : "신청하기"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 더보기 버튼 */}
      {isFetchingNextPage && (
        <div className="text-center mt-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-main"></div>
          <p className="text-gray-500 text-sm mt-2">
            더 많은 커뮤니티를 불러오는 중...
          </p>
        </div>
      )}

      {!isLoading && !isError && hasNextPage && totalResults > itemsPerPage && (
        <div className="text-center mt-8 md:mt-12">
          <Button
            onClick={handleLoadMore}
            className="px-8 py-3 text-base md:text-lg"
            disabled={isFetchingNextPage}
          >
            더보기
          </Button>
        </div>
      )}

      <ApplyToCommunityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        communityId={selectedCommunityId || ""}
        onError={handleApplyModalError}
        onSuccess={handleApplySuccess}
      />
    </section>
  );
};

export default RecruitingCommunityList;
