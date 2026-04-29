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
    <div className="flex justify-center items-center space-x-4 mt-12 mb-8">
      <button
        onClick={handlePrevBlock}
        disabled={!canGoPrevBlock}
        className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center
          ${!canGoPrevBlock ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label="Previous Block"
      >
        <FaChevronLeft className="w-4 h-4 text-gray-700" />
      </button>
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1.5 rounded-md font-medium text-lg transition-colors duration-200
            ${
              currentPage === page
                ? "text-main"
                : "text-gray-700 hover:text-main"
            }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={handleNextBlock}
        disabled={!canGoNextBlock}
        className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center
          ${!canGoNextBlock ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label="Next Block"
      >
        <FaChevronRight className="w-4 h-4 text-gray-700" />
      </button>
    </div>
  );
};

export default Pagination;
