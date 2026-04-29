// src/hooks/useToast.ts

import { useCallback, useRef } from "react";
import { toast, type ToastOptions } from "react-toastify";

interface CustomToastOptions extends ToastOptions {
  message?: string;
}

export const useToast = () => {
  const lastToastRef = useRef<{ message: string; type: string; timestamp: number } | null>(null);
  const DEBOUNCE_TIME = 2000; // 2초 내 동일한 토스트 방지

  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "info" | "warn" = "info",
      options?: CustomToastOptions
    ) => {
      const now = Date.now();
      const lastToast = lastToastRef.current;

      // 중복 토스트 방지: 2초 내 동일한 메시지와 타입이면 표시하지 않음
      if (
        lastToast &&
        lastToast.message === message &&
        lastToast.type === type &&
        now - lastToast.timestamp < DEBOUNCE_TIME
      ) {
        return;
      }

      // 마지막 토스트 정보 업데이트
      lastToastRef.current = { message, type, timestamp: now };

      switch (type) {
        case "success":
          toast.success(message, options);
          break;
        case "error":
          toast.error(message, options);
          break;
        case "info":
          toast.info(message, options);
          break;
        case "warn":
          toast.warn(message, options);
          break;
        default:
          toast(message, options);
      }
    },
    []
  );

  return { showToast };
};
