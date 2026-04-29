// src/pages/mypage/MyLibraryPage.tsx

import { useState, useCallback, useMemo } from "react";
import { useToast } from "../../hooks/useToast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import BookGridDisplay from "../../components/bookResults/BookGridDisplay";
import Pagination from "../../components/common/Pagination";
import { fetchMyLibrary, deleteBookFromMyLibrary } from "../../api/mypage";

import type { MyLibraryResponseData } from "../../api/mypage";
import { type MyLibraryBook } from "../../types";

type ReadingStatus = "WANT_TO_READ" | "READING" | "COMPLETED";

const MyLibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReadingStatus>("READING");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { currentUserProfile } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // 🔥 수정: 전체 응답 데이터를 저장하도록 변경
  const {
    data: libraryResponse,
    isLoading,
    isError,
    error,
  } = useQuery<MyLibraryResponseData, Error>({
    queryKey: ["myLibrary", activeTab, currentPage, itemsPerPage],
    queryFn: async () => {
      const response = await fetchMyLibrary(
        currentPage,
        itemsPerPage,
        activeTab
      );
      return response; // 🔥 전체 응답 반환 (pagination 포함)
    },
    enabled: !!currentUserProfile,
    staleTime: 1000 * 60,
  });

  // 🔥 수정: 책 데이터 변환
  const myLibraryData = useMemo(() => {
    if (!libraryResponse?.data) return [];

    return libraryResponse.data.map((item) => ({
      libraryId: item.libraryId,
      status: item.status.toLowerCase() as MyLibraryBook["status"],
      myRating: item.myRating,
      updatedAt: item.updatedAt,
      book: {
        isbn13: item.book.isbn13,
        title: item.book.title,
        author: item.book.author,
        publisher: item.book.publisher,
        cover: item.book.cover,
        category: item.book.category,
      },
      user: {
        nickname: item.user.nickname,
      },
    }));
  }, [libraryResponse]);

  // 🔥 수정: pagination 정보 직접 사용
  const totalPages = libraryResponse?.pagination?.totalPages || 1;

  const handleTabChange = useCallback((tab: ReadingStatus) => {
    setActiveTab(tab);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const deleteBookMutation = useMutation<void, Error, string>({
    mutationFn: (isbn13: string) => deleteBookFromMyLibrary(isbn13),
    onSuccess: (_, variables) => {
      showToast(`'${variables}'이(가) 내 서재에서 삭제되었습니다.`, "success");
      queryClient.invalidateQueries({ queryKey: ["myLibrary"] });
    },
    onError: (error) => {
      console.error("내 서재 도서 삭제 실패:", error);
      showToast(
        "내 서재 도서 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
        "error"
      );
    },
  });

  const handleDeleteBook = useCallback(
    (isbn13: string, bookTitle: string) => {
      if (confirm(`'${bookTitle}'을(를) 내 서재에서 삭제하시겠습니까?`)) {
        deleteBookMutation.mutate(isbn13);
      }
    },
    [deleteBookMutation]
  );

  if (isLoading) {
    return <div className="text-center py-12">내 서재를 불러오는 중...</div>;
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

  const booksToDisplay = myLibraryData || [];

  return (
    <div className="p-6">
      <MyPageHeader
        title="책 기록 보관소"
        description="지금까지 읽은 책, 읽고 있는 책, 읽고 싶은 책을 한자리에 모았어요. 취향이 담긴 당신만의 책 기록 보관소를 자유롭게 관리해보세요."
      />

      <div className="flex justify-end mb-6">
        <button
          onClick={() => handleTabChange("READING")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "READING"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          읽는 중
        </button>
        <button
          onClick={() => handleTabChange("COMPLETED")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "COMPLETED"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          읽은 책
        </button>
        <button
          onClick={() => handleTabChange("WANT_TO_READ")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "WANT_TO_READ"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          읽고 싶은 책
        </button>
      </div>

      <div className="container mx-auto px-0">
        {booksToDisplay.length > 0 ? (
          <BookGridDisplay
            books={booksToDisplay}
            className="grid-cols-2 sm:grid-cols-3 gap-6"
            showDeleteButton={true}
            onDeleteFromMyLibrary={handleDeleteBook}
          />
        ) : (
          <p className="col-span-full text-center text-gray-500 py-10">
            {activeTab === "READING" && "읽는 중인 책이 없습니다."}
            {activeTab === "COMPLETED" && "읽은 책이 없습니다."}
            {activeTab === "WANT_TO_READ" && "읽고 싶은 책이 없습니다."}
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

export default MyLibraryPage;
