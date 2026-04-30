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
      <div className="app-shell relative z-10">
        <div className="mx-auto max-w-4xl p-6 text-center text-white sm:p-10">
        <h1 className="mb-6 text-3xl md:text-5xl">
          독서와 사람을 연결하는 플랫폼
          <br />
          지금 시작하세요
        </h1>
        <p className="mb-8 text-base text-gray-50 md:text-lg">
          독서로 연결되고, 닉네임으로 소통하다. 익명으로 더 깊은 대화를
          시작하세요.
        </p>

        <div className="mx-auto flex max-w-xl items-center pt-2">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="어떤 책을 찾아볼까요?"
            className="h-12 flex-grow rounded-l-xl border border-white/70 bg-white p-3 text-gray-800 placeholder-gray-500 outline-none focus:border-main focus:ring-2 focus:ring-main/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchOnEnter}
          />
          <button
            onClick={executeSearch}
            className="h-12 rounded-r-xl bg-main px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-apply md:px-6"
          >
            검색
          </button>
        </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroSection;
