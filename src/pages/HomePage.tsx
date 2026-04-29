// src/pages/HomePage.tsx

import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../contexts/AuthContext";
import HomeHeroSection from "../components/home/HomeHeroSection";
import RecruitingCommunityList from "../components/home/RecruitingCommunityList";
import BookCarousel from "../components/bookDetail/BookCarousel";
import {
  fetchBestsellers,
  fetchNewBooks,
  fetchSpecialNewBooks,
} from "../api/books";

const HomePage: React.FC = () => {
  const { isLoggedIn } = useAuthContext();

  const {
    data: bestsellers,
    isLoading: isLoadingBestsellers,
    isError: isErrorBestsellers,
    error: errorBestsellers,
  } = useQuery({
    queryKey: ["bestsellers", isLoggedIn],
    queryFn: () => fetchBestsellers(1, 10),
    staleTime: 1000 * 60 * 5,
    enabled: true, // 항상 활성화하여 로그인 상태 변화 시 자동으로 다시 불러오기
  });

  const {
    data: newBooks,
    isLoading: isLoadingNewBooks,
    isError: isErrorNewBooks,
    error: errorNewBooks,
  } = useQuery({
    queryKey: ["newBooks", isLoggedIn],
    queryFn: () => fetchNewBooks(1, 10),
    staleTime: 1000 * 60 * 5,
    enabled: true, // 항상 활성화하여 로그인 상태 변화 시 자동으로 다시 불러오기
  });

  const {
    data: specialNewBooks,
    isLoading: isLoadingSpecialNewBooks,
    isError: isErrorSpecialNewBooks,
    error: errorSpecialNewBooks,
  } = useQuery({
    queryKey: ["specialNewBooks", isLoggedIn],
    queryFn: () => fetchSpecialNewBooks(1, 10),
    staleTime: 1000 * 60 * 5,
    enabled: true, // 항상 활성화하여 로그인 상태 변화 시 자동으로 다시 불러오기
  });

  return (
    <div className="home-page-content">
      {/* HomeHeroSection은 좌우 여백 없이 꽉 채움 */}
      <div className="w-full">
        <HomeHeroSection />
      </div>
      
      {/* 나머지 섹션들은 기존 여백 유지 */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RecruitingCommunityList />

        {/* 베스트셀러 섹션 */}
        <section className="my-8 md:my-12 lg:my-16">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
              🏆 지금 가장 뜨거운 베스트셀러
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              지금 만나보세요!
            </p>
          </div>
          
          {isLoadingBestsellers ? (
            <div className="text-center py-8 md:py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-main mb-4"></div>
              <p className="text-gray-600">베스트셀러 로딩 중...</p>
            </div>
          ) : isErrorBestsellers ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-red-600 text-sm md:text-base">
                오류: {errorBestsellers?.message || "베스트셀러를 불러오는 데 실패했습니다."}
              </p>
            </div>
          ) : (
            <BookCarousel
              title=""
              books={bestsellers || []}
            />
          )}
        </section>

        {/* 신간 도서 섹션 */}
        <section className="py-6 md:py-8 lg:py-12">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
              💡 지적 호기심을 채울 새로운 도서
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              최신 출간된 도서들을 만나보세요
            </p>
          </div>
          
          {isLoadingNewBooks ? (
            <div className="text-center py-8 md:py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-main mb-4"></div>
              <p className="text-gray-600">신간 도서 로딩 중...</p>
            </div>
          ) : isErrorNewBooks ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-red-600 text-sm md:text-base">
                오류: {errorNewBooks?.message || "신간 도서를 불러오는 데 실패했습니다."}
              </p>
            </div>
          ) : (
            <BookCarousel
              title=""
              books={newBooks || []}
            />
          )}
        </section>

        {/* 주목할 신간 섹션 */}
        <section className="py-6 md:py-8 lg:py-12">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
              👀 에디터 추천! 놓칠 수 없는 신간
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              특별히 주목해야 할 신간 도서들
            </p>
          </div>
          
          {isLoadingSpecialNewBooks ? (
            <div className="text-center py-8 md:py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-main mb-4"></div>
              <p className="text-gray-600">주목할 신간 로딩 중...</p>
            </div>
          ) : isErrorSpecialNewBooks ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-red-600 text-sm md:text-base">
                오류: {errorSpecialNewBooks?.message || "주목할 신간을 불러오는 데 실패했습니다."}
              </p>
            </div>
          ) : (
            <BookCarousel
              title=""
              books={specialNewBooks || []}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
