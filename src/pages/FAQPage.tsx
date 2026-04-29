import { useState } from "react";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

const FAQPage: React.FC = () => {
  const faqList = [
    {
      question: "회원 가입 방법은?",
      answer:
        "회원 가입은 간단합니다. 홈페이지 상단의 '회원 가입' 버튼을 클릭하고 필요한 정보를 입력하세요. 가입 후 이메일 인증을 완료하면 모든 기능을 이용할 수 있습니다.",
    },
    {
      question: "비밀번호를 잊었어요.",
      answer:
        "로그인 페이지에서 '비밀번호 찾기' 링크를 클릭하세요. 등록된 이메일 주소로 비밀번호 재설정 링크가 전송됩니다.",
    },
    {
      question: "커뮤니티 참여 방법은?",
      answer:
        "참여하려는 커뮤니티를 검색하고 '참여하기' 버튼을 누르면 커뮤니티 관리자에게 요청이 전달됩니다. 승인이 완료되면 활동이 가능합니다.",
    },
    {
      question: "도서 검색은 어떻게?",
      answer:
        "홈페이지 상단 검색창에서 도서명을 입력하고 결과를 클릭하면 상세 정보를 확인할 수 있습니다.",
    },
    {
      question: "문의는 어떻게 하나요?",
      answer:
        "'문의하기' 페이지에서 질문을 남기면 빠르게 답변 드립니다. 고객 지원팀이 항상 대기하고 있습니다.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div>
      <section id="faq" className="container mx-auto py-12 px-20 mt-10">
        <h1 className="text-3xl font-bold mb-5">자주 묻는 질문</h1>
        {faqList.map((item, index) => (
          <div key={index} className="border-b py-6">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left flex justify-between items-center font-semibold"
            >
              <span>{item.question}</span>
              <span>
                {openIndex === index ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </span>
            </button>
            {openIndex === index && (
              <p className="mt-3 text-gray-700 text-sm">{item.answer}</p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

export default FAQPage;
