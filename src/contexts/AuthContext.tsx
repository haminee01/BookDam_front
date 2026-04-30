import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import type { UserProfile } from "../types/auth";
import { isMockMode, isSupabaseConfigured, supabase, toNumericUserId } from "../lib/supabase";
import { GUEST_PROFILE, GUEST_TOKEN, GUEST_USER_ID } from "../constants/guestAccount";

const useLegacyBackendMode =
  !isMockMode && !isSupabaseConfigured && Boolean(import.meta.env.VITE_API_BASE_URL);

interface AuthContextType {
  isLoggedIn: boolean;
  userId: number | null;
  currentUserProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateAuthState: () => void;
  clearAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [currentUserProfile, setCurrentUserProfile] =
    useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 인증 상태 확인 함수
  const checkAuthStatus = async () => {
    if (isMockMode) {
      const token = localStorage.getItem("accessToken");
      const storedUserId = Number(localStorage.getItem("userId") ?? "0");
      const isGuestSession = token === GUEST_TOKEN && storedUserId === GUEST_USER_ID;

      if (isGuestSession) {
        setIsLoggedIn(true);
        setUserId(GUEST_USER_ID);
        setCurrentUserProfile({
          userId: GUEST_PROFILE.userId,
          email: GUEST_PROFILE.email,
          name: GUEST_PROFILE.name,
          profileImage: GUEST_PROFILE.profileImage ?? undefined,
        });
        return true;
      }

      setIsLoggedIn(false);
      setUserId(null);
      setCurrentUserProfile(null);
      return false;
    }

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session?.user) {
        setIsLoggedIn(false);
        setUserId(null);
        setCurrentUserProfile(null);
        return false;
      }

