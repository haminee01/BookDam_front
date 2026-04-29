// src/pages/mypage/MyCommunitiesAppliedPage.tsx

import { useState, useMemo, useCallback } from "react";
import { useToast } from "../../hooks/useToast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import AppliedCommunityCard from "../../components/mypage/AppliedCommunityCard";
import Pagination from "../../components/common/Pagination";
import {
  fetchAppliedCommunities,
  cancelApplication,
} from "../../api/communities";

import { type AppliedCommunity } from "../../types";

const MyCommunitiesAppliedPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "pending" | "accepted" | "rejected" | "전체"
  >("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: communities,
    isLoading,
    isError,
    error,
  } = useQuery<AppliedCommunity[], Error>({
    queryKey: ["appliedCommunities"],
    queryFn: fetchAppliedCommunities,
    staleTime: 1000 * 60,
  });

  const filteredCommunities = useMemo(() => {
    if (!communities) return [];
    if (activeTab === "전체") {
      return communities;
    }
    return communities.filter((comm) => comm.myApplicationStatus === activeTab);
  }, [communities, activeTab]);

  const totalFilteredItems = filteredCommunities.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

  const paginatedCommunities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCommunities.slice(startIndex, endIndex);
  }, [filteredCommunities, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleTabChange = (
    tab: "pending" | "accepted" | "rejected" | "전체"
  ) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const cancelApplicationMutation = useMutation<void, Error, string>({
    mutationFn: (applicationId: string) => cancelApplication(applicationId),
    onSuccess: () => {
      showToast("커뮤니티 신청이 성공적으로 취소되었습니다.", "success");
      queryClient.invalidateQueries({ queryKey: ["appliedCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["allCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["bookDetailPageData"] });
    },
    onError: (error) => {
      console.error("신청 취소 중 오류 발생:", error);
      let errorMessage = "신청 취소 중 오류가 발생했습니다. 다시 시도해주세요.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast(errorMessage, "error");
    },
  });

  const handleCancelApplication = useCallback(
    async (applicationId: string) => {
      if (window.confirm("정말로 이 커뮤니티 가입 신청을 취소하시겠습니까?")) {
        cancelApplicationMutation.mutate(applicationId);
      }
    },
    [cancelApplicationMutation]
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        신청한 커뮤니티 목록을 불러오는 중...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        오류: {error?.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <MyPageHeader
        title="내가 신청한 커뮤니티"
        description="여기에서 당신이 가입 신청한 커뮤니티의 현황을 확인할 수 있습니다. 다양한 주제의 커뮤니티에서 활동해보세요."
      />

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
          onClick={() => handleTabChange("pending")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "pending"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          신청 대기 중
        </button>
        <button
          onClick={() => handleTabChange("accepted")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "accepted"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          신청 수락됨
        </button>
        <button
          onClick={() => handleTabChange("rejected")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "rejected"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          신청 거절됨
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCommunities.length > 0 ? (
          paginatedCommunities.map((community) => (
            <AppliedCommunityCard
              key={community.id}
              community={community}
              onCancelApplication={(appId) => handleCancelApplication(appId)}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 py-10">
            {activeTab === "pending" && "신청 대기 중인 커뮤니티가 없습니다."}
            {activeTab === "accepted" && "신청 수락된 커뮤니티가 없습니다."}
            {activeTab === "rejected" && "신청 거절된 커뮤니티가 없습니다."}
            {activeTab === "전체" && "신청한 커뮤니티가 없습니다."}
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
    </div>
  );
};

export default MyCommunitiesAppliedPage;
