// =========================================================
// 1. 핵심 엔티티 타입 (Core Entities)
// =========================================================

export interface Community {
  id: string;
  title: string;
  description: string;
  hostName: string;
  hostId: number;
  currentMembers: number;
  maxMembers: number;
  role: "host" | "member";
  status: "모집중" | "모집종료" | "활동중";
  createdAt: string;
  hasApplied?: boolean;
}

export interface UserProfile {
  userId: number;
  email: string;
  name: string;
  nickname: string;
  phone: string;
  profileImage: string | null;
  introduction: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookEntity {
  isbn13: string;
  title: string;
  author: string;
  publisher: string;
  pubDate: string | null;
  description: string | null;
  cover: string | null;
  category: string | null;
  pageCount: number | null;
  toc: string | null;
  story: string | null;
  createdAt: string;
  bestRank: number | null;
  seriesInfo: {
    seriesId: number;
    seriesName: string;
  } | null;
}

// 1.3 TeamPostType Enum (팀 게시물 타입)
enum TeamPostType {
  DISCUSSION = "DISCUSSION",
  NOTICE = "NOTICE",
}

export interface TeamPost {
  teamPostId: number;
  teamId: number;
  userId: number;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  user: {
    nickname: string;
    profileImage?: string | null;
  };
  _count?: {
    comments: number;
  };

  teamPost?: {
    teamPostId: number;
    title: string;
    teamId: number;
  } | null;
}

export interface TeamCommunity {
  teamId: number;
  postId: number;
  isbn13: string;
  status: string;
  postTitle: string;
  postContent: string;
  postAuthor: string;
  createdAt: string;
  updatedAt: string;
  maxMembers?: number;
}

export interface TeamApplication {
  applicationId: number;
  userId: number;
  postId: number;
  applicationMessage: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  appliedAt: string;
  processedAt: string | null;
}

export interface CommunityWithMemberInfo extends TeamCommunity {
  currentMembers: number;
  maxMembers: number;
}

export interface AppliedCommunityPostInfo {
  postId: number;
  title: string;
  userId: number;
  maxMembers: number;
  team: {
    teamId: number;
    status: string;
    postTitle: string;
    postContent: string;
    postAuthor: string;
    currentMembers?: number;
    maxMembers?: number;
  } | null;
}

export interface TeamCommunityWithBookTitle extends TeamCommunity {
  bookTitle: string | null;
}

// 1.6 PostType Enum (일반 게시물 타입)
enum PostType {
  GENERAL = "GENERAL",
  RECRUITMENT = "RECRUITMENT",
}

export interface Post {
  postId: number;
  userId: number;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  user: {
    nickname: string;
    profileImage: string | null;
  };
  _count?: {
    comments: number;
  };
  book?: {
    title: string;
    author: string;
    cover: string | null;
    isbn13: string;
    toc?: string | null;
    story?: string | null;
  } | null;
  recruitmentStatus?: string;
  maxMembers?: number;
}

export interface Comment {
  commentId: number;
  postId?: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: number | null;
  user: {
    nickname: string;
    profileImage: string | null;
  };
  replies?: (Comment | TeamComment)[];
  depth?: number;
  postTitle?: string;
  postType?: string;
}

export interface TeamComment {
  teamCommentId: number;
  teamPostId?: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: number | null;
  user: {
    nickname: string;
    profileImage?: string | null;
  };
  replies?: (Comment | TeamComment)[];
  depth?: number;
  postTitle?: string;
  postType?: string;
  communityId?: number;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// =========================================================
// 2. 알라딘 API 관련 Enum
// =========================================================

enum AladinQueryType {
  KEYWORD = "Keyword",
  TITLE = "Title",
  AUTHOR = "Author",
  PUBLISHER = "Publisher",
}

enum AladinSearchTarget {
  BOOK = "Book",
  FOREIGN = "Foreign",
  EBOOK = "eBook",
  ALL = "All",
}

enum AladinSortType {
  ACCURACY = "Accuracy",
  PUBLISH_TIME = "PublishTime",
  TITLE = "Title",
  SALES_POINT = "SalesPoint",
  CUSTOMER_RATING = "CustomerRating",
  MY_REVIEW_COUNT = "MyReviewCount",
}

enum AladinListType {
  NEW_ALL = "ItemNewAll",
  NEW_SPECIAL = "ItemNewSpecial",
  EDITOR_CHOICE = "ItemEditorChoice",
  BESTSELLER = "Bestseller",
  BLOG_BEST = "BlogBest",
}

enum AladinCoverSize {
  BIG = "Big",
  MID_BIG = "MidBig",
  MID = "Mid",
  SMALL = "Small",
  MINI = "Mini",
  NONE = "None",
}

enum AladinOutputType {
  XML = "XML",
  JS = "JS",
}

enum AladinItemIdType {
  ISBN = "ISBN",
  ISBN13 = "ISBN13",
  ITEM_ID = "ItemId",
}

// =========================================================
// 3. 알라딘 API 응답 관련 타입들
// =========================================================

export interface AladinApiResponse<T = AladinBookItem> {
  version: string;
  title: string;
  link: string;
  pubDate: string;
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  query?: string;
  searchCategoryId?: number;
  searchCategoryName?: string;
  item: T[];
}

export interface AladinBookItem {
  title: string;
  link: string;
  author: string;
  pubDate: string;
  description: string;
  isbn: string;
  isbn13: string;
  itemId: number;
  cover: string;
  publisher: string;
  adult: boolean;
  bestDuration?: string;
  bestRank?: number;
  categoryName: string;

