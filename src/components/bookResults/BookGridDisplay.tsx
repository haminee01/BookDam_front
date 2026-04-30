// src/components/bookResults/BookGridDisplay.tsx

import { Link } from "react-router-dom";
import HeartButton from "../common/HeartButton";
import { FaTrash } from "react-icons/fa";

import { type BookSummary, type MyLibraryBook } from "../../types";

interface BookGridDisplayProps {
  books: (BookSummary | MyLibraryBook)[];
  className?: string;
  onRemoveFromWishlist?: (isbn13: string, bookTitle: string) => void;
  showWishlistButton?: boolean;
  showDeleteButton?: boolean;
  onDeleteFromMyLibrary?: (isbn13: string, bookTitle: string) => void;
}

function isMyLibraryBook(
  book: BookSummary | MyLibraryBook
): book is MyLibraryBook {
  return (book as MyLibraryBook).libraryId !== undefined;
}

const BookGridDisplay: React.FC<BookGridDisplayProps> = ({
  books,
  className = "",
  onRemoveFromWishlist,
  showWishlistButton = false,
  onDeleteFromMyLibrary,
  showDeleteButton = false,
}) => {
  const handleHeartButtonClick = (
    book: BookSummary | MyLibraryBook,
    isWishlisted: boolean
  ) => {
    const currentIsbn13 = isMyLibraryBook(book)
      ? book.book.isbn13
      : book.isbn13;
    const currentTitle = isMyLibraryBook(book) ? book.book.title : book.title;

    if (!isWishlisted && onRemoveFromWishlist) {
      onRemoveFromWishlist(currentIsbn13, currentTitle);
    }
  };

  const handleDeleteButtonClick = (
    book: MyLibraryBook,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (onDeleteFromMyLibrary) {
      onDeleteFromMyLibrary(book.book.isbn13, book.book.title);
    }
  };

  return (
    <div className={`grid justify-items-center gap-x-6 gap-y-10 ${className}`}>
      {books.map((book, index) => {
        if (!book) {
          return null;
        }

        let displayIsbn13: string | undefined;
        let displayCover: string | null | undefined;
        let displayTitle: string | undefined;

        if (isMyLibraryBook(book)) {
          if (!book.book) {
            return null;
          }
          displayIsbn13 = book.book.isbn13;
          displayCover = book.book.cover;
          displayTitle = book.book.title;
        } else {
          displayIsbn13 = book.isbn13;
          displayCover = book.cover;
          displayTitle = book.title;
        }

        if (!displayIsbn13 || !displayTitle) {
          return null;
        }

        return (
          <Link
            key={displayIsbn13 || index}
            to={`/books/${displayIsbn13}`}
            className="group relative flex w-44 max-w-full flex-col items-center sm:w-48 md:w-52"
          >
            <div className="w-full overflow-hidden rounded-lg border border-gray-200 p-2 transition-colors group-hover:border-gray-300">
              <img
                src={displayCover || "/x0I5nAsbefrRCgbR6jio5dvWhA.jpg"}
                alt={displayTitle}
                className="aspect-[3/4] w-full rounded-lg object-cover"
              />
            </div>

            {showWishlistButton && (
              <div className="absolute top-2 right-2 z-10">
                <HeartButton
                  initialIsWishlisted={true}
                  onClick={(isWishlisted) =>
                    handleHeartButtonClick(book, isWishlisted)
                  }
                  className="p-2 rounded-full shadow-md"
                />
              </div>
            )}

            {showDeleteButton && isMyLibraryBook(book) && (
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={(event) => handleDeleteButtonClick(book, event)}
                  className="rounded-full bg-red-500/90 p-2 text-white shadow-md transition hover:bg-red-600"
                  aria-label={`Delete ${book.book.title} from My Library`}
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="mt-3 w-full truncate text-center text-sm font-semibold text-gray-800 sm:text-base">
              {displayTitle.length > 15
                ? `${displayTitle.substring(0, 15)}...`
                : displayTitle}
            </p>

            {isMyLibraryBook(book) &&
              book.myRating !== undefined &&
              book.myRating !== null && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="text-yellow-400">★</span> {book.myRating}
                  /5
                </p>
              )}
          </Link>
        );
      })}
      {books.length === 0 && (
        <p className="col-span-full text-center text-gray-500 py-10">
          검색 결과가 없습니다.
        </p>
      )}
    </div>
  );
};

export default BookGridDisplay;
