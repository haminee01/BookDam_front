// src/pages/auth/FindPasswordPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";

const FindPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { issueTemporaryPassword, loading, error } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await issueTemporaryPassword(email, name);

    if (success) {
      navigate("/auth/login");
    } else {
      console.error("비밀번호 찾기 요청 실패");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <section id="findPassword" className="max-w-md mx-auto p-6 mt-10">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          비밀번호 찾기
        </h1>
        <p className="text-center text-gray-600 mb-8">
          가입 시 입력했던 이메일과 이름을 입력해주세요. <br />
          임시 비밀번호를 이메일로 보내드립니다.
        </p>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">오류: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1">
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="가입 이메일 주소"
              required
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-main"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-1">
              이름
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              required
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-main"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "전송 중..." : "임시 비밀번호 받기"}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default FindPasswordPage;
