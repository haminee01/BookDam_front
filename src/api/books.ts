// src/api/books.ts

import apiClient from "./apiClient";
import { isMockMode, isSupabaseConfigured } from "../lib/supabase";

import type {
  BookSummary,
  BookDetail,
  AladinApiResponse,
  AladinBookItem,
  BookEntity,
} from "../types";

interface BookSearchResponse {
  books: BookSummary[];
  total: number;
}

const isFrontendOnlyMode = isMockMode || isSupabaseConfigured;
const aladinProxyBaseUrl = import.meta.env.VITE_ALADIN_PROXY_PATH || "/api/aladin";

const fallbackBooks: BookSummary[] = [
  {
    isbn13: "9788936434120",
    title: "데미안",
    author: "헤르만 헤세",
    publisher: "민음사",
    pubDate: "2013-01-01",
    cover: "https://via.placeholder.com/300x430?text=BookDam",
    category: "소설",
    description: "자아를 찾아가는 성장 소설",
  },
  {
    isbn13: "9788937460005",
    title: "어린 왕자",
    author: "생텍쥐페리",
    publisher: "열린책들",
    pubDate: "2015-04-10",
    cover: "https://via.placeholder.com/300x430?text=BookDam",
    category: "소설",
    description: "세대를 초월해 사랑받는 고전",
  },
  {
    isbn13: "9788936439743",
    title: "사피엔스",
    author: "유발 하라리",
    publisher: "김영사",
    pubDate: "2015-11-23",
    cover: "https://via.placeholder.com/300x430?text=BookDam",
    category: "인문",
    description: "인류의 역사를 통합적으로 다룬 책",
  },
];

const mapAladinItemToBookDetail = (aladinItem: AladinBookItem): BookDetail => {
  return {
    isbn13: aladinItem.isbn13,
    cover: aladinItem.cover,
    title: aladinItem.title,
    author: aladinItem.author,
    publisher: aladinItem.publisher,
    pubDate: aladinItem.pubDate || null,
    description: aladinItem.description || null,
    category: aladinItem.categoryName || null,
    toc: aladinItem.subInfo?.toc ? aladinItem.subInfo.toc.split("\n") : null,
    fullDescription:
      aladinItem.subInfo?.fullDescription ||
      aladinItem.subInfo?.fullDescription2 ||
      null,
    pageCount: aladinItem.subInfo?.itemPage || null,
    bestRank: aladinItem.bestRank || null,
    seriesInfo: aladinItem.seriesInfo || null,
    isWished: false,
  };
};

const mapBackendBookToBookDetail = (backendBook: BookEntity): BookDetail => {
  return {
    isbn13: backendBook.isbn13,
    cover: backendBook.cover,
    title: backendBook.title,
    author: backendBook.author,
    publisher: backendBook.publisher,
    pubDate: backendBook.pubDate || null,
    description: backendBook.description || null,
    category: backendBook.category || null,
    toc: backendBook.toc ? backendBook.toc.split("\n") : null,
    fullDescription: backendBook.story || null,
    pageCount: backendBook.pageCount || null,
    bestRank: backendBook.bestRank || null,
    seriesInfo: backendBook.seriesInfo || null,
    isWished: false,
  };
};

const mapSummaryToDetail = (book: BookSummary): BookDetail => ({
  ...book,
  toc: null,
  fullDescription: book.description,
  pageCount: null,
  bestRank: null,
  seriesInfo: null,
  isWished: false,
});

const getFallbackBooks = (size = 10): BookSummary[] => {
  const repeated: BookSummary[] = [];
  while (repeated.length < size) {
    repeated.push(...fallbackBooks);
  }
  return repeated.slice(0, size);
};

const fetchAladinPublicApi = async (
  endpoint: string,
  params: Record<string, string>
): Promise<AladinApiResponse<AladinBookItem> | null> => {
  try {
    const query = new URLSearchParams({
      endpoint,
      ...params,
    });

    const response = await fetch(`${aladinProxyBaseUrl}?${query.toString()}`);
    if (!response.ok) return null;

    const data = (await response.json()) as AladinApiResponse<AladinBookItem>;
    if (!data?.item) return null;
    return data;
  } catch {
    return null;
  }
};

export const searchBooks = async (
  query: string,
  page: number,
  size: number,
  category: string | null = null
): Promise<BookSearchResponse> => {
  if (isFrontendOnlyMode) {
    const aladin = await fetchAladinPublicApi("ItemSearch.aspx", {
      Query: query,
      QueryType: "Keyword",
      SearchTarget: "Book",
      start: String(page),
      MaxResults: String(size),
      Cover: "Big",
    });

    if (aladin) {
      return {
        books: aladin.item.map((item) => mapAladinItemToBookDetail(item)),
        total: aladin.totalResults ?? aladin.item.length,
      };
    }

    const filtered = getFallbackBooks(30).filter((book) =>
      book.title.toLowerCase().includes(query.toLowerCase())
    );
    return { books: filtered.slice(0, size), total: filtered.length };
  }

  let url = `/books/search?keyword=${encodeURIComponent(query)}`;
  url += `&page=${page}`;
  url += `&size=${size}`;
  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }

  const response = await apiClient.get<{
    status: string;
    message: string;
    data: AladinApiResponse<AladinBookItem>;
  }>(url);

  const aladinResponse = response.data.data;

  return {
    books: aladinResponse.item.map((item) => mapAladinItemToBookDetail(item)),
    total: aladinResponse.totalResults,
  };
};

