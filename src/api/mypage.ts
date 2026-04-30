// src/api/mypage.ts

import apiClient from "./apiClient";
import type { Post, Comment, CommunityHistoryEntry } from "../types";
import { getCurrentUserId, readFrontOnlyStore, writeFrontOnlyStore } from "./frontOnlyStore";
import { isMockMode, isSupabaseConfigured, supabase, toNumericUserId } from "../lib/supabase";
import { fetchBestsellers, fetchNewBooks, fetchSpecialNewBooks } from "./books";

const isFrontendOnlyMode = isMockMode;
const useSupabaseMode = !isMockMode && isSupabaseConfigured && Boolean(supabase);

const shuffle = <T,>(items: T[]): T[] => {
  const copied = [...items];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
};

const hasPlaceholderBookData = (title: string, cover: string | null): boolean =>
  title.startsWith("도서 ") || Boolean(cover && cover.includes("via.placeholder.com"));

const ensureFrontOnlyBookSeeds = async () => {
  const store = readFrontOnlyStore();
  const needsLibrarySeed =
    store.myLibrary.length === 0 ||
    store.myLibrary.some((item) =>
      hasPlaceholderBookData(item.book.title, item.book.cover)
    );
  const needsWishlistSeed =
    store.wishlist.length === 0 ||
    store.wishlist.some((item) =>
      hasPlaceholderBookData(item.book.title, item.book.cover)
    );

  if (!needsLibrarySeed && !needsWishlistSeed) {
    return store;
  }

  try {
    const [bestsellers, newBooks, specialBooks] = await Promise.all([
      fetchBestsellers(1, 20),
      fetchNewBooks(1, 20),
      fetchSpecialNewBooks(1, 20),
    ]);

    const merged = [...bestsellers, ...newBooks, ...specialBooks].filter(
      (book) => Boolean(book.isbn13 && book.title)
    );
    const uniqueByIsbn = Array.from(
      new Map(merged.map((book) => [book.isbn13, book])).values()
    );
    const picked = shuffle(uniqueByIsbn).slice(0, 9);

    if (picked.length === 0) return store;

    if (needsLibrarySeed) {
      store.myLibrary = picked.slice(0, 6).map((book, idx) => ({
        libraryId: 7000 + idx + 1,
        status:
          idx % 3 === 0
            ? "READING"
            : idx % 3 === 1
              ? "COMPLETED"
              : "WANT_TO_READ",
        myRating: idx % 3 === 1 ? 4 + (idx % 2) : null,
        updatedAt: new Date(Date.now() - idx * 86400000).toISOString(),
        book: {
          isbn13: book.isbn13,
          title: book.title,
          author: book.author || "작자 미상",
          publisher: book.publisher || "출판사 정보 없음",
          cover: book.cover || null,
          category: book.category || "기타",
        },
        user: { nickname: "게스트북러버" },
      }));
      store.counters.libraryId = 7000 + store.myLibrary.length;
    }

    if (needsWishlistSeed) {
      store.wishlist = picked.slice(3, 9).map((book, idx) => ({
        wishListId: 8000 + idx + 1,
        addedAt: new Date(Date.now() - idx * 43200000).toISOString(),
        book: {
          isbn13: book.isbn13,
          title: book.title,
          cover: book.cover || null,
        },
        user: { nickname: "게스트북러버" },
      }));
      store.counters.wishListId = 8000 + store.wishlist.length;
    }

    writeFrontOnlyStore(store);
    return store;
  } catch {
    return store;
  }
};

interface WishlistResponseData {
  data: {
    wishListId: number;
    addedAt: string;
    book: {
      isbn13: string;
      title: string;
      cover: string | null;
    };
    user: {
      nickname: string;
    };
  }[];
}

export interface MyLibraryResponseData {
  data: {
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
    user: {
      nickname: string;
    };
  }[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

interface UpsertMyLibraryRequest {
  isbn13: string;
  status: "WANT_TO_READ" | "READING" | "COMPLETED";
  myRating?: number | null;
}

export const fetchMyPosts = async (
  page: number,
  size: number
): Promise<{ posts: Post[]; total: number }> => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return { posts: [], total: 0 };
    const numericId = toNumericUserId(authData.user.id);
    const from = (page - 1) * size;
    const to = from + size - 1;
    const { data, error, count } = await supabase
      .from("posts")
      .select("*", { count: "exact" })
      .eq("user_numeric_id", numericId)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw new Error(error.message);
    return {
      posts: (data ?? []).map((row: any) => ({
        postId: row.id,
        userId: row.user_numeric_id,
        title: row.title,
        content: row.content,
        type: row.type,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        user: {
          nickname: row.nickname ?? "게스트",
          profileImage: row.profile_image ?? null,
        },
      })),
      total: count ?? 0,
    };
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    const my = store.posts.filter((post) => post.userId === getCurrentUserId());
    const start = (page - 1) * size;
    return { posts: my.slice(start, start + size), total: my.length };
  }

