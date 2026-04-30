import type {
  Community,
  AppliedCommunity,
  ApplicantWithStatus,
  TeamCommunityWithBookTitle,
} from "../types";
import { isMockMode, isSupabaseConfigured, supabase, toNumericUserId } from "../lib/supabase";

const isFrontendOnlyMode = isMockMode;
const useSupabaseMode = !isMockMode && isSupabaseConfigured && Boolean(supabase);
const FRONT_ONLY_APPLIED_KEY = "frontOnlyAppliedCommunities";

const getAppliedCommunityIds = (): number[] => {
  try {
    const raw = localStorage.getItem(FRONT_ONLY_APPLIED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setAppliedCommunityIds = (ids: number[]) => {
  localStorage.setItem(FRONT_ONLY_APPLIED_KEY, JSON.stringify(ids));
};

const frontendOnlyCommunities: Community[] = [
  {
    id: "101",
    title: "한 달 한 권 독서모임",
    description: "월 1권 완독 후 온라인 토론을 진행합니다. 이번 달 도서는 데미안입니다.",
    hostName: "게스트북러버",
    hostId: 900001,
    currentMembers: 6,
    maxMembers: 8,
    role: "host",
    status: "활동중",
    createdAt: "2026-02-01T00:00:00.000Z",
    hasApplied: true,
  },
  {
    id: "102",
    title: "퇴근 후 인문학 북클럽",
    description: "평일 밤 9시에 1시간씩 인문학 책을 읽고 인사이트를 나눕니다.",
    hostName: "인문러",
    hostId: 910400,
    currentMembers: 5,
    maxMembers: 10,
    role: "member",
    status: "모집중",
    createdAt: "2026-03-02T00:00:00.000Z",
    hasApplied: true,
  },
  {
    id: "103",
    title: "고전 소설 재독 모임",
    description: "이미 읽은 고전을 다시 읽고 해석을 확장해보는 모임입니다.",
    hostName: "문학소년",
    hostId: 910401,
    currentMembers: 3,
    maxMembers: 7,
    role: "member",
    status: "모집중",
    createdAt: "2026-03-20T00:00:00.000Z",
  },
];

const mapSupabaseCommunity = (row: any, currentUserId?: number): Community => ({
  id: String(row.id),
  title: row.title,
  description: row.description,
  hostName: row.host_nickname ?? "게스트",
  hostId: row.host_numeric_id ?? 0,
  currentMembers: row.current_members ?? 1,
  maxMembers: row.max_members ?? 0,
  role: currentUserId && row.host_numeric_id === currentUserId ? "host" : "member",
  status: row.status === "RECRUITING" ? "모집중" : "모집종료",
  createdAt: row.created_at,
  hasApplied: row.has_applied ?? false,
});

export const fetchCommunities = async (
  page: number = 1,
  pageSize: number = 10,
  sort: string = "latest",
  userId?: number
): Promise<{ communities: Community[]; totalResults: number }> => {
  if (useSupabaseMode && supabase) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await supabase
      .from("communities")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: sort !== "latest" })
      .range(from, to);
    if (error) throw new Error(error.message);
    let appliedSet = new Set<number>();
    if (userId) {
      const { data: applied } = await supabase
        .from("community_applications")
        .select("community_id")
        .eq("applicant_numeric_id", userId)
        .in("status", ["PENDING", "ACCEPTED"]);
      appliedSet = new Set((applied ?? []).map((x: any) => x.community_id));
    }
    return {
      communities: (data ?? []).map((row: any) =>
        mapSupabaseCommunity({ ...row, has_applied: appliedSet.has(row.id) }, userId)
      ),
      totalResults: count ?? 0,
    };
  }

  if (isFrontendOnlyMode) {
    const appliedIds = getAppliedCommunityIds();
    const paged = frontendOnlyCommunities.slice((page - 1) * pageSize, page * pageSize);
    return {
      communities: paged.map((community) => ({
        ...community,
        hasApplied: appliedIds.includes(Number(community.id)),
      })),
      totalResults: frontendOnlyCommunities.length,
    };
  }

  return { communities: [], totalResults: 0 };
};

export const fetchCommunitiesByBookIsbn13 = async (
  isbn13: string,
  size: number = 10,
  userId?: number
): Promise<Community[]> => {
  if (useSupabaseMode && supabase) {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .eq("isbn13", isbn13)
      .order("created_at", { ascending: false })
      .limit(size);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => mapSupabaseCommunity(row, userId));
  }
  if (isFrontendOnlyMode) return frontendOnlyCommunities.slice(0, size);
  return [];
};

