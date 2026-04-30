// src/components/mypage/AppliedCommunityCard.tsx

import Button from "../common/Button";
import { FaUserFriends } from "react-icons/fa";

import { type AppliedCommunity } from "../../types";

interface AppliedCommunityCardProps {
  community: AppliedCommunity;
  onCancelApplication: (applicationId: string) => void;
}

const AppliedCommunityCard: React.FC<AppliedCommunityCardProps> = ({
  community,
  onCancelApplication,
}) => {
  const statusColorClass = {
    pending: "text-amber-700 bg-amber-100",
    accepted: "text-emerald-700 bg-emerald-100",
    rejected: "text-rose-700 bg-rose-100",
  }[community.myApplicationStatus];

  const statusText = {
    pending: "대기",
    accepted: "수락",
    rejected: "거절",
  }[community.myApplicationStatus];

  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex-grow flex flex-col items-start mb-auto">
        <div className="flex justify-between items-center w-full mb-2">
          <h3 className="text-xl font-bold text-gray-800 leading-tight">
            {community.title}
          </h3>
          <span
            className={`min-w-12 px-2.5 py-1 text-center rounded-full text-xs font-semibold whitespace-nowrap ${statusColorClass}`}
          >
            {statusText}
          </span>
        </div>

        <p className="text-md text-gray-600 mb-2">
          <span className="font-medium mr-1">호스트: </span>
          {community.hostName}
        </p>

        {community.currentMembers !== undefined &&
          community.maxMembers !== undefined && (
            <div className="flex items-center text-gray-600 text-sm mb-4">
              <FaUserFriends className="w-5 h-5 mr-1 text-gray-500" />
              <span>
                {community.currentMembers}/{community.maxMembers}명
              </span>
            </div>
          )}

        <hr className="border-t border-gray-300 w-full my-3" />

        <div>
          <p className="text-gray-700 text-base leading-relaxed line-clamp-3 mb-3">
            {community.description}
          </p>
        </div>
      </div>

      <div className="mt-auto flex justify-end">
        {community.myApplicationStatus === "pending" && (
          <Button
            onClick={() =>
              onCancelApplication(community.applicationId.toString())
            }
            bgColor="bg-red-400"
            hoverBgColor="hover:bg-red-500"
            className="text-xs rounded-md px-3 py-1.5"
          >
            신청 취소
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppliedCommunityCard;
