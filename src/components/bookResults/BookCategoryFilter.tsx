// src/components/bookResults/BookCategoryFilter.tsx

import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface BookCategoryFilterProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryClick: (category: string) => void;
  className?: string;
}

const BookCategoryFilter: React.FC<BookCategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryClick,
  className = "",
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (scrollOffset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += scrollOffset;
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <button
        onClick={() => scroll(-200)}
        className="absolute left-0 z-10 p-2 bg-white rounded-full shadow-md cursor-pointer
                   hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-apply focus:ring-opacity-50
                   hidden md:block"
        aria-label="이전 카테고리"
      >
        <FaChevronLeft className="w-4 h-4 text-gray-600" />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto whitespace-nowrap py-2 scrollbar-hide mx-12"
        style={{ scrollBehavior: "smooth" }}
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryClick(category)}
            className={`flex-shrink-0 px-6 py-2 rounded-xl text-sm transition-colors duration-200 mr-2
              ${
                activeCategory === category
                  ? "bg-apply text-white"
                  : "border border-apply text-apply hover:bg-apply hover:text-white"
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      <button
        onClick={() => scroll(200)}
        className="absolute right-0 z-10 p-2 bg-white rounded-full shadow-md cursor-pointer
                   hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-apply focus:ring-opacity-50
                   hidden md:block"
        aria-label="다음 카테고리"
      >
        <FaChevronRight className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
};

export default BookCategoryFilter;
