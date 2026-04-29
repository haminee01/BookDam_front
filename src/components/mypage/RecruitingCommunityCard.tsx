// src/components/mypage/RecruitingCommunityCard.tsx

import { Link } from "react-router-dom";
import Button from "../common/Button";
import { FaUserFriends } from "react-icons/fa";

import type { Community } from "../../types";

interface RecruitingCommunityCardProps {
  community: Community & {
    pendingApplicantCount?: number;
  };
  onEndRecruitment: (communityId: string) => void;
  onEditCommunity: (community: Community) => void;
  onCancelRecruitment: (communityId: string) => void;
}

const RecruitingCommunityCard: React.FC<RecruitingCommunityCardProps> = ({
  community,
  onEndRecruitment,
  onEditCommunity,
  onCancelRecruitment,
}) => {
  const showRecruitingButtons = community.status === "모집중";

  const handleEndRecruitmentClick = () => {
    if (community.currentMembers < 2) {
      alert("모집 인원이 최소 2명 이상이어야 모집 종료할 수 있습니다.");
      return;
    }
    onEndRecruitment(community.id);
  };

  return (
    <div className="bg-gray-100 p-6 flex flex-col justify-between ">
      <div className="flex-grow flex flex-col items-start mb-auto">
        <div className="flex justify-between items-center w-full mb-2">
          <h3 className="text-xl font-bold text-gray-800 leading-tight">
            {community.title}
          </h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              community.status === "모집중"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {community.status}
          </span>
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-4">
          <FaUserFriends className="w-4 h-4 mr-1 text-gray-500" />
          <span>
            {community.currentMembers}/{community.maxMembers}명
          </span>
        </div>

        <hr className="border-t border-gray-300 w-full mb-4" />

        <p className="text-gray-700 text-base leading-relaxed line-clamp-3 mb-4">
          {community.description}
        </p>

        {showRecruitingButtons &&
          community.pendingApplicantCount !== undefined && (
            <div className="flex items-center text-gray-700 text-sm mb-4">
              <span className="font-semibold mr-1">대기 신청자:</span>
              <span className="text-blue-600 font-bold">
                {community.pendingApplicantCount}명
              </span>
            </div>
          )}
      </div>

      <div className="mt-auto flex flex-col gap-2 items-stretch">
        {showRecruitingButtons && (
          <>
            <Link
              to={`/mypage/communities/recruiting/${community.id}/applicants`}
              className="w-full"
            >
              <Button
                bgColor="bg-blue-500"
                textColor="text-white"
                hoverBgColor="hover:bg-blue-600"
                className="w-full px-2 py-1 text-xs justify-center"
              >
                신청자 보기
              </Button>
            </Link>
            {community.status === "모집중" && (
              <Button
                onClick={() => onEditCommunity(community)}
                bgColor="bg-gray-300"
                textColor="text-gray-800"
                hoverBgColor="hover:bg-gray-400"
                className="w-full px-2 py-1 text-xs justify-center"
              >
                수정
              </Button>
            )}
            <Button
              onClick={handleEndRecruitmentClick}
              bgColor="bg-red-500"
              textColor="text-white"
              hoverBgColor="hover:bg-red-600"
              className="w-full px-2 py-1 text-xs justify-center"
            >
              모집 종료
            </Button>
          </>
        )}

        {showRecruitingButtons && (
          <Button
            onClick={() => onCancelRecruitment(community.id)}
            bgColor="bg-gray-600"
            textColor="text-white"
            hoverBgColor="hover:bg-gray-700"
            className="w-full px-2 py-1 text-xs justify-center"
          >
            모집 취소
          </Button>
        )}
      </div>
    </div>
  );
};

export default RecruitingCommunityCard;
