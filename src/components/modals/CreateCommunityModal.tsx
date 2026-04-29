// src/components/modals/CreateCommunityModal.tsx

import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import Button from "../common/Button";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string | undefined;
  onCommunityCreate: (
    bookId: string,
    communityName: string,
    maxMembers: number,
    description: string
  ) => void;
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
  bookId,
  onCommunityCreate,
}) => {
  const [communityName, setCommunityName] = useState("");
  const [maxMembers, setMaxMembers] = useState<string>("");
  const [description, setDescription] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setCommunityName("");
      setMaxMembers("");
      setDescription("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const trimmedCommunityName = communityName.trim();
    if (trimmedCommunityName.length < 3 || trimmedCommunityName.length > 15) {
      alert("커뮤니티 이름을 3자 이상 15자 이내로 입력해주세요.");
      return;
    }

    const parsedMaxMembers = parseInt(maxMembers, 10);
    if (
      isNaN(parsedMaxMembers) ||
      parsedMaxMembers < 2 ||
      parsedMaxMembers > 10
    ) {
      alert("모집 인원을 최소 2명, 최대 10명 이내로 입력해주세요.");
      return;
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 3 || trimmedDescription.length > 30) {
      alert("커뮤니티 소개를 3자 이상 30자 이내로 입력해주세요.");
      return;
    }

    if (!bookId || bookId.trim() === "") {
      showToast(
        "도서 정보가 올바르지 않아 커뮤니티를 생성할 수 없습니다.",
        "error"
      );
      console.error("Community creation failed: bookId is missing or empty.");
      return;
    }

    onCommunityCreate(
      bookId,
      trimmedCommunityName,
      parsedMaxMembers,
      trimmedDescription
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          독서 커뮤니티 생성하기
        </h2>
        <p className="font-light text-gray-600 mb-6">
          새로운 독서 커뮤니티를 시작해보세요.
        </p>

        <div className="mb-4">
          <label
            htmlFor="communityName"
            className="block text-gray-700 text-base font-medium mb-2"
          >
            커뮤니티 이름
          </label>
          <input
            id="communityName"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 font-light"
            placeholder="커뮤니티 이름을 15자 이내로 입력해주세요"
            maxLength={15}
            value={communityName}
            onChange={(e) => setCommunityName(e.target.value)}
          />
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
            placeholder="모집할 인원수를 입력해주세요 (최소 2명, 최대 10명)"
            min="2"
            max="10"
            value={maxMembers}
            onChange={(e) => setMaxMembers(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-gray-700 text-base font-medium mb-2"
          >
            커뮤니티 간단 소개 글
          </label>
          <textarea
            id="description"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 resize-none font-light"
            rows={3}
            placeholder="커뮤니티 소개를 30자 이내로 입력해주세요."
            maxLength={30}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
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
          >
            생성하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityModal;
