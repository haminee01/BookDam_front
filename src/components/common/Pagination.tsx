import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pageNumbers: number[] = [];
  const pagesPerBlock = 5;

  const startBlockPage =
    Math.floor((currentPage - 1) / pagesPerBlock) * pagesPerBlock + 1;
  const endBlockPage = Math.min(totalPages, startBlockPage + pagesPerBlock - 1);

  for (let i = startBlockPage; i <= endBlockPage; i++) {
    pageNumbers.push(i);
  }

  const canGoPrevBlock = startBlockPage > 1;

  const canGoNextBlock = endBlockPage < totalPages;

  const handlePrevBlock = () => {
    onPageChange(startBlockPage - 1);
  };

  const handleNextBlock = () => {
    onPageChange(endBlockPage + 1);
  };

  return (
    <div className="mt-10 mb-6 flex items-center justify-center gap-2 sm:gap-3">
      <button
        onClick={handlePrevBlock}
        disabled={!canGoPrevBlock}
        className={`flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 transition-all duration-200 hover:border-main/50 hover:bg-main/10
          ${!canGoPrevBlock ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label="Previous Block"
      >
        <FaChevronLeft className="h-4 w-4 text-gray-700" />
      </button>
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`min-w-9 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200
            ${
              currentPage === page
                ? "bg-main/15 text-main"
                : "text-gray-700 hover:bg-main/10 hover:text-main"
            }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={handleNextBlock}
        disabled={!canGoNextBlock}
        className={`flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 transition-all duration-200 hover:border-main/50 hover:bg-main/10
          ${!canGoNextBlock ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label="Next Block"
      >
        <FaChevronRight className="h-4 w-4 text-gray-700" />
      </button>
    </div>
  );
};

export default Pagination;
