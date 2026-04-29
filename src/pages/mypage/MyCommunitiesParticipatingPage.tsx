// src/pages/mypage/MyCommunitiesParticipatingPage.tsx

import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import CommunityCard from "../../components/mypage/ParticipatingCommunityCard";
import {
  fetchParticipatingCommunities,
  leaveOrDeleteCommunity,
} from "../../api/communities";

import type { Community } from "../../types";

const MyCommunitiesParticipatingPage: React.FC = () => {
  const { currentUserProfile } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: communities,
    isLoading,
    isError,
    error,
  } = useQuery<Community[], Error>({
    queryKey: ["participatingCommunities", currentUserProfile?.userId],
    queryFn: fetchParticipatingCommunities,
    staleTime: 1000 * 60,
    retry: 1,
    enabled: !!currentUserProfile,
  });

  const leaveOrDeleteMutation = useMutation<
    void,
    Error,
    { communityId: string; role: "host" | "member" }
  >({
    mutationFn: ({ communityId }) => leaveOrDeleteCommunity(communityId),
    onSuccess: (_, { role }) => {
      showToast(
        `${
          role === "host"
            ? "커뮤니티를 성공적으로 삭제하였습니다."
            : "커뮤니티에서 성공적으로 탈퇴하였습니다."
        }`,
        "success"
      );

      queryClient.invalidateQueries({
        queryKey: ["participatingCommunities", currentUserProfile?.userId],
      });
    },
    onError: (err: unknown) => {
      console.error("커뮤니티 처리 중 오류 발생:", err);
      let errorMessage =
        "커뮤니티 처리 중 오류가 발생했습니다. 다시 시도해주세요.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      showToast(errorMessage, "error");
    },
  });

  const handleLeaveOrDelete = (
    communityId: string,
    role: "host" | "member"
  ) => {
    if (!currentUserProfile) {
      showToast("로그인이 필요합니다.", "warn");
      return;
    }

    if (
      window.confirm(
        `${
          role === "host"
            ? "커뮤니티를 삭제하시겠습니까? 삭제 시 모든 기록이 사라집니다."
            : "커뮤니티에서 탈퇴하시겠습니까?"
        }`
      )
    ) {
      leaveOrDeleteMutation.mutate({ communityId, role });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        참여 중인 커뮤니티 목록을 불러오는 중...
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

  if (!communities || communities.length === 0) {
    return (
      <div className="p-6">
        <MyPageHeader
          title="현재 참여 중인 커뮤니티를 확인하세요"
          description="여기에서 당신이 현재 참여하고 있는 커뮤니티 목록을 확인할 수 있습니다. 다양한 주제의 커뮤니티에서 활동해보세요."
        />
        <p className="col-span-full text-center text-gray-500 py-10">
          참여 중인 커뮤니티가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <MyPageHeader
        title="현재 참여 중인 커뮤니티를 확인하세요"
        description="여기에서 당신이 현재 참여하고 있는 커뮤니티 목록을 확인할 수 있습니다. 다양한 주제의 커뮤니티에서 활동해보세요."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onLeaveOrDelete={handleLeaveOrDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default MyCommunitiesParticipatingPage;
