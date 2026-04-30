// src/pages/mypage/TasteAnalysisPage.tsx

import { useEffect, useState } from "react";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import apiClient from "../../api/apiClient";
import { readFrontOnlyStore } from "../../api/frontOnlyStore";
import { isMockMode } from "../../lib/supabase";

import type { LibraryStats } from "../../types";

const TasteAnalysisPage: React.FC = () => {
  const [data, setData] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isMockMode) {
          const library = readFrontOnlyStore().myLibrary;
          const completed = library.filter((item) => item.status === "COMPLETED");
          const rated = library.filter((item) => item.myRating !== null);
          const totalBooks = library.length;
          const average =
            rated.length > 0
              ? rated.reduce((sum, item) => sum + (item.myRating ?? 0), 0) / rated.length
              : 0;

          const categoryMap = new Map<string, { count: number; score: number }>();
          const authorMap = new Map<string, { count: number; score: number }>();
          const publisherMap = new Map<string, { count: number; score: number }>();
          const ratingMap = new Map<number, number>();

          library.forEach((item) => {
            const category = item.book.category ?? "기타";
            const author = item.book.author || "미상";
            const publisher = item.book.publisher || "미상";
            const rating = item.myRating ?? 0;
            const score = item.myRating ?? 0;

            categoryMap.set(category, {
              count: (categoryMap.get(category)?.count ?? 0) + 1,
              score: (categoryMap.get(category)?.score ?? 0) + score,
            });
            authorMap.set(author, {
              count: (authorMap.get(author)?.count ?? 0) + 1,
              score: (authorMap.get(author)?.score ?? 0) + score,
            });
            publisherMap.set(publisher, {
              count: (publisherMap.get(publisher)?.count ?? 0) + 1,
              score: (publisherMap.get(publisher)?.score ?? 0) + score,
            });
            if (rating > 0) {
              ratingMap.set(rating, (ratingMap.get(rating) ?? 0) + 1);
            }
          });

          const allCategoryStats = [...categoryMap.entries()].map(([categoryName, value]) => ({
            categoryName,
            count: value.count,
            averageRating: value.count ? value.score / value.count : 0,
          }));

          const preferredCategories = allCategoryStats
            .slice()
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map((item) => ({
              ...item,
              percentage: totalBooks ? Math.round((item.count / totalBooks) * 100) : 0,
            }));

          const preferredAuthors = [...authorMap.entries()]
            .map(([author, value]) => ({
              author,
              count: value.count,
              averageRating: value.count ? value.score / value.count : 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

          const preferredPublishers = [...publisherMap.entries()]
            .map(([publisher, value]) => ({
              publisher,
              count: value.count,
              averageRating: value.count ? value.score / value.count : 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

          const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => {
            const count = ratingMap.get(rating) ?? 0;
            const percentage = rated.length ? Math.round((count / rated.length) * 100) : 0;
            return { rating, count, percentage };
          });

          setData({
            totalBooks: completed.length,
            overallAverageRating: average,
            preferredCategories,
            allCategoryStats,
            preferredAuthors,
            preferredPublishers,
            ratingDistribution,
          });
          return;
        }

        const res = await apiClient.get("/mypage/taste-analysis");
        setData(res.data);
      } catch (error) {
        console.error("분석 정보 불러오기 실패", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 space-y-12">
      <section className="container mx-auto">
        <MyPageHeader
          title="독서 취향 분석"
          description="지금까지의 서재 활동을 바탕으로 나만의 독서 취향을 확인할 수 있습니다."
        />
      </section>

      {loading && <p className="text-center mt-10">로딩 중...</p>}

      {!loading && data && data.totalBooks === 0 && (
        <p className="text-center mt-10 text-gray-500 text-lg">
          아직 독서 기록이 없어요 😌 <br />
          지금부터 나만의 서재를 만들어보세요!
        </p>
      )}

      {!loading && data && data.totalBooks > 0 && (
        <div className="space-y-12">
          <section className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              📚 기본 통계
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
              <div className="p-5 bg-blue-50 text-blue-800 rounded-lg shadow-sm">
                <span className="block text-sm text-blue-600 font-semibold mb-1">
                  총 읽은 책
                </span>
                <span className="text-2xl font-bold">{data.totalBooks}권</span>
              </div>
              <div className="p-5 bg-yellow-50 text-yellow-800 rounded-lg shadow-sm">
                <span className="block text-sm text-yellow-600 font-semibold mb-1">
                  평균 평점
                </span>
                <span className="text-2xl font-bold">
                  {data.overallAverageRating.toFixed(1)}점
                </span>
              </div>
            </div>
          </section>

          <section className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              ⭐ 평점 분포
            </h2>
            <div className="flex justify-center items-end h-40 max-w-lg mx-auto py-4">
              {data.ratingDistribution
                .sort((a, b) => a.rating - b.rating)
                .map(
                  (item: {
                    rating: number;
                    count: number;
                    percentage: number;
                  }) => (
                    <div
                      key={item.rating}
                      className="flex flex-col items-center text-sm w-1/5 max-w-[50px] mx-1"
                    >
                      <div
                        className="bg-indigo-400 w-full rounded-t-md relative flex items-center justify-center text-white font-bold"
                        style={{ height: `${item.percentage * 1.2}px` }}
                      >
                        {item.count > 0 ? `${item.count}` : ""}
                      </div>
                      <span className="mt-2 text-gray-700 font-medium">
                        {item.rating}점
                      </span>
                      <span className="text-gray-500 text-xs">
                        {item.percentage}%
                      </span>
                    </div>
                  )
                )}
            </div>
          </section>

          <section className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              🏆 선호 카테고리 / 작가 / 출판사
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-green-50 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-green-800">
                  📗 선호 카테고리
                </h3>
                <ul className="space-y-2 text-sm">
                  {data.preferredCategories.map(
                    (
                      item: {
                        categoryName: string;
                        count: number;
                        averageRating: number;
                        percentage: number;
                      },
                      idx: number
                    ) => (
                      <li
                        key={idx}
                        className="p-3 bg-white rounded-md shadow-xs flex justify-between items-center text-gray-700"
                      >
                        <span>
                          {item.categoryName} ({item.count}권)
                        </span>
                        <span className="font-bold text-green-600">
                          {item.averageRating.toFixed(1)}점 ({item.percentage}%)
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="p-5 bg-orange-50 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-orange-800">
                  ✍️ 선호 작가
                </h3>
                <ul className="space-y-2 text-sm">
                  {data.preferredAuthors.map(
                    (
                      item: {
                        author: string;
                        count: number;
                        averageRating: number;
                      },
                      idx: number
                    ) => (
                      <li
                        key={idx}
                        className="p-3 bg-white rounded-md shadow-xs flex justify-between items-center text-gray-700"
                      >
                        <span>
                          {item.author} ({item.count}권)
                        </span>
                        <span className="font-bold text-orange-600">
                          {item.averageRating.toFixed(1)}점
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="p-5 bg-purple-50 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">
                  🏢 선호 출판사
                </h3>
                <ul className="space-y-2 text-sm">
                  {data.preferredPublishers.map(
                    (
                      item: {
                        publisher: string;
                        count: number;
                        averageRating: number;
                      },
                      idx: number
                    ) => (
                      <li
                        key={idx}
                        className="p-3 bg-white rounded-md shadow-xs flex justify-between items-center text-gray-700"
                      >
                        <span>
                          {item.publisher} ({item.count}권)
                        </span>
                        <span className="font-bold text-purple-600">
                          {item.averageRating.toFixed(1)}점
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </section>

          <section className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              📘 전체 카테고리 통계
            </h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      권수
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      평균 평점
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.allCategoryStats
                    .sort(
                      (a: { count: number }, b: { count: number }) =>
                        b.count - a.count
                    )
                    .map(
                      (
                        item: {
                          categoryName: string;
                          count: number;
                          averageRating: number;
                        },
                        idx: number
                      ) => (
                        <tr key={idx} className="text-center">
                          <td className="p-3 whitespace-nowrap text-gray-700 font-medium">
                            {item.categoryName}
                          </td>
                          <td className="p-3 whitespace-nowrap text-gray-700">
                            {item.count}
                          </td>
                          <td className="p-3 whitespace-nowrap text-gray-700">
                            {item.averageRating.toFixed(1)}
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default TasteAnalysisPage;
