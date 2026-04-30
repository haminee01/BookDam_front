import type {
  Comment,
  CommunityHistoryEntry,
  Post,
  TeamComment,
  TeamPost,
} from "../types";

interface FrontOnlyStore {
  posts: Post[];
  comments: Comment[];
  teamPosts: TeamPost[];
  teamComments: TeamComment[];
  wishlist: {
    wishListId: number;
    addedAt: string;
    book: { isbn13: string; title: string; cover: string | null };
    user: { nickname: string };
  }[];
  myLibrary: {
    libraryId: number;
    status: "WANT_TO_READ" | "READING" | "COMPLETED";
    myRating: number | null;
    updatedAt: string;
    book: {
      isbn13: string;
      title: string;
      author: string;
      publisher: string;
      cover: string | null;
      category: string | null;
    };
    user: { nickname: string };
  }[];
  communityHistory: CommunityHistoryEntry[];
  counters: {
    postId: number;
    commentId: number;
    teamPostId: number;
    teamCommentId: number;
    wishListId: number;
    libraryId: number;
  };
}

const STORE_KEY = "bookdam-front-only-store";

const nowIso = () => new Date().toISOString();

const baseStore: FrontOnlyStore = {
  posts: [
    {
      postId: 1001,
      userId: 900001,
      title: "요즘 읽기 좋은 봄 감성 소설 추천 부탁드려요",
      content: "벚꽃 시즌에 읽기 좋은 잔잔한 소설 찾고 있어요. 최근 읽은 책도 같이 공유해주세요!",
      type: "GENERAL",
      createdAt: "2026-03-25T12:00:00.000Z",
      updatedAt: "2026-03-25T12:00:00.000Z",
      user: { nickname: "게스트북러버", profileImage: null },
      _count: { comments: 2 },
    },
    {
      postId: 1002,
      userId: 910101,
      title: "4월 독서 루틴 챌린지 같이 하실 분",
      content: "매일 30분 읽고 인증하는 루틴 챌린지 열어요. 부담 없이 참여해요!",
      type: "RECRUITMENT",
      createdAt: "2026-03-22T09:30:00.000Z",
      updatedAt: "2026-03-22T09:30:00.000Z",
      user: { nickname: "독서메이트", profileImage: null },
      _count: { comments: 3 },
    },
  ],
  comments: [
    {
      commentId: 2001,
      postId: 1001,
      userId: 910201,
      content: "저는 '불편한 편의점' 다시 읽는 중인데 정말 좋아요.",
      createdAt: "2026-03-25T13:20:00.000Z",
      updatedAt: "2026-03-25T13:20:00.000Z",
      parentId: null,
      user: { nickname: "책갈피", profileImage: null },
    },
    {
      commentId: 2002,
      postId: 1001,
      userId: 900001,
      content: "추천 감사합니다! 이번 주말에 바로 읽어볼게요.",
      createdAt: "2026-03-25T14:10:00.000Z",
      updatedAt: "2026-03-25T14:10:00.000Z",
      parentId: 2001,
      user: { nickname: "게스트북러버", profileImage: null },
    },
  ],
  teamPosts: [
    {
      teamPostId: 3001,
      teamId: 101,
      userId: 900001,
      title: "이번 주 토론 질문 미리 공유합니다",
      content: "1) 주인공의 선택에 공감했는지, 2) 인상 깊은 문장 한 줄씩 공유해요.",
      type: "DISCUSSION",
      createdAt: "2026-03-21T11:00:00.000Z",
      updatedAt: "2026-03-21T11:00:00.000Z",
      user: { nickname: "게스트북러버", profileImage: null },
      _count: { comments: 1 },
    },
  ],
  teamComments: [
    {
      teamCommentId: 4001,
      teamPostId: 3001,
      communityId: 101,
      userId: 910301,
      content: "질문 좋아요! 저는 2번 질문이 특히 기대돼요.",
      createdAt: "2026-03-21T12:30:00.000Z",
      updatedAt: "2026-03-21T12:30:00.000Z",
      parentId: null,
      user: { nickname: "문장수집가", profileImage: null },
    },
  ],
  wishlist: [
    {
      wishListId: 5001,
      addedAt: "2026-03-18T10:00:00.000Z",
      book: {
        isbn13: "9788936434120",
        title: "데미안",
        cover: "https://via.placeholder.com/300x430?text=BookDam",
      },
      user: { nickname: "게스트북러버" },
    },
    {
      wishListId: 5002,
      addedAt: "2026-03-19T10:00:00.000Z",
      book: {
        isbn13: "9788937460005",
        title: "어린 왕자",
        cover: "https://via.placeholder.com/300x430?text=BookDam",
      },
      user: { nickname: "게스트북러버" },
    },
  ],
  myLibrary: [
    {
      libraryId: 6001,
      status: "COMPLETED",
      myRating: 5,
      updatedAt: "2026-03-15T08:00:00.000Z",
      book: {
        isbn13: "9788936439743",
        title: "사피엔스",
        author: "유발 하라리",
        publisher: "김영사",
        cover: "https://via.placeholder.com/300x430?text=BookDam",
        category: "인문",
      },
      user: { nickname: "게스트북러버" },
    },
    {
      libraryId: 6002,
      status: "READING",
      myRating: 4,
      updatedAt: "2026-03-20T20:00:00.000Z",
      book: {
        isbn13: "9788937462672",
        title: "불편한 편의점",
        author: "김호연",
        publisher: "나무옆의자",
        cover: "https://via.placeholder.com/300x430?text=BookDam",
        category: "소설",
      },
      user: { nickname: "게스트북러버" },
    },
    {
      libraryId: 6003,
      status: "WANT_TO_READ",
      myRating: null,
      updatedAt: "2026-03-23T20:00:00.000Z",
      book: {
        isbn13: "9788936433598",
        title: "아몬드",
        author: "손원평",
        publisher: "창비",
        cover: "https://via.placeholder.com/300x430?text=BookDam",
        category: "소설",
      },
      user: { nickname: "게스트북러버" },
    },
  ],
  communityHistory: [
    {
      communityName: "한 달 한 권 독서모임",
      role: "host",
      startDate: "2026-02-01T00:00:00.000Z",
      status: "활동중",
    },
    {
      communityName: "퇴근 후 인문학 북클럽",
      role: "member",
      startDate: "2026-01-10T00:00:00.000Z",
      endDate: "2026-03-10T00:00:00.000Z",
      status: "완료",
    },
  ],
  counters: {
    postId: 1002,
    commentId: 2002,
    teamPostId: 3001,
    teamCommentId: 4001,
    wishListId: 5002,
    libraryId: 6003,
  },
};

