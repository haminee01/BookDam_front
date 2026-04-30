// src/pages/auth/LoginPage.tsx

import { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import { isMockMode } from "../../lib/supabase";
import { GUEST_PROFILE } from "../../constants/guestAccount";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuthContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      setError(null);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const handleGuestLogin = async () => {
    try {
      await login(GUEST_PROFILE.email, "guest");
      setError(null);
    } catch {
      setError("게스트 로그인에 실패했습니다.");
    }
  };

  return (
    <div>
      <section id="loginText" className="container mx-auto py-12 px-20 mt-10">
        <h1 className="text-3xl font-semibold mb-6">환영합니다, 로그인</h1>
        <p>
          당신의 독서 여정을 시작하기 위해 로그인하세요.함께 책을 나누고
          소통합시다.
        </p>
      </section>
      <section id="login" className="container mx-auto py-12 px-20">
        <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
          <div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>
          <div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div className="flex items-center justify-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </Button>
            {isMockMode && (
              <Button
                type="button"
                onClick={handleGuestLogin}
                disabled={loading}
              >
                게스트 계정으로 바로 둘러보기
              </Button>
            )}
          </div>
          {isMockMode && (
            <p className="text-xs text-gray-500 text-center">
              회원가입 없이 게스트 계정으로 마이페이지/책담을 포함한 모든 기능을
              체험할 수 있습니다.
            </p>
          )}
          <div className="text-center mt-4">
            <Link
              to="/auth/find-password"
              className="text-sm text-gray-600 hover:text-main underline"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>
        </form>
      </section>
      <section id="register" className="container mx-auto py-12 px-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
          <div>
            <h2 className="text-2xl font-bold mb-4">
              회원 가입으로 새로운 시작
            </h2>
          </div>
          <div className="text-right">
            <p className="text-gray-700 mb-5">
              아직 회원이 아니신가요? <br />
              지금 가입하시면 다양한 독서 경험과 커뮤니티 활동에 참여하실 수
              있습니다.
            </p>
            <Button to="/auth/register">가입하기</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
