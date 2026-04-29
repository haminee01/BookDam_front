import { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

interface StarButtonProps {
  initialIsWishlisted?: boolean;
  onClick?: () => void;
  className?: string;
}

const StarButton: React.FC<StarButtonProps> = ({
  initialIsWishlisted = false,
  onClick,
  className = "",
}) => {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);

  const handleClick = () => {
    setIsWishlisted((prev) => !prev);
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center
                 cursor-pointer
                  ${className}`}
      aria-label="찜하기"
    >
      {isWishlisted ? (
        <FaStar className="w-6 h-6 text-apply" />
      ) : (
        <FaRegStar className="w-6 h-6 text-apply" />
      )}
    </button>
  );
};

export default StarButton;
