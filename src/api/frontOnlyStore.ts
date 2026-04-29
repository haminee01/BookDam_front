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
  posts: [],
  comments: [],
  teamPosts: [],
  teamComments: [],
  wishlist: [],
  myLibrary: [],
  communityHistory: [],
  counters: {
    postId: 1000,
    commentId: 2000,
    teamPostId: 3000,
    teamCommentId: 4000,
    wishListId: 5000,
    libraryId: 6000,
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