  try {
    const response = await apiClient.get<{ posts: Post[]; total: number }>(
      `/mypage/my-posts?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch my posts:", error);
    throw error;
  }
};

export const fetchMyComments = async (
  page: number,
  size: number
): Promise<{ comments: Comment[]; total: number }> => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return { comments: [], total: 0 };
    const numericId = toNumericUserId(authData.user.id);
    const from = (page - 1) * size;
    const to = from + size - 1;
    const { data, error, count } = await supabase
      .from("comments")
      .select("*", { count: "exact" })
      .eq("user_numeric_id", numericId)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw new Error(error.message);
    return {
      comments: (data ?? []).map((row: any) => ({
        commentId: row.id,
        postId: row.post_id,
        userId: row.user_numeric_id,
        content: row.content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        parentId: row.parent_id,
        user: {
          nickname: row.nickname ?? "게스트",
          profileImage: row.profile_image ?? null,
        },
      })),
      total: count ?? 0,
    };
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    const my = store.comments.filter(
      (comment) => comment.userId === getCurrentUserId()
    );
    const start = (page - 1) * size;
    return { comments: my.slice(start, start + size), total: my.length };
  }

  try {
    const response = await apiClient.get<{
      comments: Comment[];
      total: number;
    }>(`/mypage/my-comments?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch my comments:", error);
    throw error;
  }
};

export const fetchWishlist = async (): Promise<
  WishlistResponseData["data"]
> => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return [];
    const numericId = toNumericUserId(authData.user.id);
    const { data, error } = await supabase
      .from("wishlist")
      .select("*")
      .eq("user_numeric_id", numericId)
      .order("added_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => ({
      wishListId: row.id,
      addedAt: row.added_at,
      book: {
        isbn13: row.isbn13,
        title: row.title,
        cover: row.cover,
      },
      user: {
        nickname: row.nickname ?? "게스트",
      },
    }));
  }

  if (isFrontendOnlyMode) {
    const store = await ensureFrontOnlyBookSeeds();
    return store.wishlist;
  }

  try {
    const response = await apiClient.get<WishlistResponseData>(
      `/mypage/wishlist`
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    throw error;
  }
};

export const addWish = async (isbn13: string) => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error("로그인이 필요합니다.");
    const numericId = toNumericUserId(authData.user.id);
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", authData.user.id)
      .maybeSingle();
    const { error } = await supabase.from("wishlist").upsert(
      {
        user_id: authData.user.id,
        user_numeric_id: numericId,
        isbn13,
        title: `도서 ${isbn13}`,
        cover: null,
        nickname: profile?.nickname ?? "게스트",
      },
      { onConflict: "user_id,isbn13" }
    );
    if (error) throw new Error(error.message);
    return { message: "찜 목록에 추가되었습니다." };
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    const exists = store.wishlist.some((item) => item.book.isbn13 === isbn13);
    if (!exists) {
      const nextId =
        store.wishlist.reduce((max, item) => Math.max(max, item.wishListId), 5000) +
        1;
      store.wishlist.unshift({
        wishListId: nextId,
        addedAt: new Date().toISOString(),
        book: { isbn13, title: `도서 ${isbn13}`, cover: null },
        user: { nickname: "게스트" },
      });
      writeFrontOnlyStore(store);
    }
    return { message: "찜 목록에 추가되었습니다." };
  }

  try {
    const response = await apiClient.post(`/mypage/wishlist`, { isbn13 });
    return response.data;
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    throw error;
  }
};

export const removeWish = async (isbn13: string) => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error("로그인이 필요합니다.");
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", authData.user.id)
      .eq("isbn13", isbn13);
    if (error) throw new Error(error.message);
    return { message: "찜 목록에서 제거되었습니다." };
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    store.wishlist = store.wishlist.filter((item) => item.book.isbn13 !== isbn13);
    writeFrontOnlyStore(store);
    return { message: "찜 목록에서 제거되었습니다." };
  }

  try {
    const response = await apiClient.delete(`/mypage/wishlist/${isbn13}`);
    return response.data;
  } catch (error) {
    console.error("Failed to remove from wishlist:", error);
    throw error;
  }
};

