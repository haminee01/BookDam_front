// src/api/axiosInstance.ts

import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.data &&
      error.response.data.errorMessage
    ) {
      console.error("API Error:", error.response.data.errorMessage);
      alert(error.response.data.errorMessage);

      if (error.response.data.errorMessage === "로그인을 해주세요") {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userId");
        window.location.href = "/login";
      }
    } else {
      console.error("API Error:", error.message);
      alert("알 수 없는 오류가 발생했습니다.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