  seriesInfo?: {
    seriesId: number;
    seriesLink: string;
    seriesName: string;
  };

  subInfo?: {
    subTitle?: string;
    originalTitle?: string;
    itemPage?: number;
    fullDescription?: string;
    fullDescription2?: string;
    toc?: string;
    story?: string;
  };
}

// =========================================================
// 4. 클라이언트 응답 및 요청용 확장 타입들
// =========================================================

export interface BookSummary {
  isbn13: string;
  title: string;
  author: string;
  publisher: string;
  pubDate: string | null;
  cover: string | null;
  category: string | null;
  description: string | null;
}

export interface BookDetail extends BookSummary {
  pageCount: number | null;
  toc: string[] | null;
  fullDescription: string | null;
  bestRank: number | null;
  seriesInfo: {
    seriesId: number;
    seriesName: string;
  } | null;
  isWished: boolean;
}

export interface MyLibraryBook {
  libraryId: number;
  status: string;
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
}

export interface ApplicantWithStatus {
  id: string;
  applicationId: number;
  userId: number;
  nickname: string;
  appliedAt: string;
  applicationMessage: string;
  status: "pending" | "accepted" | "rejected";
}

export interface CommunityHistoryEntry {
  communityName: string;
  role: string;
  startDate: string;
  endDate?: string;
  status: string;
}

export interface AppliedCommunity extends Community {
  myApplicationStatus: string;
  applicationId: number;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  nickname: string;
  phone: string;
  agreement: boolean;
  profileImage?: string;
  introduction?: string;
}

export interface UpdateUserData {
  nickname?: string;
  introduction?: string;
  profileImage?: string;
  deleteProfileImage?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AddWishListRequest {
  isbn13: string;
}

export interface WishListResponse {
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
}

export interface CategoryStats {
  categoryName: string;
  count: number;
  averageRating: number;
  percentage: number;
}

export interface AuthorStats {
  author: string;
  count: number;
  averageRating: number;
}

export interface PublisherStats {
  publisher: string;
  count: number;
  averageRating: number;
}

export interface FullCategoryStats {
  categoryName: string;
  count: number;
  averageRating: number;
}

export interface LibraryStats {
  totalBooks: number;
  overallAverageRating: number;
  preferredCategories: CategoryStats[];
  allCategoryStats: FullCategoryStats[];
  preferredAuthors: AuthorStats[];
  preferredPublishers: PublisherStats[];
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
}

export interface UpsertMyLibraryRequest {
  isbn13: string;
  status: string;
  myRating?: number | null;
}

// =========================================================
// 사용자 정의 에러 타입
// =========================================================

export class AuthRequiredError extends Error {
  constructor(message: string = "로그인 후 이용 가능합니다.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export {
  TeamPostType,
  PostType,
  AladinQueryType,
  AladinSearchTarget,
  AladinSortType,
  AladinListType,
  AladinCoverSize,
  AladinOutputType,
  AladinItemIdType,
};
