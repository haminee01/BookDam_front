// src/components/mypage/MyPageHeader.tsx

interface MyPageHeaderProps {
  title: string;
  description: string;
}

const MyPageHeader: React.FC<MyPageHeaderProps> = ({ title, description }) => {
  return (
    <div className="my-7">
      <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-4">
        {title}
      </h1>
      <p className="text-gray-600 text-sm md:text-base">{description}</p>
    </div>
  );
};

export default MyPageHeader;
