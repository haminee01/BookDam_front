// src/layouts/MyPageLayout.tsx

import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const MyPageLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavLinkClass = (path: string) => {
    const isActive =
      location.pathname.startsWith(path) &&
      (location.pathname.length === path.length ||
        location.pathname.charAt(path.length) === "/");

    if (
      location.pathname === "/mypage" &&
      path === "/mypage/communities/participating"
    ) {
      return "block py-2 px-4 text-main font-semibold border-l-4 border-main";
    }

    return isActive
      ? "block py-2 px-4 text-main font-semibold border-l-4 border-main"
      : "block py-2 px-4 text-gray-700 hover:text-main";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="container mx-auto px-4 lg:px-8 xl:px-20">
        <div className="flex flex-col md:flex-row">
          <div className="md:hidden flex justify-end w-full pr-5 pt-3">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-4 h-4" />
              ) : (
                <FaBars className="w-4 h-4" />
              )}
            </button>
          </div>

          <nav
            className={`w-full md:w-1/6 border-r md:border-r-0 border-gray-200 md:block ${
              isMobileMenuOpen ? "block" : "hidden"
            }`}
          >
            <h2 className="text-xl font-bold text-gray-700 mb-4">커뮤니티</h2>
            <ul>
              <li className="mb-2">
                <Link
                  to="/mypage/communities/participating"
                  className={`${getNavLinkClass(
                    "/mypage/communities/participating"
                  )} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  현재 참여 중인
                  <br />
                  커뮤니티
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/mypage/communities/recruiting"
                  className={`${getNavLinkClass(
                    "/mypage/communities/recruiting"
                  )} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  내가 모집 중인
                  <br />
                  커뮤니티
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/mypage/communities/applied"
                  className={`${getNavLinkClass(
                    "/mypage/communities/applied"
                  )} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  내가 신청한
                  <br />
                  커뮤니티
                </Link>
              </li>
            </ul>

            <h2 className="text-xl font-bold text-gray-700 mt-6 mb-4">
              내 활동
            </h2>
            <ul>
              <li className="mb-2">
                <Link
                  to="/mypage/taste-analysis"
                  className={`${getNavLinkClass(
                    "/mypage/taste-analysis"
                  )} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  취향 분석
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/mypage/my-library"
                  className={`${getNavLinkClass("/mypage/my-library")} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  내 서재
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/mypage/wishlist"
                  className={`${getNavLinkClass("/mypage/wishlist")} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  찜 리스트
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/mypage/my-activities"
                  className={`${getNavLinkClass(
                    "/mypage/my-activities"
                  )} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  내 활동 기록
                </Link>
              </li>
            </ul>

            <h2 className="text-xl font-bold text-gray-700 mt-6 mb-4">
              내 정보
            </h2>
            <ul>
              <li className="mb-2">
                <Link
                  to="/mypage/profile-edit"
                  className={`${getNavLinkClass(
                    "/mypage/profile-edit"
                  )} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  회원 정보 수정
                </Link>
                <Link
                  to="/mypage/account-security"
                  className={`${getNavLinkClass(
                    "/mypage/account-security"
                  )} text-sm`}
                  onClick={toggleMobileMenu}
                >
                  계정 관리
                </Link>
                <Link
                  to="/mypage/user-leave"
                  className={`${getNavLinkClass(
                    "/mypage/user-leave"
                  )} text-sm text-gray-300`}
                  onClick={toggleMobileMenu}
                >
                  탈퇴하기
                </Link>
              </li>
            </ul>
          </nav>

          <main className="w-full md:w-5/6">
            {children}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyPageLayout;
