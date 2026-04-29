import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';

const AuthStatusDisplay: React.FC = () => {
  const { isLoggedIn, userId, currentUserProfile, loading } = useAuthContext();

  return (
    <div className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white p-3 sm:p-4 rounded-lg shadow-lg border border-gray-200 text-xs sm:text-sm max-w-[280px] sm:max-w-xs z-40">
      <h3 className="font-semibold mb-2 text-gray-800 text-xs sm:text-sm">인증 상태</h3>
      <div className="space-y-1 text-gray-600">
        <div className="flex items-center justify-between">
          <span>로그인:</span>
          <span>{isLoggedIn ? '✅' : '❌'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>사용자 ID:</span>
          <span className="font-mono text-xs">{userId || '없음'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>이름:</span>
          <span className="truncate max-w-[120px] sm:max-w-[140px]">{currentUserProfile?.name || '없음'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>이메일:</span>
          <span className="truncate max-w-[120px] sm:max-w-[140px] font-mono text-xs">{currentUserProfile?.email || '없음'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>로딩:</span>
          <span>{loading ? '🔄' : '완료'}</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        실시간 업데이트됨
      </div>
    </div>
  );
};

export default AuthStatusDisplay;
