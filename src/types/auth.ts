export interface UserProfile {
  userId: number;
  email: string;
  name: string;
  profileImage?: string;
  // 필요한 다른 프로필 필드들
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  message: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
