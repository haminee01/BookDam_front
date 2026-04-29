// src/components/home/HomeHeroSection.tsx

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";

const HomeHeroSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast(); // useToast 훅 사용

  const executeSearch = () => {
    const processedSearchTerm = searchTerm.replace(/\s/g, "");

    if (processedSearchTerm.length === 0) {
      showToast("검색어를 입력해주세요.", "warn");
      return;
    }

    const searchPath = `/books/search?q=${encodeURIComponent(
      processedSearchTerm
    )}`;
    navigate(searchPath);
  };

  const handleSearchOnEnter = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      executeSearch();
    }
  };

  useEffect(() => {
    const handleGlobalEnterKey = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (
          searchInputRef.current &&
          document.activeElement !== searchInputRef.current
        ) {
          searchInputRef.current.focus();
          event.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleGlobalEnterKey);

    return () => {
      document.removeEventListener("keydown", handleGlobalEnterKey);
    };
  }, []);

  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      {/* 절대 위치로 배경 이미지를 배치하고 블러 효과를 적용 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/background.png')",
          filter: "blur(5px)",
        }}
      />
      <div className="container mx-auto px-4 z-10 relative pl-16">
        <h1 className="text-3xl md:text-5xl text-white mb-6">
          독서와 사람을 연결하는 플랫폼
          <br />
          지금 시작하세요
        </h1>
        <p className="text-base md:text-lg text-gray-50 mb-8">
          독서로 연결되고, 닉네임으로 소통하다. 익명으로 더 깊은 대화를
          시작하세요.
        </p>

        <div className="max-w-xl mx-auto flex items-center pt-6">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="어떤 책을 찾아볼까요?"
            className="flex-grow h-12 p-3 rounded-l-xl border border-gray-300 bg-white bg-opacity-30 backdrop-filter backdrop-blur-md focus:outline-none focus:ring-0 focus:border-white placeholder-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchOnEnter}
          />
          <button
            onClick={executeSearch}
            className="h-12 px-4 md:px-6 py-2 bg-main bg-opacity-90 text-white font-medium rounded-r-xl rounded-none focus:outline-none focus:ring-0 focus:border-transparent transition-all duration-300 hover:bg-opacity-100"
          >
            검색
          </button>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroSection;
