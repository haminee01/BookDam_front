import type { UserProfile } from "../types";

export const GUEST_USER_ID = 900001;
export const GUEST_TOKEN = "guest-access-token";

export const GUEST_PROFILE: UserProfile = {
  userId: GUEST_USER_ID,
  email: "guest@bookdam.local",
  name: "북담 게스트",
  nickname: "게스트북러버",
  phone: "010-0000-0000",
  profileImage: "https://api.dicebear.com/8.x/thumbs/svg?seed=BookDamGuest",
  introduction: "면접/데모용 계정입니다. 북담의 주요 기능을 바로 체험해보세요.",
  role: "GUEST",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};
