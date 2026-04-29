// src/components/mypage/ApplicantCard.tsx

import Button from "../common/Button";

import { type ApplicantWithStatus } from "../../types";

interface ApplicantCardProps {
  applicant: ApplicantWithStatus;
  onViewHistory: (applicantId: string, nickname: string) => void;
  onAcceptReject: (
    applicantId: string,
    status: "accepted" | "rejected"
  ) => void;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicant,
  onViewHistory,
  onAcceptReject,
}) => {
  const statusText = {
    pending: "신청 대기 중",
    accepted: "신청 수락됨",
    rejected: "신청 거절됨",
  }[applicant.status];

  const statusColorClass = {
    pending: "text-blue-600 bg-blue-100",
    accepted: "text-green-600 bg-green-100",
    rejected: "text-red-600 bg-red-100",
  }[applicant.status];

  const showActionButtons = applicant.status === "pending";

  return (
    <div className="p-4 flex flex-col justify-between bg-gray-100 ">
      <div className="flex flex-col mb-5">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-lg font-semibold text-gray-800">
            {applicant.nickname}
          </h4>
          <p className="text-sm text-gray-500">
            신청일: {new Date(applicant.appliedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex justify-between items-center mb-3">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
            {applicant.applicationMessage}
          </p>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColorClass}`}
          >
            {statusText}
          </span>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-auto">
        {showActionButtons ? (
          <>
            <Button
              onClick={() => onAcceptReject(applicant.id, "accepted")}
              bgColor="bg-green-500"
              hoverBgColor="hover:bg-green-600"
              className="px-4 py-2 text-sm"
            >
              수락
            </Button>
            <Button
              onClick={() => onAcceptReject(applicant.id, "rejected")}
              bgColor="bg-red-500"
              hoverBgColor="hover:bg-red-600"
              className="px-4 py-2 text-sm"
            >
              거절
            </Button>
          </>
        ) : null}

        <Button
          onClick={() => onViewHistory(applicant.id, applicant.nickname)}
          bgColor="bg-main"
          hoverBgColor="hover:bg-apply"
          className="px-4 py-2 text-sm"
        >
          이력 보기
        </Button>
      </div>
    </div>
  );
};

export default ApplicantCard;