export const fetchCommunityById = async (
  communityId: number
): Promise<TeamCommunityWithBookTitle> => {
  if (useSupabaseMode && supabase) {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .eq("id", communityId)
      .single();
    if (error || !data) throw new Error("커뮤니티를 찾을 수 없습니다.");
    return {
      teamId: data.id,
      postId: data.id,
      isbn13: data.isbn13,
      status: data.status,
      postTitle: data.title,
      postContent: data.description,
      postAuthor: data.host_nickname ?? "게스트",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      maxMembers: data.max_members,
      bookTitle: data.book_title ?? null,
    };
  }
  const found = frontendOnlyCommunities.find((community) => Number(community.id) === communityId);
  if (!found) throw new Error("커뮤니티를 찾을 수 없습니다.");
  return {
    teamId: communityId,
    postId: communityId,
    isbn13: "9788936434120",
    status: found.status === "모집중" ? "RECRUITING" : "CLOSED",
    postTitle: found.title,
    postContent: found.description,
    postAuthor: found.hostName,
    createdAt: found.createdAt,
    updatedAt: found.createdAt,
    maxMembers: found.maxMembers,
    bookTitle: "프론트 단독 모드 샘플 도서",
  };
};

export const createCommunity = async (communityData: {
  isbn13: string;
  title: string;
  content: string;
  maxMembers: number;
}): Promise<string> => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error("로그인이 필요합니다.");
    const numericId = toNumericUserId(authData.user.id);
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", authData.user.id)
      .maybeSingle();
    const { data, error } = await supabase
      .from("communities")
      .insert({
        isbn13: communityData.isbn13,
        title: communityData.title,
        description: communityData.content,
        max_members: communityData.maxMembers,
        current_members: 1,
        status: "RECRUITING",
        host_id: authData.user.id,
        host_numeric_id: numericId,
        host_nickname: profile?.nickname ?? "게스트",
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "커뮤니티 생성 실패");
    return String(data.id);
  }
  const nextId =
    frontendOnlyCommunities.reduce((max, community) => Math.max(max, Number(community.id)), 100) + 1;
  frontendOnlyCommunities.unshift({
    id: String(nextId),
    title: communityData.title,
    description: communityData.content,
    hostName: "게스트",
    hostId: Number(localStorage.getItem("userId") ?? "1"),
    currentMembers: 1,
    maxMembers: communityData.maxMembers,
    role: "host",
    status: "모집중",
    createdAt: new Date().toISOString(),
  });
  return String(nextId);
};

export const updateCommunityDetails = async (
  communityId: string,
  updateData: { title?: string; content?: string; maxMembers?: number; recruiting?: boolean }
): Promise<Community> => {
  if (useSupabaseMode && supabase) {
    const patch: any = {
      title: updateData.title,
      description: updateData.content,
      max_members: updateData.maxMembers,
      updated_at: new Date().toISOString(),
    };
    if (updateData.recruiting !== undefined) patch.status = updateData.recruiting ? "RECRUITING" : "CLOSED";
    const { data, error } = await supabase
      .from("communities")
      .update(patch)
      .eq("id", Number(communityId))
      .select("*")
      .single();
    if (error || !data) throw new Error(error?.message ?? "커뮤니티 수정 실패");
    return mapSupabaseCommunity(data);
  }
  const idx = frontendOnlyCommunities.findIndex((c) => c.id === communityId);
  if (idx < 0) throw new Error("커뮤니티를 찾을 수 없습니다.");
  frontendOnlyCommunities[idx] = {
    ...frontendOnlyCommunities[idx],
    title: updateData.title ?? frontendOnlyCommunities[idx].title,
    description: updateData.content ?? frontendOnlyCommunities[idx].description,
    maxMembers: updateData.maxMembers ?? frontendOnlyCommunities[idx].maxMembers,
    status: updateData.recruiting === undefined ? frontendOnlyCommunities[idx].status : updateData.recruiting ? "모집중" : "모집종료",
  };
  return frontendOnlyCommunities[idx];
};

