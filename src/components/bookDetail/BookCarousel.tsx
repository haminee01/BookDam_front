// src/components/bookDetail/BookCarousel.tsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { getBookDetail } from "../../api/books";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import type { BookSummary } from "../../types";

interface BookCarouselProps {
  title: string;
  books: BookSummary[];
}

const BookCarousel: React.FC<BookCarouselProps> = ({ title, books }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - itemsPerPage));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(books.length - itemsPerPage, prevIndex + itemsPerPage)
    );
  };

  const visibleBooks = books.slice(currentIndex, currentIndex + itemsPerPage);

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + itemsPerPage < books.length;

  const prefetchBookDetail = (itemId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["bookDetail", itemId, isLoggedIn],
      queryFn: () => getBookDetail(itemId),
      staleTime: 1000 * 60 * 5,
    });
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl text-gray-800 text-center mb-4">
        {title}
      </h2>
      <div className="flex items-center justify-center space-x-4 mt-10">
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`p-3 rounded-full bg-gray-200 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center ${
            !canGoPrev ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FaChevronLeft className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex overflow-x-auto snap-x snap-mandatory space-x-4 md:grid md:grid-cols-3 md:gap-x-8">
          {visibleBooks.map((book, index) => (
            <Link
              key={book.isbn13 || index}
              to={`/books/${book.isbn13}`}
              className="w-60 h-80 flex-shrink-0 flex flex-col items-center"
              onMouseEnter={() => prefetchBookDetail(book.isbn13)}
            >
              <img
                src={
                  book.cover ||
                  "https://via.placeholder.com/160x256/E0E0E0/909090?text=No+Cover"
                }
                alt={book.title}
                className="w-4/5 h-64 object-cover rounded-md mb-4 flex-grow"
              />
              <p className="text-sm font-medium text-gray-800 text-center px-2 w-full truncate">
                {book.title}
              </p>
            </Link>
          ))}
          {visibleBooks.length < itemsPerPage &&
            Array(itemsPerPage - visibleBooks.length)
              .fill(0)
              .map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  className="w-60 h-80 flex-shrink-0"
                />
              ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center ${
            !canGoNext ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FaChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default BookCarousel;
