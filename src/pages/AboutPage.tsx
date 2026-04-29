// src/pages/AboutPage.tsx

import { IoSearchOutline, IoBookmarkOutline } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";

const AboutPage: React.FC = () => {
  return (
    <div>
      <section id="vision" className="container mx-auto py-12 px-20 mt-10">
        <h1 className="text-3xl font-bold mb-8">우리의 비전</h1>
        <p className="text-lg mb-40">
          책과 사람을 연결하여 독서의 즐거움을 나누는 플랫폼입니다.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10 max-w-5xl mx-auto mb-10">
          <div className="md:w-1/2 mr-12">
            <div className="w-full h-60 flex items-center justify-center rounded-lg">
              <img
                src="/BookCommunity.png"
                className="w-full h-60 object-cover rounded-lg shadow"
              />
            </div>
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold mb-10">
              독서와 커뮤니티를 연결하는 종합 플랫폼으로 여러분을 초대합니다.
            </h2>
            <p className="text-base text-gray-600">
              이 웹사이트는 사용자에게 다양한 도서와 독서 토론의 기회를
              제공합니다. 또한, 마이페이지 관리와 커뮤니티 활동 참여를 통해 독서
              경험을 더욱 풍부하게 만들어 드립니다.
            </p>
          </div>
        </div>
      </section>
      <section id="service" className="container mx-auto py-12 px-20">
        <h2 className="text-2xl font-bold mb-10">
          다양한 독서 경험을 제공합니다
        </h2>
        <p>
          우리 플렛폼은 사용자가 도서를 쉽게 검색하고 독서 토론에 참여할 수 있는
          기회를 제공합니다. <br />
          또한, 다양한 커뮤니티 활동을 통해 독서의 즐거움을 나누고 소통할 수
          있습니다.
        </p>
        <div className="flex justify-around mt-20">
          <div className="text-center">
            <IoSearchOutline size={32} className="mx-auto" />
            <h3 className="text-xl font-bold mt-4 mb-4">도서 검색 기능</h3>
            <p>
              광범위한 도서 데이터베이스를 통해 원하는 <br />
              책을 쉽게 찾을 수 있습니다.
            </p>
          </div>
          <div className="text-center">
            <LuLayoutDashboard size={32} className="mx-auto" />
            <h3 className="text-xl font-bold mt-4 mb-4">독서 토론 참여</h3>
            <p>
              다양한 주제의 도서 토론에 참여하여 <br />
              의견을 나눌 수 있습니다
            </p>
          </div>
          <div className="text-center">
            <IoBookmarkOutline size={32} className="mx-auto" />
            <h3 className="text-xl font-bold mt-4 mb-4">
              나만의 독서 기록 관리
            </h3>
            <p>내 독서 기록을 쉽게 관리하고 확인하세요.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