export const updateCommunityStatus = async (
  communityId: string,
  newStatus: "RECRUITING" | "ACTIVE" | "COMPLETED" | "CLOSED"
): Promise<Community> => {
  if (useSupabaseMode && supabase) {
    const { data, error } = await supabase
      .from("communities")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", Number(communityId))
      .select("*")
      .single();
    if (error || !data) throw new Error(error?.message ?? "상태 변경 실패");
    return mapSupabaseCommunity(data);
  }
  const idx = frontendOnlyCommunities.findIndex((c) => c.id === communityId);
  if (idx < 0) throw new Error("커뮤니티를 찾을 수 없습니다.");
  frontendOnlyCommunities[idx].status = newStatus === "RECRUITING" ? "모집중" : "모집종료";
  return frontendOnlyCommunities[idx];
};

export const deleteCommunity = async (communityId: number): Promise<void> => {
  if (useSupabaseMode && supabase) {
    const { error } = await supabase.from("communities").delete().eq("id", communityId);
    if (error) throw new Error(error.message);
    return;
  }
  const idx = frontendOnlyCommunities.findIndex((community) => Number(community.id) === communityId);
  if (idx >= 0) frontendOnlyCommunities.splice(idx, 1);
};

export const applyToCommunity = async (
  communityId: string,
  applicationMessage: string
): Promise<string> => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error("로그인이 필요합니다.");
    const numericId = toNumericUserId(authData.user.id);
    const { data: profile } = await supabase.from("profiles").select("nickname").eq("id", authData.user.id).maybeSingle();
    const { error } = await supabase.from("community_applications").insert({
      community_id: Number(communityId),
      applicant_id: authData.user.id,
      applicant_numeric_id: numericId,
      applicant_nickname: profile?.nickname ?? "게스트",
      application_message: applicationMessage,
      status: "PENDING",
    });
    if (error) throw new Error(error.message);
    return "신청이 완료되었습니다.";
  }
  const id = Number(communityId);
  if (Number.isNaN(id)) throw new Error("올바르지 않은 커뮤니티 ID입니다.");
  const appliedIds = getAppliedCommunityIds();
  if (!appliedIds.includes(id)) setAppliedCommunityIds([...appliedIds, id]);
  return "신청이 완료되었습니다. (프론트 단독 모드)";
};

export const applyToCommunityByPostId = async (
  _postId: number,
  _applicationMessage: string
): Promise<string> => {
  if (useSupabaseMode) return "postId 기반 신청은 지원하지 않습니다.";
  return "신청이 완료되었습니다. (프론트 단독 모드)";
};

export const fetchApplicantsByCommunity = async (
  communityId: string
): Promise<{ message: string; applicants: ApplicantWithStatus[] }> => {
  if (useSupabaseMode && supabase) {
    const { data, error } = await supabase
      .from("community_applications")
      .select("*")
      .eq("community_id", Number(communityId))
      .order("applied_at", { ascending: false });
    if (error) throw new Error(error.message);
    return {
      message: "ok",
      applicants: (data ?? []).map((row: any) => ({
        id: String(row.id),
        applicationId: row.id,
        userId: row.applicant_numeric_id,
        nickname: row.applicant_nickname ?? "게스트",
        appliedAt: row.applied_at,
        applicationMessage: row.application_message,
        status: row.status.toLowerCase(),
      })),
    };
  }
  const appliedIds = getAppliedCommunityIds();
  if (!appliedIds.includes(Number(communityId))) return { message: "ok", applicants: [] };
  return {
    message: "ok",
    applicants: [
      {
        id: "1",
        applicationId: 1,
        userId: 1,
        nickname: "게스트",
        appliedAt: new Date().toISOString(),
        applicationMessage: "참여하고 싶습니다.",
        status: "pending",
      },
    ],
  };
};

export const updateApplicationStatus = async (
  communityId: string,
  userId: string,
  status: "ACCEPTED" | "REJECTED"
): Promise<void> => {
  if (useSupabaseMode && supabase) {
    const { error } = await supabase
      .from("community_applications")
      .update({ status, processed_at: new Date().toISOString() })
      .eq("community_id", Number(communityId))
      .eq("applicant_numeric_id", Number(userId));
    if (error) throw new Error(error.message);
  }
};

export const cancelRecruitment = async (communityId: string): Promise<void> => {
  if (useSupabaseMode && supabase) {
    const { error } = await supabase
      .from("communities")
      .update({ status: "CLOSED", updated_at: new Date().toISOString() })
      .eq("id", Number(communityId));
    if (error) throw new Error(error.message);
    return;
  }
  const idx = frontendOnlyCommunities.findIndex((c) => c.id === communityId);
  if (idx >= 0) frontendOnlyCommunities[idx].status = "모집종료";
};