export const getCurrentUserId = (): number =>
  Number(localStorage.getItem("userId") ?? "1");

const getCurrentNickname = (): string => "게스트";

export const readFrontOnlyStore = (): FrontOnlyStore => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return baseStore;
    const parsed = JSON.parse(raw) as FrontOnlyStore;
    return {
      ...baseStore,
      ...parsed,
      counters: {
        ...baseStore.counters,
        ...(parsed.counters ?? {}),
      },
    };
  } catch {
    return baseStore;
  }
};

export const writeFrontOnlyStore = (store: FrontOnlyStore) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
};

export const nextCounter = (key: keyof FrontOnlyStore["counters"]): number => {
  const store = readFrontOnlyStore();
  store.counters[key] += 1;
  const value = store.counters[key];
  writeFrontOnlyStore(store);
  return value;
};

export const createLocalPost = (title: string, content: string, type: string): Post => {
  const store = readFrontOnlyStore();
  const post: Post = {
    postId: nextCounter("postId"),
    userId: getCurrentUserId(),
    title,
    content,
    type,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    user: { nickname: getCurrentNickname(), profileImage: null },
    _count: { comments: 0 },
  };
  store.posts.unshift(post);
  writeFrontOnlyStore(store);
  return post;
};

export const createLocalComment = (
  postId: number,
  content: string,
  parentId: number | null
): Comment => {
  const store = readFrontOnlyStore();
  const comment: Comment = {
    commentId: nextCounter("commentId"),
    postId,
    userId: getCurrentUserId(),
    content,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    parentId,
    user: { nickname: getCurrentNickname(), profileImage: null },
  };
  store.comments.push(comment);
  writeFrontOnlyStore(store);
  return comment;
};

export const createLocalTeamPost = (
  communityId: string,
  title: string,
  content: string,
  type = "DISCUSSION"
): TeamPost => {
  const store = readFrontOnlyStore();
  const teamPost: TeamPost = {
    teamPostId: nextCounter("teamPostId"),
    teamId: Number(communityId),
    userId: getCurrentUserId(),
    title,
    content,
    type,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    user: { nickname: getCurrentNickname(), profileImage: null },
    _count: { comments: 0 },
  };
  store.teamPosts.unshift(teamPost);
  writeFrontOnlyStore(store);
  return teamPost;
};

export const createLocalTeamComment = (
  teamPostId: number,
  content: string,
  parentId: number | null
): TeamComment => {
  const store = readFrontOnlyStore();
  const comment: TeamComment = {
    teamCommentId: nextCounter("teamCommentId"),
    teamPostId,
    userId: getCurrentUserId(),
    content,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    parentId,
    user: { nickname: getCurrentNickname(), profileImage: null },
  };
  store.teamComments.push(comment);
  writeFrontOnlyStore(store);
  return comment;
};
