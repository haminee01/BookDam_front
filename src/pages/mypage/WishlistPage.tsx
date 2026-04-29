// src/pages/mypage/WishlistPage.tsx

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import BookGridDisplay from "../../components/bookResults/BookGridDisplay";
import Pagination from "../../components/common/Pagination";
import { fetchWishlist, removeWish } from "../../api/mypage";

import type { BookSummary } from "../../types";

const WishlistPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const queryClient = useQueryClient();
  const { isLoggedIn, currentUserProfile } = useAuth();
  const { showToast } = useToast();

  const {
    data: wishlistData,
    isLoading,
    isError,
    error,
  } = useQuery<BookSummary[], Error>({
    queryKey: ["wishlist"],
    queryFn: async () => {
      if (!isLoggedIn) {
        return [];
      }
      const data = await fetchWishlist();
      return data.map((item) => ({
        isbn13: item.book.isbn13,
        cover: item.book.cover,
        title: item.book.title,
        author: "",
        publisher: "",
        pubDate: null,
        description: null,
        category: null,
      }));
    },
    enabled: isLoggedIn,
    staleTime: 1000 * 60,
  });

  const totalFilteredItems = wishlistData?.length || 0;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return (wishlistData || []).slice(startIndex, endIndex);
  }, [wishlistData, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const removeWishMutation = useMutation<
    void,
    Error,
    { isbn13: string; bookTitle: string }
  >({
    mutationFn: ({ isbn13 }) => removeWish(isbn13),
    onSuccess: (_, { bookTitle }) => {
      showToast(
        `'${bookTitle}'이(가) 위시리스트에서 삭제되었습니다.`,
        "success"
      );

      queryClient.invalidateQueries({ queryKey: ["wishlist"] });

      queryClient.invalidateQueries({
        queryKey: ["bookDetail"],
      });
    },
    onError: (error) => {
      console.error("위시리스트 삭제 실패:", error);
      showToast(
        "위시리스트 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
        "error"
      );
    },
  });

  const handleRemoveFromWishlist = useCallback(
    (isbn13: string, bookTitle: string) => {
      removeWishMutation.mutate({ isbn13, bookTitle });
    },
    [removeWishMutation]
  );

  if (isLoading) {
    return <div className="text-center py-12">위시리스트를 불러오는 중...</div>;
  }
  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        오류: {error?.message}
      </div>
    );
  }
  if (!currentUserProfile) {
    return (
      <div className="text-center py-12 text-red-500">로그인이 필요합니다.</div>
    );
  }

  return (
    <div className="p-6">
      <MyPageHeader
        title="나의 위시리스트"
        description="관심 있는 책들을 한곳에 모아두고 언제든 다시 확인해보세요."
      />

      <div className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {paginatedBooks.length > 0 ? (
          <BookGridDisplay
            books={paginatedBooks}
            className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"
            onRemoveFromWishlist={handleRemoveFromWishlist}
            showWishlistButton={true}
          />
        ) : (
          <p className="col-span-full text-center text-gray-500 py-10">
            위시리스트에 담긴 책이 없습니다.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default WishlistPage;
