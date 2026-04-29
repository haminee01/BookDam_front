// src/pages/books/BookDetailPage.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

import SearchBar from "../../components/common/SearchBar";
import BookDetailHeroSection from "../../components/bookDetail/BookDetailHeroSection";
import BookDetailDescription from "../../components/bookDetail/BookDetailDescriptionSection";
import BookCarousel from "../../components/bookDetail/BookCarousel";
import CommunityCarousel from "../../components/bookDetail/CommunityCarousel";
import ApplyToCommunityModal from "../../components/modals/ApplyToCommunityModal";
import CreateCommunityModal from "../../components/modals/CreateCommunityModal";

import { getBookDetail, fetchBestsellers } from "../../api/books";
import { createCommunity } from "../../api/communities";
import { getCategoryId } from "../../constants/categories";
import { fetchWishlist } from "../../api/mypage";

import type { BookDetail, BookSummary } from "../../types";

const BookDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();

  const queryClient = useQueryClient();
  const { isLoggedIn, currentUserProfile } = useAuth();

  const { showToast } = useToast();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  );
  const [applyModalError, setApplyModalError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [, setItemIdForCreate] = useState<string | null>(null);

  const {
    data: book,
    isLoading: isLoadingBook,
    isError: isErrorBook,
    error: errorBook,
  } = useQuery<BookDetail, Error>({
    queryKey: ["bookDetail", itemId],
    queryFn: async () => {
      if (!itemId) {
        throw new Error("도서 ID가 제공되지 않았습니다.");
      }
      return getBookDetail(itemId);
    },
    enabled: !!itemId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
    enabled: isLoggedIn,
    staleTime: 1000 * 60,
  });

  const isBookWishlisted =
    wishlistData?.some((item) => item.book && item.book.isbn13 === itemId) ||
    false;

  const {
    data: bestsellers,
    isLoading: isLoadingBestsellers,
    isError: isErrorBestsellers,
    error: errorBestsellers,
  } = useQuery<BookSummary[], Error>({
    queryKey: ["bestsellers"],
    queryFn: () => fetchBestsellers(1, 10),
    staleTime: 1000 * 60 * 5,
    enabled: true,
  });

  const categoryIdForRecommendations = book?.category
    ? getCategoryId(book.category)
    : 0;

  const {
    data: genreRecommendations,
    isLoading: isLoadingGenreRecommendations,
    isError: isErrorGenreRecommendations,
    error: errorGenreRecommendations,
  } = useQuery<BookSummary[], Error>({
    queryKey: ["genreRecommendations", categoryIdForRecommendations],
    queryFn: async () => {
      if (categoryIdForRecommendations === 0) {
        return [];
      }
      return fetchBestsellers(1, 10, categoryIdForRecommendations);
    },
    enabled: !!book && categoryIdForRecommendations !== 0,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [itemId]);

  const handleApplyCommunityClick = (communityId: string) => {
    if (!isLoggedIn) {
      showToast("로그인이 필요합니다.", "warn");
      return;
    }
    setApplyModalError(null);
    setSelectedCommunityId(communityId);
    setIsApplyModalOpen(true);
  };

  const handleApplyModalClose = () => {
    setIsApplyModalOpen(false);
    setSelectedCommunityId(null);
    setApplyModalError(null);
  };

  const handleApplyModalError = (message: string) => {
    setApplyModalError(message);
    setIsApplyModalOpen(false);
  };

  const handleApplySuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["allCommunities", currentUserProfile?.userId],
    });
    queryClient.invalidateQueries({
      queryKey: ["bookDetailPageData", itemId, currentUserProfile?.userId],
    });
    queryClient.invalidateQueries({
      queryKey: ["appliedCommunities"],
    });
  };

  const handleCreateCommunityClick = (bookIdentifier: string) => {
    if (!isLoggedIn) {
      showToast("로그인이 필요합니다.", "warn");
      return;
    }
    setItemIdForCreate(bookIdentifier);
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setItemIdForCreate(null);
  };

  const handleCommunityCreate = async (
    bookIdentifier: string,
    communityName: string,
    maxMembers: number,
    description: string
  ) => {
    console.log(`커뮤니티 생성 요청:`);
    console.log(` 책 ID: ${bookIdentifier}`);
    console.log(` 이름: ${communityName}`);
    console.log(` 모집 인원: ${maxMembers}`);
    console.log(` 소개: ${description}`);

    try {
      await createCommunity({
        isbn13: bookIdentifier,
        title: communityName,
        content: description,
        maxMembers: maxMembers,
      });

      handleCreateModalClose();
      queryClient.invalidateQueries({
        queryKey: ["bookDetailPageData", bookIdentifier],
      });
      queryClient.invalidateQueries({
        queryKey: ["allCommunities", currentUserProfile?.userId],
      });
      showToast("커뮤니티가 성공적으로 생성되었습니다!", "success");
    } catch (error) {
      console.error("커뮤니티 생성 중 오류 발생:", error);
      showToast(
        "커뮤니티 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
        "error"
      );
    }
  };

  if (isLoadingBook) {
    return (
      <div className="text-center py-12 text-xl text-gray-700">
        도서 정보 로딩 중...
      </div>
    );
  }

  if (isErrorBook || !book) {
    return (
      <div className="text-center py-12 text-xl text-red-700">
        오류:
        {errorBook?.message || "도서 상세 정보를 불러오는 데 실패했습니다."}
      </div>
    );
  }

  return (
    <div>
      <div className="py-3">
        <SearchBar placeholder="도서 검색" className="max-w-lg mx-auto" />
      </div>

      <div className="container mx-auto px-4 md:px-20">
        <BookDetailHeroSection
          book={{ ...book, isWished: isBookWishlisted }}
          onCreateCommunityClick={handleCreateCommunityClick}
        />

        <BookDetailDescription book={book} />

        {applyModalError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4"
            role="alert"
          >
            <strong className="font-bold">신청 오류:</strong> {applyModalError}
          </div>
        )}

        <h2 className="text-2xl text-gray-800 text-center mt-12">
          모집 중인 커뮤니티
        </h2>
        <div className="p-6">
          <CommunityCarousel
            bookIsbn13={itemId!}
            onApplyClick={handleApplyCommunityClick}
          />
        </div>

        {isLoadingGenreRecommendations ? (
          <p className="text-center text-gray-600">
            장르별 추천 도서 로딩 중...
          </p>
        ) : isErrorGenreRecommendations ? (
          <p className="text-center text-red-600">
            오류:
            {errorGenreRecommendations?.message ||
              "장르별 추천 도서를 불러오는 데 실패했습니다."}
          </p>
        ) : genreRecommendations && genreRecommendations.length > 0 ? (
          <div className="p-6 mt-4">
            <BookCarousel
              title={`"${book.category}" 장르에서 당신이 좋아할 만한 책`}
              books={genreRecommendations}
            />
          </div>
        ) : (
          <div className="p-6text-center text-gray-600">
            이 장르에 대한 추천 도서를 찾을 수 없습니다.
          </div>
        )}

        {isLoadingBestsellers ? (
          <p className="text-center text-gray-600">베스트셀러 로딩 중...</p>
        ) : isErrorBestsellers ? (
          <p className="text-center text-red-600">
            오류:
            {errorBestsellers?.message ||
              "베스트셀러를 불러오는 데 실패했습니다."}
          </p>
        ) : bestsellers && bestsellers.length > 0 ? (
          <div className="p-6 mt-4">
            <BookCarousel
              title="🏆 지금 가장 뜨거운 베스트셀러"
              books={bestsellers}
            />
          </div>
        ) : null}

        <ApplyToCommunityModal
          isOpen={isApplyModalOpen}
          onClose={handleApplyModalClose}
          communityId={selectedCommunityId || ""}
          onError={handleApplyModalError}
          onSuccess={handleApplySuccess}
        />

        {itemId && (
          <CreateCommunityModal
            isOpen={isCreateModalOpen}
            onClose={handleCreateModalClose}
            bookId={itemId}
            onCommunityCreate={handleCommunityCreate}
          />
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;
