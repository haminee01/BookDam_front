// src/pages/mypage/UserLeavePage.tsx

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import Button from "../../components/common/Button";

const UserLeavePage: React.FC = () => {
  const { deleteUser, loading } = useAuth();
  const { showToast } = useToast(); // useToast 훅 사용
  const [confirmText, setConfirmText] = useState("");

  const handleDeleteAccount = async () => {
    if (confirmText !== "회원 탈퇴") {
      showToast(
        "회원 탈퇴를 진행하려면 '회원 탈퇴'를 정확히 입력해주세요.",
        "warn"
      );
      return;
    }

    if (
      !window.confirm(
        "정말로 회원 탈퇴를 하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다."
      )
    ) {
      return;
    }

    const success = await deleteUser();
    if (success) {
      setConfirmText("");
    }
  };

  return (
    <div>
      <section id="userLeave" className="container mx-auto p-6">
        <MyPageHeader
          title="회원 탈퇴"
          description="더 이상 서비스를 이용하지 않으시려면 회원 탈퇴를 진행할 수 있습니다."
        />
        <div className="p-8">
          <div className="space-y-4">
            <p className="text-red-600 font-semibold text-lg">
              회원 탈퇴 전 꼭 확인해주세요!
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                회원 탈퇴 시 모든 개인 정보 및 활동 기록이 즉시 삭제되며, 복구할
                수 없습니다.
              </li>
              <li>
                작성하신 게시물, 댓글 등은 삭제되지 않고 유지될 수 있습니다.
              </li>
              <li>
                참여 중이거나 모집 중인 커뮤니티가 있다면, 먼저 커뮤니티를
                탈퇴하거나 삭제해야 탈퇴가 가능합니다.
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <label
              htmlFor="confirmText"
              className="block text-gray-700 text-lg font-medium mb-2"
            >
              회원 탈퇴를 원하시면 아래 입력창에 "회원 탈퇴"라고 정확히
              입력해주세요.
            </label>
            <input
              type="text"
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="회원 탈퇴"
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
            />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              onClick={handleDeleteAccount}
              disabled={loading || confirmText !== "회원 탈퇴"}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {loading ? "탈퇴 처리 중..." : "회원 탈퇴하기"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserLeavePage;
