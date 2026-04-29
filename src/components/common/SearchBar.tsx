// src/components/common/SearchBar.tsx

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import Button from "../common/Button";

interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
  onSearch?: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = "",
  placeholder = "검색어를 입력해주세요",
  className = "",
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handleGlobalEnterKey = (event: KeyboardEvent) => {
      if (
        event.key === "Enter" &&
        inputRef.current &&
        document.activeElement !== inputRef.current
      ) {
        inputRef.current.focus();
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleGlobalEnterKey);

    return () => {
      document.removeEventListener("keydown", handleGlobalEnterKey);
    };
  }, []);

  const executeSearch = () => {
    const processedSearchTerm = searchTerm.replace(/\s/g, "");

    if (processedSearchTerm.length === 0) {
      showToast("검색어를 입력해주세요.", "warn");
      return;
    }

    if (onSearch) {
      onSearch(processedSearchTerm);
    } else {
      const searchPath = `/books/search?q=${encodeURIComponent(
        processedSearchTerm
      )}`;
      navigate(searchPath);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      executeSearch();
    }
  };

  return (
    <div
      className={`flex items-center w-full max-w-3xl mx-auto h-12 ${className}`}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className="flex-grow p-3 mr-3 focus:outline-none focus:ring-0 focus:border-gray-300 border border-gray-300 rounded-xl pl-5 pr-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <Button
        onClick={executeSearch}
        bgColor="bg-main"
        textColor="text-white"
        hoverBgColor="hover:bg-apply"
        className="flex-shrink-0 h-full px-6 py-2 font-medium rounded-xl focus:outline-none focus:ring-0 focus:border-transparent"
        aria-label="검색"
      >
        검색
      </Button>
    </div>
  );
};

export default SearchBar;
