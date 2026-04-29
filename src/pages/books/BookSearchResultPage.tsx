// src/pages/books/BookSearchResultPage.tsx

import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "../../hooks/useToast";

import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import BookGridDisplay from "../../components/bookResults/BookGridDisplay";
import BookCategoryFilter from "../../components/bookResults/BookCategoryFilter";
import { searchBooks } from "../../api/books";

const categories = [
  "소설",
  "에세이",
  "자기계발",
  "경영",
  "인문학",
  "역사",
  "과학",
  "사회과학",
  "예술",
  "만화",
  "장르소설",
  "고전",
];

const BookSearchResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const queryParams = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);

  const initialSearchQuery = queryParams.get("q") || "";

  const [currentSearchTerm, setCurrentSearchTerm] =
    useState(initialSearchQuery);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 12;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "booksSearch",
      currentSearchTerm,
      activeCategory,
      currentPage,
      itemsPerPage,
    ],

    queryFn: async () => {
      if (!currentSearchTerm) {
        return { books: [], total: 0 };
      }

      return searchBooks(
        currentSearchTerm,
        currentPage,
        itemsPerPage,
        activeCategory
      );
    },

    enabled: !!currentSearchTerm,
  });

  const books = data?.books || [];
  const totalResults = data?.total || 0;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  useEffect(() => {
    if (initialSearchQuery !== currentSearchTerm) {
      setCurrentSearchTerm(initialSearchQuery);
      setCurrentPage(1);
      setActiveCategory(null);
    }
  }, [initialSearchQuery, currentSearchTerm]);

  const handleSearchSubmit = (term: string) => {
    const processedSearchTerm = term.trim();
    if (!processedSearchTerm) {
      showToast("검색어를 입력해주세요.", "warn");
      return;
    }
    setCurrentSearchTerm(processedSearchTerm);
    setCurrentPage(1);
    setActiveCategory(null);
    navigate(`/books/search?q=${encodeURIComponent(processedSearchTerm)}`);
  };

  const handleCategoryClick = (category: string) => {
    const newCategory = activeCategory === category ? null : category;
    setActiveCategory(newCategory);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4 lg:px-20 xl:px-32 mb-6">
        <SearchBar
          placeholder="검색어를 입력해주세요"
          className="max-w-xl mx-auto"
          initialQuery={initialSearchQuery}
          onSearch={handleSearchSubmit}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-20 xl:px-32 mb-8">
        <BookCategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
          className="max-w-3xl mx-auto"
        />
      </div>

      <div className="container mx-auto px-4 lg:px-20 xl:px-32">
        {isLoading && currentSearchTerm && (
          <p className="text-center text-gray-600">
            도서 정보를 불러오는 중...
          </p>
        )}
        {isError && (
          <p className="text-center text-red-600">
            오류: {error?.message || "도서 정보를 불러오는 데 실패했습니다."}
          </p>
        )}
        {!isLoading && !isError && books.length === 0 && currentSearchTerm && (
          <p className="text-center text-gray-600">검색 결과가 없습니다.</p>
        )}
        {!isLoading && !isError && books.length > 0 && (
          <BookGridDisplay
            books={books}
            className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"
          />
        )}
      </div>

      {!isLoading && !isError && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default BookSearchResultPage;