export const getBookDetail = async (itemId: string): Promise<BookDetail> => {
  if (isFrontendOnlyMode) {
    const aladin = await fetchAladinPublicApi("ItemLookUp.aspx", {
      ItemIdType: "ISBN13",
      ItemId: itemId,
      OptResult: "ebookList,usedList,reviewList",
      Cover: "Big",
    });
    if (aladin?.item?.[0]) {
      return mapAladinItemToBookDetail(aladin.item[0]);
    }

    const fallback = getFallbackBooks(20).find((book) => book.isbn13 === itemId);
    if (fallback) return mapSummaryToDetail(fallback);
    throw new Error("도서 상세 정보를 찾을 수 없습니다.");
  }

  try {
    const response = await apiClient.get<{
      status: string;
      message: string;
      data: BookEntity;
    }>(`/books/${itemId}`);

    const actualBackendResponseData = response.data.data;

    if (actualBackendResponseData) {
      return mapBackendBookToBookDetail(actualBackendResponseData);
    } else {
      throw new Error("도서 상세 정보를 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("Failed to fetch book detail:", error);
    throw error;
  }
};

export const fetchBestsellers = async (
  page: number = 1,
  size: number = 10,
  categoryId?: number
): Promise<BookSummary[]> => {
  if (isFrontendOnlyMode) {
    const aladin = await fetchAladinPublicApi("ItemList.aspx", {
      QueryType: "Bestseller",
      SearchTarget: "Book",
      start: String(page),
      MaxResults: String(size),
      Cover: "Big",
      ...(categoryId ? { CategoryId: String(categoryId) } : {}),
    });
    if (aladin) {
      return aladin.item.map((item) => mapAladinItemToBookDetail(item));
    }
    return getFallbackBooks(size);
  }

  try {
    const response = await apiClient.get<{
      status: string;
      message: string;
      data: AladinApiResponse<AladinBookItem>;
    }>(
      `/books/bestsellers?page=${page}&size=${size}${categoryId ? `&categoryId=${categoryId}` : ""
      }`
    );
    return response.data?.data?.item?.map((item) => mapAladinItemToBookDetail(item)) || [];
  } catch (error) {
    console.error("Failed to fetch bestsellers:", error);
    throw error;
  }
};

export const fetchNewBooks = async (
  page: number = 1,
  size: number = 10,
  categoryId?: number
): Promise<BookSummary[]> => {
  if (isFrontendOnlyMode) {
    const aladin = await fetchAladinPublicApi("ItemList.aspx", {
      QueryType: "ItemNewAll",
      SearchTarget: "Book",
      start: String(page),
      MaxResults: String(size),
      Cover: "Big",
      ...(categoryId ? { CategoryId: String(categoryId) } : {}),
    });
    if (aladin) {
      return aladin.item.map((item) => mapAladinItemToBookDetail(item));
    }
    return getFallbackBooks(size);
  }

  try {
    const response = await apiClient.get<{
      status: string;
      message: string;
      data: AladinApiResponse<AladinBookItem>;
    }>(
      `/books/newBooks?page=${page}&size=${size}${categoryId ? `&categoryId=${categoryId}` : ""
      }`
    );
    return response.data?.data?.item?.map((item) => mapAladinItemToBookDetail(item)) || [];
  } catch (error) {
    console.error("Failed to fetch new books:", error);
    throw error;
  }
};

export const fetchSpecialNewBooks = async (
  page: number = 1,
  size: number = 10,
  categoryId?: number
): Promise<BookSummary[]> => {
  if (isFrontendOnlyMode) {
    const aladin = await fetchAladinPublicApi("ItemList.aspx", {
      QueryType: "ItemNewSpecial",
      SearchTarget: "Book",
      start: String(page),
      MaxResults: String(size),
      Cover: "Big",
      ...(categoryId ? { CategoryId: String(categoryId) } : {}),
    });
    if (aladin) {
      return aladin.item.map((item) => mapAladinItemToBookDetail(item));
    }
    return getFallbackBooks(size);
  }

  try {
    const response = await apiClient.get<{
      status: string;
      message: string;
      data: AladinApiResponse<AladinBookItem>;
    }>(
      `/books/specialNewBooks?page=${page}&size=${size}${categoryId ? `&categoryId=${categoryId}` : ""
      }`
    );
    return response.data?.data?.item?.map((item) => mapAladinItemToBookDetail(item)) || [];
  } catch (error) {
    console.error("Failed to fetch special new books:", error);
    throw error;
  }
};