// src/pages/mypage/ProfileEditPage.tsx

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../hooks/useToast";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import Button from "../../components/common/Button";

const defaultProfileImage = "https://api.dicebear.com/8.x/identicon/svg?seed=";

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { currentUserProfile, loading, error, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [currentNickname, setCurrentNickname] = useState<string>("");
  const [currentIntroduction, setCurrentIntroduction] = useState<string>("");
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteExistingImage, setDeleteExistingImage] =
    useState<boolean>(false);

  useEffect(() => {
    if (currentUserProfile) {
      setCurrentNickname(currentUserProfile.nickname || "");
      setCurrentIntroduction(currentUserProfile.introduction || "");
      const initialProfileImage =
        currentUserProfile.profileImage ||
        `${defaultProfileImage}${encodeURIComponent(
          currentUserProfile.nickname
        )}`;
      setPreviewImageUrl(initialProfileImage);
      setSelectedFile(null);
      setDeleteExistingImage(false);
    } else {
      setCurrentNickname("");
      setCurrentIntroduction("");
      setPreviewImageUrl(defaultProfileImage + "Default");
      setSelectedFile(null);
      setDeleteExistingImage(false);
    }
  }, [currentUserProfile]);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentNickname(e.target.value);
  };

  const handleIntroductionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCurrentIntroduction(e.target.value);
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImageUrl(URL.createObjectURL(file));
      setDeleteExistingImage(false);
    } else {
      setSelectedFile(null);
      setPreviewImageUrl(
        currentUserProfile?.profileImage ||
          `${defaultProfileImage}${encodeURIComponent(
            currentUserProfile?.nickname || "Default"
          )}`
      );
    }
  };

  const handleProfileImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteProfileImage = () => {
    if (
      window.confirm(
        "현재 프로필 이미지를 삭제하고 기본 이미지로 변경하시겠습니까?"
      )
    ) {
      setSelectedFile(null);
      const currentNicknameForAvatar =
        currentUserProfile?.nickname || "Default";
      setPreviewImageUrl(
        `${defaultProfileImage}${encodeURIComponent(currentNicknameForAvatar)}`
      );
      setDeleteExistingImage(true);
    }
  };

  const handleSave = async () => {
    if (
      currentNickname.trim().length < 2 ||
      currentNickname.trim().length > 10
    ) {
      showToast("닉네임은 2자 이상 10자 이내로 입력해주세요.", "error");
      return;
    }
    if (currentIntroduction.trim().length > 100) {
      showToast("자기소개는 100자 이내로 입력해주세요.", "error");
      return;
    }

    const isNicknameChanged =
      currentNickname !== (currentUserProfile?.nickname || "");
    const isIntroductionChanged =
      currentIntroduction !== (currentUserProfile?.introduction || "");
    const isNewImageSelected = selectedFile !== null;
    const isImageDeletionRequested = deleteExistingImage;
    const isImageActuallyChanged =
      isNewImageSelected ||
      isImageDeletionRequested ||
      (previewImageUrl !== currentUserProfile?.profileImage &&
        !previewImageUrl?.startsWith(defaultProfileImage) &&
        (currentUserProfile?.profileImage === undefined ||
          !currentUserProfile?.profileImage?.startsWith(defaultProfileImage)));

    if (
      !isNicknameChanged &&
      !isIntroductionChanged &&
      !isImageActuallyChanged
    ) {
      showToast("변경할 내용이 없습니다.", "info");
      return;
    }

    if (!window.confirm("정말로 정보를 수정하시겠습니까?")) {
      // confirm 유지
      return;
    }

    const formData = new FormData();
    formData.append("nickname", currentNickname);
    formData.append("introduction", currentIntroduction);

    if (isNewImageSelected && selectedFile) {
      formData.append("profileImage", selectedFile);
    } else if (isImageDeletionRequested) {
      formData.append("deleteProfileImage", "true");
    }

    const success = await updateProfile(formData);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      queryClient.invalidateQueries({ queryKey: ["teamPosts"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
      queryClient.invalidateQueries({ queryKey: ["myComments"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
      queryClient.invalidateQueries({ queryKey: ["teamPost"] });
    }
  };

  const handleCancel = () => {
    if (window.confirm("변경사항을 취소하고 이전으로 돌아가시겠습니까?")) {
      navigate(-1);
    }
  };

  if (loading) {
    return <div className="text-center py-12">회원 정보를 불러오는 중...</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">오류: {error}</div>;
  }
  if (!currentUserProfile) {
    return <div className="text-center py-12">회원 정보를 불러오는 중...</div>;
  }

  return (
    <div className="p-6">
      <MyPageHeader
        title="회원 정보 수정"
        description="회원님의 닉네임, 자기소개, 프로필 사진을 수정할 수 있습니다."
      />

      <div className="p-8 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <img
            src={previewImageUrl || `${defaultProfileImage}Default`}
            alt="프로필 이미지"
            className="w-32 h-32 rounded-full object-cover border border-gray-300"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfileImageChange}
            className="hidden"
            accept="image/*"
          />
          <div className="flex space-x-2">
            <Button
              onClick={handleProfileImageUploadClick}
              className="px-4 py-2 rounded-md text-sm font-normal"
            >
              사진 변경
            </Button>
            {currentUserProfile?.profileImage &&
              !currentUserProfile.profileImage.startsWith(
                defaultProfileImage
              ) && (
                <Button
                  onClick={handleDeleteProfileImage}
                  className="px-4 py-2 rounded-md text-sm font-normal"
                >
                  사진 삭제
                </Button>
              )}
          </div>
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-gray-700 text-lg font-medium mb-2"
          >
            이름
          </label>
          <input
            id="name"
            type="text"
            value={currentUserProfile?.name || ""}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-gray-700 text-lg font-medium mb-2"
          >
            전화번호
          </label>
          <input
            id="phone"
            type="tel"
            value={currentUserProfile?.phone || ""}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
          />
        </div>
        <div>
          <label
            htmlFor="nickname"
            className="block text-gray-700 text-lg font-medium mb-2"
          >
            닉네임
          </label>
          <input
            id="nickname"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 text-gray-800"
            maxLength={10}
            value={currentNickname}
            onChange={handleNicknameChange}
            placeholder="2자 이상 10자 이내"
          />
        </div>

        <div>
          <label
            htmlFor="introduction"
            className="block text-gray-700 text-lg font-medium mb-2"
          >
            자기소개
          </label>
          <textarea
            id="introduction"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 resize-none text-gray-800"
            rows={5}
            maxLength={100}
            value={currentIntroduction}
            onChange={handleIntroductionChange}
            placeholder="100자 이내로 자신을 소개해주세요."
          ></textarea>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            onClick={handleCancel}
            bgColor="bg-gray-300"
            textColor="text-gray-800"
            hoverBgColor="hover:bg-gray-400"
            className="px-6 py-2 rounded-lg font-normal"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            bgColor="bg-main"
            textColor="text-white"
            hoverBgColor="hover:bg-apply"
            className="px-6 py-2 rounded-lg font-normal"
            disabled={loading}
          >
            {loading ? "저장 중..." : "저장하기"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditPage;
