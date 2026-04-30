// src/components/layout/Header.tsx

import { useState } from "react";
import { useToast } from "../../hooks/useToast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import Button from "../common/Button";
import { FaBars, FaTimes } from "react-icons/fa";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isMyPagePath = location.pathname.startsWith("/mypage");

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const handleMyPageClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      showToast("로그인이 필요한 페이지입니다. 로그인해주세요.", "warn");
      navigate("/auth/login");
    }
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="app-shell flex h-16 items-center justify-between">
        <nav className="hidden flex-1 items-center md:flex">
          <ul className="flex list-none items-center gap-5">
            <li>
              <Link
                to="/faq"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-main"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-main"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/posts"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-main"
              >
                책담
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex-grow text-center">
          <Link to="/" className="text-3xl font-script text-gray-800 transition hover:text-main">
            BookDam
          </Link>
        </div>

        <div className="hidden flex-1 items-center justify-end gap-4 md:flex">
          {isLoggedIn ? (
            <>
              <Link
                to="/mypage"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-main"
              >
                마이페이지
              </Link>

              <Button
                onClick={handleLogout}
                bgColor="bg-transparent"
                textColor="text-gray-600"
                hoverTextColor="hover:text-main"
                hoverBgColor="hover:transparent"
                className="px-0 text-sm font-medium"
              >
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/mypage"
                onClick={handleMyPageClick}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-main"
              >
                마이페이지
              </Link>
              <Link
                to="/auth/login"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-main"
              >
                로그인
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2 md:hidden">
          {!isMyPagePath && (
            <button
              onClick={toggleMobileMenu}
              className="rounded-md p-1 text-gray-600 transition hover:bg-main/10 hover:text-main focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-main/10 bg-white/95 px-4 pb-4 pt-2 shadow-lg md:hidden">
          <nav>
            <ul className="flex flex-col space-y-2 list-none">
              {isLoggedIn ? (
                <>
                  <li>
                    <Link
                      to="/mypage"
                      className="block py-2 text-gray-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      마이페이지
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq"
                      className="block py-2 text-gray-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      className="block py-2 text-gray-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/posts"
                      className="block py-2 text-gray-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      책담
                    </Link>
                  </li>
                  <li className="border-t border-gray-200 mt-2 pt-2">
                    <Button
                      onClick={handleLogout}
                      className="block w-full py-2 px-0 text-left"
                      bgColor="bg-transparent"
                      textColor="text-gray-700"
                      hoverTextColor="hover:text-main"
                      hoverBgColor="hover:transparent"
                    >
                      로그아웃
                    </Button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/auth/login"
                      className="block py-2 text-gray-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      로그인
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/mypage"
                      onClick={(e) => {
                        handleMyPageClick(e);
                        toggleMobileMenu();
                      }}
                      className="block py-2 text-gray-700 rounded-md"
                    >
                      마이페이지
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq"
                      className="block py-2 text-gray-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      className="block py-2 text-gray-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/posts"
                      className="block py-2 text-gray-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      책담
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
