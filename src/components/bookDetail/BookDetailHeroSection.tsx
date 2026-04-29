// src/pages/books/BookDetailHeroSection.tsx

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../hooks/useToast";
import axios from "axios";
import Button from "../common/Button";
import HeartButton from "../common/HeartButton";
import { FaCaretDown, FaQuestionCircle } from "react-icons/fa";

import type { BookDetail } from "../../types";
import { AuthRequiredError } from "../../types";
import {
  addWish,
  removeWish,
  upsertBookToMyLibrary,
  fetchMyLibrary,
  addRatingToMyLibrary,
} from "../../api/mypage";

interface BookDetailHeroSectionProps {
  book: BookDetail;
  onCreateCommunityClick: (bookId: string) => void;
}

const BookDetailHeroSection: React.FC<BookDetailHeroSectionProps> = ({
  book,
  onCreateCommunityClick,
}) => {
  const queryClient = useQueryClient();
  const [isAddToListDropdownOpen, setIsAddToListDropdownOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isHoveringQuestion, setIsHoveringQuestion] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);

  const [isBookWishlisted, setIsBookWishlisted] = useState(book.isWished);
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const loadBookMyLibraryStatus = async () => {
      try {
        const response = await fetchMyLibrary(1, 1000);
        const myLibraryBook = response.data.find(
          (item) => item.book.isbn13 === book.isbn13
        );
        if (
          myLibraryBook &&
          myLibraryBook.myRating !== null &&
          myLibraryBook.myRating !== undefined
        ) {
          setSelectedRating(myLibraryBook.myRating);
        } else {
          setSelectedRating(0);
        }
      } catch (error) {
        console.error("Failed to load my library status for book:", error);
        setSelectedRating(0);
      }
    };

    loadBookMyLibraryStatus();
  }, [book.isbn13]);

  const toggleAddToListDropdown = () => {
    setIsAddToListDropdownOpen((prevState) => !prevState);
  };

  const handleAddToList = useCallback(
    async (status: "WANT_TO_READ" | "READING") => {
      if (!isLoggedIn) {
        showToast("내 서재에 추가하려면 로그인이 필요합니다.", "warn");
        return;
      }

      try {
        await upsertBookToMyLibrary(book.isbn13, status, null);

        setIsAddToListDropdownOpen(false);
        queryClient.invalidateQueries({ queryKey: ["myLibrary"] });
        showToast("내 서재에 성공적으로 추가되었습니다.", "success");
      } catch (error: unknown) {
        if (error instanceof AuthRequiredError) {
          showToast(error.message, "error");
        } else {
          console.error("내 서재 추가/수정 실패:", error);
          let errorMessage = "내 서재 추가/수정 중 오류가 발생했습니다.";
          if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data.message || error.message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          showToast(errorMessage, "error");
        }
      }
    },
    [book.isbn13, queryClient, isLoggedIn, showToast]
  );

  const handleStarClick = async (rating: number) => {
    if (!isLoggedIn) {
      showToast("별점을 주려면 로그인이 필요합니다.", "warn");
      return;
    }

    try {
      setSelectedRating(rating);

      await addRatingToMyLibrary(book.isbn13, rating);

      queryClient.invalidateQueries({ queryKey: ["myLibrary"] });
      showToast(`내 서재에 성공적으로 추가되었습니다. `, "success");
    } catch (error: unknown) {
      console.error("별점 추가 실패:", error);
      setSelectedRating(0); // 실패 시 별점 초기화

      let errorMessage = "별점 추가 중 오류가 발생했습니다.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast(errorMessage, "error");
    }
  };

  const handleWishlistClick = useCallback(
    async (isWishlisted: boolean) => {
      if (!isLoggedIn) {
        showToast("도서를 찜하려면 로그인이 필요합니다.", "warn");
        return;
      }
      try {
        if (isWishlisted) {
          await addWish(book.isbn13);
        } else {
          await removeWish(book.isbn13);
        }
        setIsBookWishlisted(isWishlisted);
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        queryClient.invalidateQueries({
          queryKey: ["bookDetailPageData", book.isbn13, isLoggedIn],
        });
        showToast(
          isWishlisted
            ? "도서가 찜 목록에 추가되었습니다."
            : "도서가 찜 목록에서 제거되었습니다.",
          "success"
        );
      } catch (error: unknown) {
        if (error instanceof AuthRequiredError) {
          showToast(error.message, "error");
        } else {
          console.error("찜 목록 추가/삭제 실패:", error);
          let errorMessage = "찜 목록 처리 중 오류가 발생했습니다.";
          if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data.message || error.message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          showToast(errorMessage, "error");
          setIsBookWishlisted(!isWishlisted);
        }
      }
    },
    [book.isbn13, queryClient, isLoggedIn, showToast]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsAddToListDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white px-10 my-8">
      <div className="flex flex-col md:flex-row items-start gap-8">
        <div className="flex-shrink-0 mr-0 md:mr-10 w-full md:w-[280px]">
          <img
            src={
              book.cover ||
              "https://via.placeholder.com/200x450/F0F0F0/B0B0B0?text=Book+Cover"
            }
            alt={book.title}
            className="w-full h-auto object-cover rounded-md"
          />
        </div>

        <div className="flex-grow text-left">
          <h1 className="text-3xl md:text-3xl font-bold text-gray-800 mb-7">
            {book.title}
          </h1>
          <span className="inline-block bg-category text-categoryText text-sm px-3 py-1 rounded-full mb-6">
            {book.category}
          </span>

          <p className="text-gray-700 text-sm mb-10 leading-relaxed">
            {book.description}
          </p>

          <div className="flex items-center justify-center mb-8">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={`cursor-pointer text-4xl mr-1 ${
                  index < selectedRating ? "text-yellow-400" : "text-gray-300"
                }`}
                onClick={() => handleStarClick(index + 1)}
              >
                ★
              </span>
            ))}
            <div
              className="relative ml-2 cursor-pointer"
              onMouseEnter={() => setIsHoveringQuestion(true)}
              onMouseLeave={() => setIsHoveringQuestion(false)}
              ref={questionRef}
            >
              <FaQuestionCircle className="h-6 w-6 text-gray-400" />
              {isHoveringQuestion && (
                <div className="absolute left-full ml-2 w-max p-2 bg-gray-700 text-white text-xs rounded-md shadow-lg z-20">
                  별점을 주고 내 서재에 <br />
                  "읽은 책"으로 보관할 수 있어요!
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center mb-8">
            <Button
              bgColor="bg-main"
              textColor="text-white"
              hoverBgColor="hover:bg-apply"
              className="px-4 py-2 w-auto mr-2 flex-1"
              onClick={() => onCreateCommunityClick(book.isbn13)}
            >
              커뮤니티 모집하기
            </Button>

            <div className="flex-1 relative" ref={dropdownRef}>
              <Button
                onClick={toggleAddToListDropdown}
                bgColor="bg-main"
                textColor="text-white"
                hoverBgColor="hover:bg-apply"
                className="px-4 py-2 w-full flex items-center justify-center space-x-2 flex-1"
              >
                <span>서재 추가</span>
                <FaCaretDown className="h-4 w-4" />
              </Button>
              {isAddToListDropdownOpen && (
                <div className="absolute top-full mt-2 w-full z-10 left-0 bg-white shadow-lg rounded-md border border-gray-200">
                  <Button
                    onClick={() => handleAddToList("WANT_TO_READ")}
                    className="block w-full text-left px-4 py-2 mb-1"
                    bgColor="bg-transparent"
                    textColor="text-gray-700"
                    hoverBgColor="hover:bg-transparent"
                    hoverTextColor="hover:text-main"
                  >
                    읽고싶어요
                  </Button>
                  <Button
                    onClick={() => handleAddToList("READING")}
                    className="block w-full text-left px-4 py-2 mb-1"
                    bgColor="bg-transparent"
                    textColor="text-gray-700"
                    hoverBgColor="hover:bg-transparent"
                    hoverTextColor="hover:text-main"
                  >
                    읽는 중
                  </Button>
                </div>
              )}
            </div>

            <HeartButton
              onClick={handleWishlistClick}
              initialIsWishlisted={isBookWishlisted}
              className="ml-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailHeroSection;
