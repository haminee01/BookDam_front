// src/pages/mypage/CommunityApplicantsPage.tsx

import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import ApplicantCard from "../../components/mypage/ApplicantCard";
import CommunityHistoryModal from "../../components/modals/CommunityHistoryModal";
import { FaChevronLeft } from "react-icons/fa";
import {
  fetchApplicantsByCommunity,
  updateApplicationStatus,
  fetchCommunityById,
} from "../../api/communities";
import { fetchCommunityHistory } from "../../api/mypage";

import type { ApplicantWithStatus, CommunityHistoryEntry } from "../../types";

const CommunityApplicantsPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicantNickname, setSelectedApplicantNickname] = useState<
    string | null
  >(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);

  const parsedCommunityId = communityId ? Number(communityId) : NaN;
  const backToRecruitingCommunitiesPath = "/mypage/communities/recruiting";

  const {
    data: communityTitle,
    isLoading: isLoadingCommunityInfo,
    isError: isErrorCommunityInfo,
    error: errorCommunityInfo,
  } = useQuery<string, Error>({
    queryKey: ["communityInfo", parsedCommunityId],
    queryFn: async () => {
      if (isNaN(parsedCommunityId)) {
        throw new Error("유효하지 않은 커뮤니티 ID입니다.");
      }
      const response = await fetchCommunityById(parsedCommunityId);
      return response.postTitle;
    },
    enabled: !!communityId && !isNaN(parsedCommunityId),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: applicants,
    isLoading: isLoadingApplicants,
    isError: isErrorApplicants,
    error: errorApplicants,
  } = useQuery<ApplicantWithStatus[], Error>({
    queryKey: ["communityApplicants", communityId],
    queryFn: async () => {
      if (!communityId) {
        throw new Error("커뮤니티 ID가 없습니다.");
      }
      const response = await fetchApplicantsByCommunity(communityId);
      return response.applicants;
    },
    enabled: !!communityId,
    staleTime: 1000 * 10,
  });

  const communityHistoryMutation = useMutation<
    CommunityHistoryEntry[],
    Error,
    string
  >({
    mutationFn: (userId: string) => fetchCommunityHistory(userId),
    onMutate: () => {
      setLoadingHistory(true);
      setErrorHistory(null);
    },
    onSuccess: (data) => {
      setHistoryData(data);
    },
    onError: (err) => {
      setErrorHistory(err.message || "이력을 불러오는데 실패했습니다.");
      showToast("이력을 불러오는데 실패했습니다.", "error");
    },
    onSettled: () => {
      setLoadingHistory(false);
    },
  });

  const [historyData, setHistoryData] = useState<CommunityHistoryEntry[]>([]);

  const updateApplicationStatusMutation = useMutation<
    void,
    Error,
    { applicantId: string; status: "accepted" | "rejected" }
  >({
    mutationFn: async ({ applicantId, status }) => {
      if (isNaN(parsedCommunityId)) {
        throw new Error("커뮤니티 ID가 유효하지 않습니다.");
      }
      const applicant = applicants?.find((app) => app.id === applicantId);
      if (!applicant) {
        throw new Error("신청자 정보를 찾을 수 없습니다.");
      }
      await updateApplicationStatus(
        communityId!,
        applicant.userId.toString(),
        status.toUpperCase() as "ACCEPTED" | "REJECTED"
      );
    },
    onSuccess: (_, { applicantId, status }) => {
      const applicant = applicants?.find((app) => app.id === applicantId);
      if (applicant) {
        showToast(
          `신청자 ${applicant.nickname}님의 요청이 ${
            status === "accepted" ? "수락" : "거절"
          }되었습니다.`,
          "success"
        );
      }

      queryClient.invalidateQueries({
        queryKey: ["communityApplicants", communityId],
      });
      queryClient.invalidateQueries({ queryKey: ["myRecruitingCommunities"] });
    },
    onError: (err) => {
      console.error("신청 처리 중 오류 발생:", err);
      showToast(
        "신청 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
        "error"
      );
    },
  });

  const handleViewHistory = useCallback(
    async (applicantId: string, nickname: string) => {
      setSelectedApplicantNickname(nickname);
      setIsModalOpen(true);

      const applicant = applicants?.find((app) => app.id === applicantId);
      if (applicant) {
        communityHistoryMutation.mutate(applicant.userId.toString());
      }
    },
    [applicants, communityHistoryMutation]
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplicantNickname(null);
    setHistoryData([]);
  };

  const handleAcceptReject = useCallback(
    (applicantId: string, status: "accepted" | "rejected") => {
      updateApplicationStatusMutation.mutate({ applicantId, status });
    },
    [updateApplicationStatusMutation]
  );

  const finalApplicants = applicants || [];

  if (isLoadingCommunityInfo || isLoadingApplicants) {
    return (
      <div className="text-center py-12">신청자 목록을 불러오는 중...</div>
    );
  }

  if (isErrorCommunityInfo) {
    return (
      <div className="text-center py-12 text-red-500">
        오류: {errorCommunityInfo?.message}
      </div>
    );
  }

  if (isErrorApplicants) {
    return (
      <div className="text-center py-12 text-red-500">
        오류: {errorApplicants?.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link
        to={backToRecruitingCommunitiesPath}
        className="text-gray-600 hover:text-gray-800 flex items-center mb-8"
      >
        <div className="flex items-center">
          <FaChevronLeft className="w-4 h-4 text-gray-700 mr-1 mb-1" />
          <span>내가 모집 중인 커뮤니티로 돌아가기</span>
        </div>
      </Link>

      <MyPageHeader
        title="커뮤니티 신청 내역"
        description={`'${
          communityTitle || communityId
        }' 커뮤니티에 신청한 사용자 목록입니다.`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {finalApplicants.length > 0 ? (
          finalApplicants.map((applicant) => (
            <ApplicantCard
              key={applicant.id}
              applicant={applicant}
              onViewHistory={handleViewHistory}
              onAcceptReject={handleAcceptReject}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 py-10">
            아직 신청자가 없습니다.
          </p>
        )}
      </div>

      <CommunityHistoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        applicantNickname={selectedApplicantNickname || ""}
        history={historyData}
        loading={loadingHistory}
        error={errorHistory}
      />
    </div>
  );
};

export default CommunityApplicantsPage;
