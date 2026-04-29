// src/components/modals/EditCommunityModal.tsx (새로 생성)

import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import Button from "../common/Button";

import type { Community } from "../../types";

interface EditCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: Community;
  onSave: (
    communityId: string,
    updateData: {
      title?: string;
      content?: string;
      maxMembers?: number;
    }
  ) => Promise<void>;
}

const EditCommunityModal: React.FC<EditCommunityModalProps> = ({
  isOpen,
  onClose,
  community,
  onSave,
}) => {
  const [title, setTitle] = useState(community.title);
  const [description, setDescription] = useState(community.description);
  const [maxMembers, setMaxMembers] = useState(community.maxMembers.toString());
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTitle(community.title);
      setDescription(community.description);
      setMaxMembers(community.maxMembers.toString());
    }
  }, [isOpen, community]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const parsedMaxMembers = parseInt(maxMembers, 10);
    if (
      isNaN(parsedMaxMembers) ||
      parsedMaxMembers < 2 ||
      parsedMaxMembers > 10
    ) {
      showToast("모집 인원을 최소 2명, 최대 10명 이내로 입력해주세요.", "warn");
      return;
    }

    if (title.trim().length < 3 || title.trim().length > 30) {
      showToast("커뮤니티 이름은 3자 이상 30자 이내로 입력해주세요.", "warn");
      return;
    }

    if (description.trim().length < 3 || description.trim().length > 100) {
      showToast("커뮤니티 소개는 3자 이상 100자 이내로 입력해주세요.", "warn");
      return;
    }

    setLoading(true);
    try {
      await onSave(community.id, {
        title: title.trim(),
        content: description.trim(),
        maxMembers: parsedMaxMembers,
      });
      onClose();
    } catch (error) {
      console.error("커뮤니티 수정 실패:", error);
      showToast("커뮤니티 수정 중 오류가 발생했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          커뮤니티 정보 수정
        </h2>
        <p className="font-light text-gray-600 mb-6">
          커뮤니티 정보를 업데이트하세요.
        </p>

        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-gray-700 text-base font-medium mb-2"
          >
            커뮤니티 이름
          </label>
          <input
            id="title"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 font-light"
            maxLength={30}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-gray-700 text-base font-medium mb-2"
          >
            커뮤니티 소개
          </label>
          <textarea
            id="description"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 resize-none font-light"
            rows={3}
            maxLength={100}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="mb-4">
          <label
            htmlFor="maxMembers"
            className="block text-gray-700 text-base font-medium mb-2"
          >
            모집 인원
          </label>
          <input
            id="maxMembers"
            type="number"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 font-light"
            min="2"
            max="10"
            value={maxMembers}
            onChange={(e) => setMaxMembers(e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            onClick={onClose}
            bgColor="bg-gray-300"
            textColor="text-white"
            hoverBgColor="hover:bg-gray-400"
            className="font-normal"
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            bgColor="bg-main"
            textColor="text-white"
            hoverBgColor="hover:bg-apply"
            className="font-normal"
            disabled={loading}
          >
            {loading ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditCommunityModal;