export const fetchMyLibrary = async (
  page: number,
  limit: number,
  status?: "WANT_TO_READ" | "READING" | "COMPLETED"
): Promise<MyLibraryResponseData> => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      return {
        data: [],
        pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit },
      };
    }
    const numericId = toNumericUserId(authData.user.id);
    let query = supabase
      .from("my_library")
      .select("*", { count: "exact" })
      .eq("user_numeric_id", numericId)
      .order("updated_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) throw new Error(error.message);
    const totalItems = count ?? 0;
    return {
      data: (data ?? []).map((row: any) => ({
        libraryId: row.id,
        status: row.status,
        myRating: row.my_rating,
        updatedAt: row.updated_at,
        book: {
          isbn13: row.isbn13,
          title: row.title,
          author: row.author,
          publisher: row.publisher,
          cover: row.cover,
          category: row.category,
        },
        user: { nickname: row.nickname ?? "게스트" },
      })),
      pagination: {
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  if (isFrontendOnlyMode) {
    const store = await ensureFrontOnlyBookSeeds();
    const filtered = status
      ? store.myLibrary.filter((item) => item.status === status)
      : store.myLibrary;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);
    return {
      data,
      pagination: {
        totalItems: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  try {
    let url = `/mypage/my-library?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await apiClient.get<MyLibraryResponseData>(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch my library:", error);
    throw error;
  }
};

export const upsertBookToMyLibrary = async (
  isbn13: string,
  status: "WANT_TO_READ" | "READING" | "COMPLETED",
  myRating?: number | null
) => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error("로그인이 필요합니다.");
    const numericId = toNumericUserId(authData.user.id);
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", authData.user.id)
      .maybeSingle();
    const { error } = await supabase.from("my_library").upsert(
      {
        user_id: authData.user.id,
        user_numeric_id: numericId,
        isbn13,
        status,
        my_rating: myRating ?? null,
        title: `도서 ${isbn13}`,
        author: "알 수 없음",
        publisher: "알 수 없음",
        cover: null,
        category: null,
        nickname: profile?.nickname ?? "게스트",
      },
      { onConflict: "user_id,isbn13" }
    );
    if (error) throw new Error(error.message);
    return { message: "내 서재가 업데이트되었습니다." };
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    const idx = store.myLibrary.findIndex((item) => item.book.isbn13 === isbn13);
    if (idx >= 0) {
      store.myLibrary[idx] = {
        ...store.myLibrary[idx],
        status,
        myRating: myRating ?? store.myLibrary[idx].myRating,
        updatedAt: new Date().toISOString(),
      };
    } else {
      const nextId =
        store.myLibrary.reduce((max, item) => Math.max(max, item.libraryId), 6000) +
        1;
      store.myLibrary.unshift({
        libraryId: nextId,
        status,
        myRating: myRating ?? null,
        updatedAt: new Date().toISOString(),
        book: {
          isbn13,
          title: `도서 ${isbn13}`,
          author: "알 수 없음",
          publisher: "알 수 없음",
          cover: null,
          category: null,
        },
        user: { nickname: "게스트" },
      });
    }
    writeFrontOnlyStore(store);
    return { message: "내 서재가 업데이트되었습니다." };
  }

  try {
    const requestBody: UpsertMyLibraryRequest = { isbn13, status };
    if (myRating !== undefined) {
      requestBody.myRating = myRating;
    }
    const response = await apiClient.post(`/mypage/my-library`, requestBody);
    return response.data;
  } catch (error) {
    console.error("Failed to upsert book to my library:", error);
    throw error;
  }
};

export const addRatingToMyLibrary = async (
  isbn13: string,
  myRating: number
) => {
  if (useSupabaseMode && supabase) {
    return upsertBookToMyLibrary(isbn13, "COMPLETED", myRating);
  }

  if (isFrontendOnlyMode) {
    return upsertBookToMyLibrary(isbn13, "COMPLETED", myRating);
  }

  try {
    const requestBody = { isbn13, myRating };
    const response = await apiClient.post(`/mypage/my-library`, requestBody);
    return response.data;
  } catch (error) {
    console.error("Failed to add rating to my library:", error);
    throw error;
  }
};

export const deleteBookFromMyLibrary = async (isbn13: string) => {
  if (useSupabaseMode && supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error("로그인이 필요합니다.");
    const { error } = await supabase
      .from("my_library")
      .delete()
      .eq("user_id", authData.user.id)
      .eq("isbn13", isbn13);
    if (error) throw new Error(error.message);
    return { message: "내 서재에서 삭제되었습니다." };
  }

  if (isFrontendOnlyMode) {
    const store = readFrontOnlyStore();
    store.myLibrary = store.myLibrary.filter((item) => item.book.isbn13 !== isbn13);
    writeFrontOnlyStore(store);
    return { message: "내 서재에서 삭제되었습니다." };
  }

  try {
    const response = await apiClient.delete(`/mypage/my-library/${isbn13}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete book from my library:", error);
    throw error;
  }
};

export const fetchCommunityHistory = async (
  userId: string
): Promise<CommunityHistoryEntry[]> => {
  if (useSupabaseMode && supabase) {
    const numericUserId = Number(userId);
    const { data: communities, error } = await supabase
      .from("communities")
      .select("*")
      .eq("host_numeric_id", numericUserId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (communities ?? []).map((row: any) => ({
      communityName: row.title,
      role: "host",
      startDate: row.created_at,
      endDate: row.status === "CLOSED" ? row.updated_at : undefined,
      status: row.status,
    }));
  }

  if (isFrontendOnlyMode) {
    return readFrontOnlyStore().communityHistory;
  }

  try {
    const response = await apiClient.get<{
      status: string;
      message: string;
      data: CommunityHistoryEntry[];
    }>(`/mypage/users/${userId}/community-history`);
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch community history:", error);
    throw error;
  }
};
