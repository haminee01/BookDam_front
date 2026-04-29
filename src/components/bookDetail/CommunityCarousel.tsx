// src/components/bookDetail/CommunityCarousel.tsx

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../common/Button";
import ApplyToCommunityModal from "../modals/ApplyToCommunityModal";
import { FaChevronLeft, FaChevronRight, FaUserFriends } from "react-icons/fa";
import { fetchCommunitiesByBookIsbn13 } from "../../api/communities";

import type { Community } from "../../types";

interface CommunityCarouselProps {
  bookIsbn13: string;
  onApplyClick: (communityId: string) => void;
}

const CommunityCarousel: React.FC<CommunityCarouselProps> = ({
  bookIsbn13,
  onApplyClick,
}) => {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { currentUserProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  );
  const [listError, setListError] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    data: communities,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<Community[], Error>({
    queryKey: ["bookDetailPageData", bookIsbn13, currentUserProfile?.userId],
    queryFn: ({ queryKey }) => {
      const [, isbn, userId] = queryKey;
      return fetchCommunitiesByBookIsbn13(isbn as string, 5, userId as number);
    },
    enabled: !!bookIsbn13,
    staleTime: 1000 * 60 * 5,
  });

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - itemsPerPage));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(
        (communities?.length || 0) - itemsPerPage,
        prevIndex + itemsPerPage
      )
    );
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
      queryKey: ["bookDetailPageData", bookIsbn13, currentUserProfile?.userId],
    });
    queryClient.invalidateQueries({ queryKey: ["appliedCommunities"] });
    handleCloseModal();
  };

  const visibleCommunities = communities
    ? communities.slice(currentIndex, currentIndex + itemsPerPage)
    : [];

  const canGoPrev = currentIndex > 0;
  const canGoNext = communities
    ? currentIndex + itemsPerPage < communities.length
    : false;

  if (isLoading || isFetching) {
    return (
      <div className="text-center py-8 text-gray-600">
        커뮤니티를 불러오는 중...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-600">
        오류: {error?.message || "커뮤니티를 불러오는 데 실패했습니다."}
      </div>
    );
  }

  if (!communities || communities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        아직 이 책에 대한 커뮤니티가 없습니다.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`p-3 rounded-full bg-gray-200 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center ${
            !canGoPrev ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FaChevronLeft className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex flex-grow justify-center space-x-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-hidden">
            {visibleCommunities.map((community: Community, idx: number) => {
              const isCurrentUserHost =
                currentUserProfile?.userId === community.hostId;
              const hasApplied = community.hasApplied;

              return (
                <div
                  key={`${community.id}-${currentIndex + idx}`}
                  className="w-full rounded-xl flex-shrink-0 border border-gray-200 p-6 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-2xl text-gray-800 mb-1 leading-tight">
                      {community.title}
                    </h3>
                    <p className="text-gray-500 text-lg mb-4">
                      {community.hostName}
                    </p>
                    <p className="text-gray-700 text-base leading-relaxed line-clamp-3">
                      {community.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-start mt-auto">
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <FaUserFriends className="w-4 h-4 mr-1 text-gray-500" />
                      <span>
                        {community.currentMembers}/{community.maxMembers}명
                      </span>
                    </div>
                    <Button
                      onClick={() => onApplyClick(community.id)}
                      bgColor={hasApplied ? "bg-gray-400" : "bg-main"}
                      textColor="text-white"
                      hoverBgColor={
                        hasApplied ? "hover:bg-gray-500" : "hover:bg-apply"
                      }
                      className={`w-full text-sm py-2 rounded-lg ${
                        isCurrentUserHost || hasApplied
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
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
              );
            })}
            {visibleCommunities.length < itemsPerPage &&
              Array(itemsPerPage - visibleCommunities.length)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={`community-placeholder-${i}`}
                    className="w-64 h-64 flex-shrink-0"
                  />
                ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center ${
            !canGoNext ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FaChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {listError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 text-center"
          role="alert"
        >
          <strong className="font-bold">오류: </strong>
          <span className="block sm:inline">{listError}</span>
        </div>
      )}

      <ApplyToCommunityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        communityId={selectedCommunityId || ""}
        onError={handleApplyModalError}
        onSuccess={handleApplySuccess}
      />
    </div>
  );
};

export default CommunityCarousel;
