// src/pages/mypage/MyActivitiesPage.tsx

import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MyPostsDisplay from "../../components/mypage/MyPostsDisplay";
import MyCommentsDisplay from "../../components/mypage/MyCommentsDisplay";

const MyActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const initialTab = queryParams.get("tab") || "posts";

  const [activeTab, setActiveTab] = useState<"posts" | "comments">(
    initialTab as "posts" | "comments"
  );

  useEffect(() => {
    const tabFromUrl = queryParams.get("tab");
    if (
      tabFromUrl &&
      (tabFromUrl === "posts" || tabFromUrl === "comments") &&
      tabFromUrl !== activeTab
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [queryParams, activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as "posts" | "comments");

    navigate(`${location.pathname}?tab=${tabId}`, { replace: true });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">내 활동</h1>
      <p className="text-gray-600 mb-8">
        내가 작성한 글과 댓글 목록을 확인하세요.
      </p>

      <nav className="mb-8 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "posts"
                  ? "text-main border-main"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => handleTabChange("posts")}
            >
              내가 작성한 글
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "comments"
                  ? "text-main border-main"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => handleTabChange("comments")}
            >
              내가 작성한 댓글
            </button>
          </li>
        </ul>
      </nav>

      <div className="mt-8">
        {activeTab === "posts" && <MyPostsDisplay />}
        {activeTab === "comments" && <MyCommentsDisplay />}
      </div>
    </div>
  );
};

export default MyActivitiesPage;