      const numericId = toNumericUserId(session.user.id);
      localStorage.setItem("userId", String(numericId));
      localStorage.setItem("accessToken", session.access_token);
      setIsLoggedIn(true);
      setUserId(numericId);
      return true;
    }

    if (!useLegacyBackendMode) {
      setIsLoggedIn(false);
      setUserId(null);
      setCurrentUserProfile(null);
      return false;
    }

    const token = localStorage.getItem("accessToken");
    const storedUserId = localStorage.getItem("userId");

    if (token && storedUserId) {
      const newUserId = Number(storedUserId);
      setIsLoggedIn(true);
      setUserId(newUserId);
      return true;
    } else {
      setIsLoggedIn(false);
      setUserId(null);
      setCurrentUserProfile(null);
      return false;
    }
  };

  // 사용자 프로필 가져오기
  const fetchUserProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      if (isMockMode && userId === GUEST_USER_ID) {
        setCurrentUserProfile({
          userId: GUEST_PROFILE.userId,
          email: GUEST_PROFILE.email,
          name: GUEST_PROFILE.name,
          profileImage: GUEST_PROFILE.profileImage ?? undefined,
        });
        setError(null);
        return;
      }

      if (isSupabaseConfigured && supabase) {
        const { data: authData } = await supabase.auth.getUser();
        const authUser = authData.user;
        if (!authUser) {
          clearAuthState();
          return;
        }

        const { data: profileRow } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        setCurrentUserProfile({
          userId: toNumericUserId(authUser.id),
          email: authUser.email ?? "",
          name:
            profileRow?.name ??
            (authUser.user_metadata?.name as string | undefined) ??
            "",
          profileImage: profileRow?.profile_image ?? undefined,
        });
        setError(null);
        return;
      }

      const response = await apiClient.get<{
        user: UserProfile;
        message: string;
      }>("/mypage/getProfile");
      setCurrentUserProfile(response.data.user);
      setError(null);
    } catch (err) {
      console.error("프로필 가져오기 실패:", err);
      setError("프로필을 가져오는데 실패했습니다.");
      // 프로필 가져오기 실패 시 로그아웃 처리
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  // 인증 상태 업데이트
  const updateAuthState = () => {
    checkAuthStatus().then((isAuthenticated) => {
      if (isAuthenticated) fetchUserProfile();
    });
  };

  // 인증 상태 초기화
  const clearAuthState = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUserId(null);
    setCurrentUserProfile(null);
    setError(null);

    // 모든 React Query 캐시 초기화
    queryClient.clear();

    // 특정 쿼리들 무효화
    queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    queryClient.invalidateQueries({ queryKey: ["allCommunities"] });
    queryClient.invalidateQueries({ queryKey: ["bestsellers"] });
    queryClient.invalidateQueries({ queryKey: ["newBooks"] });
    queryClient.invalidateQueries({ queryKey: ["specialNewBooks"] });
    queryClient.invalidateQueries({ queryKey: ["allPosts"] });
    queryClient.invalidateQueries({ queryKey: ["teamPosts"] });
    queryClient.invalidateQueries({ queryKey: ["myPosts"] });
    queryClient.invalidateQueries({ queryKey: ["myComments"] });
    queryClient.invalidateQueries({ queryKey: ["post"] });
    queryClient.invalidateQueries({ queryKey: ["teamPost"] });
    queryClient.invalidateQueries({ queryKey: ["appliedCommunities"] });
    queryClient.invalidateQueries({ queryKey: ["participatingCommunities"] });
    queryClient.invalidateQueries({ queryKey: ["recruitingCommunities"] });

    navigate("/");
  };

  // 로그인 함수
  const login = async (email: string, password: string): Promise<boolean> => {
    if (isMockMode) {
      const normalizedEmail = email.trim().toLowerCase();
      const canGuestLogin =
        normalizedEmail === GUEST_PROFILE.email && password.trim().length > 0;
      if (!canGuestLogin) {
        setError("테스트 계정으로 로그인해주세요. (guest@bookdam.local)");
        return false;
      }

      localStorage.setItem("accessToken", GUEST_TOKEN);
      localStorage.setItem("userId", String(GUEST_USER_ID));
      setIsLoggedIn(true);
      setUserId(GUEST_USER_ID);
      setCurrentUserProfile({
        userId: GUEST_PROFILE.userId,
        email: GUEST_PROFILE.email,
        name: GUEST_PROFILE.name,
        profileImage: GUEST_PROFILE.profileImage ?? undefined,
      });
      setError(null);
      navigate("/");
      return true;
    }

    try {
      setLoading(true);
      setError(null);

      if (isSupabaseConfigured && supabase) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        const authUser = data.user;
        if (!authUser || !data.session) {
          throw new Error("로그인 세션을 생성하지 못했습니다.");
        }

        const numericId = toNumericUserId(authUser.id);
        localStorage.setItem("accessToken", data.session.access_token);
        localStorage.setItem("userId", numericId.toString());
        setIsLoggedIn(true);
        setUserId(numericId);
        await fetchUserProfile();
        navigate("/");
        return true;
      }

      const response = await apiClient.post("/auth/login", { email, password });
      const { token, userId: newUserId } = response.data;

      localStorage.setItem("accessToken", token);
      localStorage.setItem("userId", newUserId.toString());

      setIsLoggedIn(true);
      setUserId(newUserId);

      await fetchUserProfile();

      navigate("/");
      return true;
    } catch (err: any) {
      let errorMessage = "로그인 중 오류가 발생했습니다.";

      if (err.response?.data?.errorMessage) {
        errorMessage = err.response.data.errorMessage;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setLoading(false);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
    }
    clearAuthState();
  };

  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // userId가 변경될 때 프로필 가져오기
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // 윈도우 포커스 시 인증 상태 재확인
  useEffect(() => {
    const handleFocus = () => {
      checkAuthStatus();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const value: AuthContextType = {
    isLoggedIn,
    userId,
    currentUserProfile,
    loading,
    error,
    login,
    logout,
    updateAuthState,
    clearAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
