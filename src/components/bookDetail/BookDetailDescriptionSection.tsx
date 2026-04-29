// src/components/bookDetail/BookDetailDescriptionSection.tsx

import type { BookDetail } from "../../types";

interface BookDetailDescriptionSectionProps {
  book: BookDetail;
}

const BookDetailDescriptionSection: React.FC<
  BookDetailDescriptionSectionProps
> = ({ book }) => {
  return (
    <div>
      <div className="p-6 border-t border-b border-gray-200 text-sm text-gray-700">
        <h3 className="text-xl font-bold mb-4">기본 정보</h3>
        <p>
          {book.pageCount ? `${book.pageCount}쪽` : ""}
          {book.pageCount && " | "}
          ISBN: {book.isbn13}
        </p>
      </div>
    </div>
  );
};

export default BookDetailDescriptionSection;
