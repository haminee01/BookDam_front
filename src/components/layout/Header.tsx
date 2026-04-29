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
    <header className="bg-white py-4 fixed top-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center px-4">
        <nav className="flex-1 hidden md:flex items-center space-x-4">
          <ul className="flex items-center space-x-4 list-none">
            <li>
              <Link
                to="/faq"
                className="text-gray-600 hover:text-main text-base"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-gray-600 hover:text-main text-base"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/posts"
                className="text-gray-600 hover:text-main text-base"
              >
                책담
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex-grow text-center">
          <Link to="/" className="text-3xl font-script text-gray-800">
            BookDam
          </Link>
        </div>

        <div className="flex-1 hidden md:flex justify-end items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link
                to="/mypage"
                className="text-gray-600 hover:text-main text-base"
              >
                마이페이지
              </Link>

              <Button
                onClick={handleLogout}
                bgColor="bg-transparent"
                textColor="text-gray-600"
                hoverTextColor="hover:text-main"
                hoverBgColor="hover:transparent"
                className="text-base"
              >
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/mypage"
                onClick={handleMyPageClick}
                className="text-gray-600 hover:text-main text-base"
              >
                마이페이지
              </Link>
              <Link
                to="/auth/login"
                className="text-gray-600 hover:text-main text-base"
              >
                로그인
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center space-x-2">
          {!isMyPagePath && (
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-main focus:outline-none"
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
        <div className="md:hidden px-4 pt-2 pb-4 shadow-lg border-t border-gray-200">
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