export const cancelApplication = async (applicationId: string): Promise<void> => {
  if (useSupabaseMode && supabase) {
    const { error } = await supabase.from("community_applications").delete().eq("id", Number(applicationId));
    if (error) throw new Error(error.message);
    return;
  }
  const appliedIds = getAppliedCommunityIds().filter((id) => String(id) !== applicationId);
  setAppliedCommunityIds(appliedIds);
};

export const fetchParticipatingCommunities = async (): Promise<Community[]> => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return [];
    const numericId = toNumericUserId(authData.user.id);
    const { data: appRows } = await supabase
      .from("community_applications")
      .select("community_id")
      .eq("applicant_numeric_id", numericId)
      .eq("status", "ACCEPTED");
    const ids = [...new Set((appRows ?? []).map((r: any) => r.community_id))];
    if (!ids.length) return [];
    const { data, error } = await supabase.from("communities").select("*").in("id", ids);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => mapSupabaseCommunity(row, numericId));
  }
  const userId = Number(localStorage.getItem("userId") ?? "1");
  return frontendOnlyCommunities.filter((community) => community.hostId === userId || community.hasApplied);
};

export const leaveOrDeleteCommunity = async (communityId: string): Promise<void> => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    const numericId = toNumericUserId(authData.user.id);
    const { data: community } = await supabase
      .from("communities")
      .select("host_numeric_id")
      .eq("id", Number(communityId))
      .maybeSingle();
    if (community?.host_numeric_id === numericId) {
      await supabase.from("communities").delete().eq("id", Number(communityId));
    } else {
      await supabase
        .from("community_applications")
        .delete()
        .eq("community_id", Number(communityId))
        .eq("applicant_numeric_id", numericId);
    }
    return;
  }
  const idx = frontendOnlyCommunities.findIndex((c) => c.id === communityId);
  if (idx >= 0) frontendOnlyCommunities.splice(idx, 1);
};

export const fetchAppliedCommunities = async (): Promise<AppliedCommunity[]> => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return [];
    const numericId = toNumericUserId(authData.user.id);
    const { data: apps } = await supabase
      .from("community_applications")
      .select("*")
      .eq("applicant_numeric_id", numericId)
      .order("applied_at", { ascending: false });
    const ids = (apps ?? []).map((a: any) => a.community_id);
    if (!ids.length) return [];
    const { data: communities } = await supabase.from("communities").select("*").in("id", ids);
    const byId = new Map((communities ?? []).map((c: any) => [c.id, c]));
    return (apps ?? [])
      .map((app: any) => {
        const c = byId.get(app.community_id);
        if (!c) return null;
        return {
          ...mapSupabaseCommunity(c, numericId),
          applicationId: app.id,
          myApplicationStatus: app.status.toLowerCase(),
        } as AppliedCommunity;
      })
      .filter(Boolean) as AppliedCommunity[];
  }
  const appliedIds = getAppliedCommunityIds();
  return frontendOnlyCommunities
    .filter((community) => appliedIds.includes(Number(community.id)))
    .map((community, index) => ({
      ...community,
      applicationId: index + 1,
      myApplicationStatus: "pending",
    }));
};

export const fetchMyRecruitingCommunities = async (): Promise<Community[]> => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return [];
    const numericId = toNumericUserId(authData.user.id);
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .eq("host_numeric_id", numericId)
      .eq("status", "RECRUITING")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => mapSupabaseCommunity(row, numericId));
  }
  const userId = Number(localStorage.getItem("userId") ?? "1");
  return frontendOnlyCommunities.filter((community) => community.hostId === userId);
};

export const endRecruitment = async (communityId: string): Promise<void> => {
  if (useSupabaseMode && supabase) {
    const { error } = await supabase
      .from("communities")
      .update({ status: "CLOSED", updated_at: new Date().toISOString() })
      .eq("id", Number(communityId));
    if (error) throw new Error(error.message);
    return;
  }
  const idx = frontendOnlyCommunities.findIndex((c) => c.id === communityId);
  if (idx >= 0) frontendOnlyCommunities[idx].status = "모집종료";
};

export const fetchMyEndedCommunities = async (): Promise<Community[]> => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return [];
    const numericId = toNumericUserId(authData.user.id);
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .eq("host_numeric_id", numericId)
      .eq("status", "CLOSED")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => mapSupabaseCommunity(row, numericId));
  }
  return frontendOnlyCommunities.filter((community) => community.status === "모집종료");
};
