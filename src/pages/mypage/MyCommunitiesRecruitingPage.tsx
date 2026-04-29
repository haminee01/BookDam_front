// src/pages/mypage/MyCommunitiesRecruitingPage.tsx

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import RecruitingCommunityCard from "../../components/mypage/RecruitingCommunityCard";
import Pagination from "../../components/common/Pagination";
import EditCommunityModal from "../../components/modals/EditCommunityModal";
import {
  fetchMyRecruitingCommunities,
  updateCommunityDetails,
  endRecruitment,
  fetchMyEndedCommunities,
  cancelRecruitment,
} from "../../api/communities";

import type { Community } from "../../types";

const MyCommunitiesRecruitingPage: React.FC = () => {
  const { currentUserProfile, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"모집중" | "모집종료" | "전체">(
    "전체"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCommunityToEdit, setSelectedCommunityToEdit] =
    useState<Community | null>(null);

  const [endRecruitmentError, setEndRecruitmentError] = useState<string | null>(
    null
  );

  const {
    data: fetchedCommunities,
    isLoading: isLoadingCommunities,
    isError: isErrorCommunities,
    error: communitiesError,
    refetch,
  } = useQuery<Community[], Error>({
    queryKey: [
      "myRecruitingCommunities",
      activeTab,
      currentUserProfile?.userId,
    ],
    queryFn: async () => {
      const currentUserId = currentUserProfile?.userId;
      if (!currentUserId) {
        throw new Error("로그인이 필요합니다.");
      }

      let communities: Community[] = [];
      if (activeTab === "모집중" || activeTab === "전체") {
        const recruiting = await fetchMyRecruitingCommunities();
        communities = [...communities, ...recruiting];
      }
      if (activeTab === "모집종료" || activeTab === "전체") {
        const ended = await fetchMyEndedCommunities();
        communities = [...communities, ...ended];
      }

      if (activeTab === "전체") {
        const uniqueCommunities = Array.from(
          new Map(communities.map((item) => [item.id, item])).values()
        );
        uniqueCommunities.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return uniqueCommunities;
      }

      if (activeTab === "모집중") {
        return communities.filter((comm) => comm.status === "모집중");
      } else if (activeTab === "모집종료") {
        return communities.filter((comm) => comm.status === "모집종료");
      }
      return communities;
    },
    staleTime: 1000 * 60,
    retry: 1,
    enabled: !authLoading && !!currentUserProfile,
  });

  useEffect(() => {
    setCurrentPage(1);
    setEndRecruitmentError(null);
  }, [activeTab]);

  const updateCommunityMutation = useMutation<
    Community,
    Error,
    {
      communityId: string;
      updateData: {
        title?: string;
        content?: string;
        maxMembers?: number;
        recruiting?: boolean;
      };
    }
  >({
    mutationFn: ({ communityId, updateData }) =>
      updateCommunityDetails(communityId, updateData),

    onSuccess: () => {
      showToast("커뮤니티 정보가 성공적으로 업데이트되었습니다.", "success");
      queryClient.invalidateQueries({ queryKey: ["myRecruitingCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["allCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["bookDetailPageData"] });
    },
    onError: (err: Error) => {
      const errorMessage =
        err.message || "커뮤니티 정보 업데이트 중 오류가 발생했습니다.";
      showToast(errorMessage, "error");
    },
  });

  const endRecruitmentMutation = useMutation<void, Error, string>({
    mutationFn: (communityId) => endRecruitment(communityId),
    onSuccess: () => {
      showToast("커뮤니티 모집이 성공적으로 종료되었습니다.", "success");
      queryClient.invalidateQueries({ queryKey: ["myRecruitingCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["allCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["bookDetailPageData"] });
      refetch();
    },
    onError: (err) => {
      console.error("모집 종료 중 오류 발생:", err);
      let errorMessage = "모집 종료 중 오류가 발생했습니다. 다시 시도해주세요.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setEndRecruitmentError(errorMessage);
      showToast(errorMessage, "error");
    },
  });

  const cancelRecruitmentMutation = useMutation<void, Error, string>({
    mutationFn: (communityId) => cancelRecruitment(communityId),
    onSuccess: () => {
      showToast("커뮤니티 모집이 성공적으로 취소되었습니다.", "success");
      queryClient.invalidateQueries({ queryKey: ["myRecruitingCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["appliedCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["allCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["bookDetailPageData"] });
      refetch();
    },
    onError: (err) => {
      console.error("모집 취소 중 오류 발생:", err);
      let errorMessage = "모집 취소 중 오류가 발생했습니다. 다시 시도해주세요.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setEndRecruitmentError(errorMessage);
      showToast(errorMessage, "error");
    },
  });

  const handleEndRecruitment = (communityId: string) => {
    setEndRecruitmentError(null);
    if (
      window.confirm(
        "정말로 이 커뮤니티 모집을 종료하시겠습니까? (모집 종료 시 모집중인 커뮤니티 목록에서 사라집니다.)"
      )
    ) {
      endRecruitmentMutation.mutate(communityId);
    }
  };

  const handleCancelRecruitment = (communityId: string) => {
    setEndRecruitmentError(null);
    if (
      window.confirm(
        "정말로 이 커뮤니티 모집을 취소하시겠습니까? (모든 신청 정보와 모집글이 사라집니다.)"
      )
    ) {
      cancelRecruitmentMutation.mutate(communityId);
    }
  };

  const totalFilteredItems = fetchedCommunities?.length || 0;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

  const paginatedCommunities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return (fetchedCommunities || [])
      .filter((community): community is Community => community != null)
      .slice(startIndex, endIndex);
  }, [fetchedCommunities, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleTabChange = (tab: "모집중" | "모집종료" | "전체") => {
    setActiveTab(tab);
  };

  const handleEditCommunityClick = (community: Community) => {
    setSelectedCommunityToEdit(community);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedCommunityToEdit(null);
  };

  const handleSaveCommunityDetails = async (
    communityId: string,
    updateData: {
      title?: string;
      content?: string;
      maxMembers?: number;
      recruiting?: boolean;
    }
  ) => {
    await updateCommunityMutation.mutateAsync({ communityId, updateData });
  };

  if (isLoadingCommunities || authLoading) {
    return (
      <div className="text-center py-12">
        모집 중인 커뮤니티 목록을 불러오는 중...
      </div>
    );
  }
  if (isErrorCommunities) {
    return (
      <div className="text-center py-12 text-red-500">
        오류: {communitiesError?.message || "데이터를 불러오지 못했습니다."}
      </div>
    );
  }
  if (!currentUserProfile) {
    return (
      <div className="text-center py-12 text-red-500">로그인이 필요합니다.</div>
    );
  }

  return (
    <div className="p-6">
      <MyPageHeader
        title="내가 모집 중인 커뮤니티"
        description="여기에서 당신이 모집 중인 커뮤니티의 현황을 확인하고 관리할 수 있습니다. 다양한 주제의 커뮤니티에서 활동해보세요."
      />

      {endRecruitmentError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <strong className="font-bold">오류: </strong>
          <span className="block sm:inline">{endRecruitmentError}</span>
          <button
            onClick={() => setEndRecruitmentError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-700"
          >
            <svg
              className="fill-current h-6 w-6"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => handleTabChange("전체")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "전체"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          전체
        </button>
        <button
          onClick={() => handleTabChange("모집중")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "모집중"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          모집 중
        </button>
        <button
          onClick={() => handleTabChange("모집종료")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "모집종료"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          모집 종료
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCommunities.length > 0 ? (
          paginatedCommunities.map((community) => (
            <RecruitingCommunityCard
              key={community.id}
              community={community}
              onEndRecruitment={handleEndRecruitment}
              onEditCommunity={handleEditCommunityClick}
              onCancelRecruitment={handleCancelRecruitment}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 py-10">
            {activeTab === "모집중" && "현재 모집 중인 커뮤니티가 없습니다."}
            {activeTab === "모집종료" && "종료된 모집 커뮤니티가 없습니다."}
            {activeTab === "전체" && "모집 커뮤니티가 없습니다."}
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {selectedCommunityToEdit && (
        <EditCommunityModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          community={selectedCommunityToEdit}
          onSave={handleSaveCommunityDetails}
        />
      )}
    </div>
  );
};

export default MyCommunitiesRecruitingPage;
