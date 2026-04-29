// src/components/common/HeartButton.tsx

import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface HeartButtonProps {
  onClick: (isWishlisted: boolean) => void;
  initialIsWishlisted?: boolean;
  className?: string;
}

const HeartButton: React.FC<HeartButtonProps> = ({
  onClick,
  initialIsWishlisted = false,
  className = "",
}) => {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const newWishlistStatus = !isWishlisted;
    setIsWishlisted(newWishlistStatus);

    onClick(newWishlistStatus);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-colors duration-200 ${
        isWishlisted
          ? "text-red-500 hover:bg-red-100"
          : "text-gray-400 hover:bg-gray-100"
      } ${className}`}
      aria-label={isWishlisted ? "찜 해제" : "찜하기"}
    >
      {isWishlisted ? (
        <FaHeart className="w-6 h-6" />
      ) : (
        <FaRegHeart className="w-6 h-6" />
      )}
    </button>
  );
};

export default HeartButton;
