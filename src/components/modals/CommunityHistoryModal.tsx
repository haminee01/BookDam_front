// src/components/modals/CommunityHistoryModal.tsx

import { formatKoreanDate } from "../../utils/dateFormatter";
import Button from "../common/Button";

import { type CommunityHistoryEntry } from "../../types";

interface CommunityHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicantNickname: string;
  history: CommunityHistoryEntry[];
  loading: boolean;
  error: string | null;
}

const CommunityHistoryModal: React.FC<CommunityHistoryModalProps> = ({
  isOpen,
  onClose,
  applicantNickname,
  history,
  loading,
  error,
}) => {
  if (!isOpen) return null;

  const getKoreanRole = (role: string): string => {
    if (role === "host") return "호스트";
    if (role === "member") return "멤버";
    return role;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-auto relative">
        <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">
          참여 이력
        </h2>

        <p className="font-light text-md text-gray-600 mb-6 text-center">
          {applicantNickname} 님의 커뮤니티 참여 이력입니다.
        </p>

        {loading ? (
          <p className="text-center py-4 text-gray-600">
            이력을 불러오는 중...
          </p>
        ) : error ? (
          <p className="text-center py-4 text-red-500">오류: {error}</p>
        ) : history.length === 0 ? (
          <p className="text-center py-4 text-gray-600">
            참여 이력이 없습니다.
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 mb-6">
            {history.map((entry, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-md p-4 border border-gray-200"
              >
                <h5 className="font-semibold text-lg text-gray-800">
                  {entry.communityName}
                </h5>

                <p className="text-sm text-gray-600">
                  역할: {getKoreanRole(entry.role)}
                </p>

                <p className="text-sm text-gray-600">
                  기간: {formatKoreanDate(entry.startDate)} ~
                  {entry.endDate
                    ? formatKoreanDate(entry.endDate)
                    : "현재 활동중"}
                </p>
                <p
                  className={`text-sm font-medium ${
                    entry.status === "활동중"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  상태: {entry.status}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <Button
            onClick={onClose}
            bgColor="bg-main"
            textColor="text-white"
            hoverBgColor="hover:bg-apply"
            className="font-normal px-6 py-3 rounded-md"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommunityHistoryModal;
