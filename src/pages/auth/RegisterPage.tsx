// src/pages/auth/RegisterPage.tsx

import { useState, useRef, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import ReactDOM from "react-dom";
import Button from "../../components/common/Button";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const initialErrorsState = {
  name: "",
  nickname: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  introduction: "",
  agreement: "",
};

const RegisterPage: React.FC = () => {
  const { register, loading } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    nickname: "",
    phone: "",
    email: "",
    password: "",
    introduction: "",
    agreement: false,
  });

  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState(initialErrorsState);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const introductionRef = useRef<HTMLTextAreaElement>(null);
  const agreementRef = useRef<HTMLInputElement>(null);

  const validateField = useCallback(
    (name: string, value: string | boolean): string => {
      let message = "";
      switch (name) {
        case "name":
          if (!value) message = "이름을 입력해주세요.";
          break;
        case "nickname":
          if (!value) message = "닉네임을 입력해주세요.";
          else if (
            (value as string).length < 1 ||
            (value as string).length > 10
          )
            message = "닉네임은 1자 이상 10자 이하로 입력해주세요.";
          break;
        case "phone":
          if (!value) message = "전화번호를 입력해주세요.";
          else if (!/^\d{2,3}-?\d{3,4}-?\d{4}$/.test(value as string))
            message = "유효한 전화번호 형식이 아닙니다 (예: 010-1234-5678).";
          break;
        case "email":
          if (!value) message = "이메일을 입력해주세요.";
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string))
            message = "유효한 이메일 형식이 아닙니다.";
          break;
        case "password":
          if (!value) message = "비밀번호를 입력해주세요.";
          else if ((value as string).length < 8)
            message = "비밀번호는 최소 8자 이상이어야 합니다.";
          break;
        case "confirmPassword":
          if (!value) message = "비밀번호 확인을 입력해주세요.";
          else if (value !== form.password)
            message = "비밀번호가 일치하지 않습니다.";
          break;
        case "introduction":
          if ((value as string).length > 100)
            message = "한 줄 소개는 100자 이내로 입력해주세요.";
          break;
        case "agreement":
          if (!value)
            message = "이용약관에 동의해야 회원가입을 할 수 있습니다.";
          break;
        default:
          break;
      }
      return message;
    },
    [form.password]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    let newValue: string | boolean = type === "checkbox" ? checked : value;

    if (name === "phone" && typeof newValue === "string") {
      const digitsOnly = newValue.replace(/\D/g, "");
      let formattedNumber = "";
      if (digitsOnly.length > 10) {
        formattedNumber = digitsOnly.replace(
          /(\d{3})(\d{4})(\d{4})/,
          "$1-$2-$3"
        );
      } else if (digitsOnly.length > 6) {
        if (digitsOnly.startsWith("02")) {
          formattedNumber = digitsOnly.replace(
            /(\d{2})(\d{3,4})(\d{4})/,
            "$1-$2-$3"
          );
        } else {
          formattedNumber = digitsOnly.replace(
            /(\d{3})(\d{3,4})(\d{4})/,
            "$1-$2-$3"
          );
        }
      } else if (digitsOnly.length > 2) {
        formattedNumber = digitsOnly.replace(/(\d{2,3})(.+)/, "$1-$2");
      } else {
        formattedNumber = digitsOnly;
      }
      newValue = formattedNumber;
    }

    if (name === "confirmPassword") {
      setConfirmPassword(newValue as string);
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }

    setErrors((prev) => {
      const updatedErrors = { ...prev };
      updatedErrors[name as keyof typeof errors] = validateField(
        name,
        newValue
      );

      if (name === "password" || name === "confirmPassword") {
        const currentPasswordValue =
          name === "password" ? newValue : form.password;
        const currentConfirmPasswordValue =
          name === "confirmPassword" ? newValue : confirmPassword;

        updatedErrors.password = validateField(
          "password",
          currentPasswordValue
        );
        updatedErrors.confirmPassword = validateField(
          "confirmPassword",
          currentConfirmPasswordValue
        );
      }
      return updatedErrors;
    });
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const valueToValidate = type === "checkbox" ? checked : value;

    setErrors((prev) => {
      const updatedErrors = { ...prev };
      updatedErrors[name as keyof typeof errors] = validateField(
        name,
        valueToValidate
      );

      if (name === "password" || name === "confirmPassword") {
        updatedErrors.confirmPassword = validateField(
          "confirmPassword",
          confirmPassword
        );
      }
      return updatedErrors;
    });
  };

  const handleCopyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setErrors((prev) => ({
      ...prev,
      password: "보안을 위해 복사 및 붙여넣기가 금지됩니다.",
      confirmPassword: "보안을 위해 복사 및 붙여넣기가 금지됩니다.",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrorsState = { ...initialErrorsState };
    let firstErrorElement: HTMLElement | null = null;

    const fieldsToValidate: Array<keyof typeof form | "confirmPassword"> = [
      "name",
      "nickname",
      "phone",
      "email",
      "password",
      "confirmPassword",
      "introduction",
    ];

    for (const field of fieldsToValidate) {
      let valueToCheck: string | boolean;
      if (field === "confirmPassword") valueToCheck = confirmPassword;
      else valueToCheck = form[field as keyof typeof form];

      const errorMessage = validateField(field, valueToCheck);
      if (errorMessage) {
        newErrorsState[field as keyof typeof errors] = errorMessage;
      }
    }

    if (!form.agreement) {
      newErrorsState.agreement =
        "이용약관에 동의해야 회원가입을 할 수 있습니다.";
    }

    if (Object.values(newErrorsState).some((msg) => msg !== "")) {
      ReactDOM.flushSync(() => {
        setErrors(newErrorsState);
      });
      for (const field of [...fieldsToValidate, "agreement"]) {
        if (newErrorsState[field as keyof typeof errors]) {
          switch (field) {
            case "name":
              firstErrorElement = nameRef.current;
              break;
            case "nickname":
              firstErrorElement = nicknameRef.current;
              break;
            case "phone":
              firstErrorElement = phoneRef.current;
              break;
            case "email":
              firstErrorElement = emailRef.current;
              break;
            case "password":
              firstErrorElement = passwordRef.current;
              break;
            case "confirmPassword":
              firstErrorElement = confirmPasswordRef.current;
              break;
            case "introduction":
              firstErrorElement = introductionRef.current;
              break;
            case "agreement":
              firstErrorElement = agreementRef.current;
              break;
          }
          if (firstErrorElement) {
            firstErrorElement.focus();
            firstErrorElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            return;
          }
        }
      }
      return;
    }

    const dataToSend = {
      name: form.name,
      nickname: form.nickname,
      phone: form.phone.replace(/[^0-9]/g, ""),
      email: form.email,
      password: form.password,
      introduction: form.introduction,
      agreement: form.agreement,
    };

    try {
      await register(dataToSend);
      showToast("회원가입이 성공적으로 완료되었습니다.", "success");
    } catch (error) {
      const serverErrorsState = { ...initialErrorsState };
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      showToast(errorMessage, "error");
      ReactDOM.flushSync(() => {
        setErrors(serverErrorsState);
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <section id="register" className="container mx-auto py-12 px-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">회원가입</h1>
          <h2 className="text-lg text-gray-700">
            우리의 커뮤니티에 참여하여 독서의 즐거움을 나누세요. <br />
            간단한 절차로 회원 가입을 통해 다양한 혜택을 누리실 수 있습니다.
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="max-w-sm sm:max-w-md mx-auto space-y-4"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-1">
              이름
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="이름을 입력하세요"
              className={`w-full border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded px-4 py-2`}
              ref={nameRef}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-semibold mb-1"
            >
              닉네임
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="닉네임을 입력하세요 (1자 이상 10자 이하)"
              maxLength={10}
              className={`w-full border ${
                errors.nickname ? "border-red-500" : "border-gray-300"
              } rounded px-4 py-2`}
              ref={nicknameRef}
            />
            {errors.nickname && (
              <p className="text-red-500 text-xs mt-1">{errors.nickname}</p>
            )}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold mb-1">
              전화번호
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
              className={`w-full border ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } rounded px-4 py-2`}
              ref={phoneRef}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="이메일 주소를 입력하세요"
              className={`w-full border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded px-4 py-2`}
              ref={emailRef}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-1"
            >
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                onCopy={handleCopyPaste}
                onPaste={handleCopyPaste}
                required
                placeholder="비밀번호를 입력하세요 (최소 8자)"
                className={`w-full border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded px-4 py-2 pr-10`}
                ref={passwordRef}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold mb-1"
            >
              비밀번호 재입력
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                onCopy={handleCopyPaste}
                onPaste={handleCopyPaste}
                required
                placeholder="비밀번호를 다시 입력하세요"
                className={`w-full border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded px-4 py-2 pr-10`}
                ref={confirmPasswordRef}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="introduction"
              className="block text-sm font-semibold mb-1"
            >
              한 줄 소개
            </label>
            <textarea
              id="introduction"
              name="introduction"
              value={form.introduction}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="자신을 한 줄로 소개해보세요 (100자 이내, 선택사항)"
              rows={3}
              maxLength={100}
              className={`w-full border ${
                errors.introduction ? "border-red-500" : "border-gray-300"
              } rounded px-4 py-2 resize-none`}
              ref={introductionRef}
            />
            {errors.introduction && (
              <p className="text-red-500 text-xs mt-1">{errors.introduction}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="agreement"
              name="agreement"
              checked={form.agreement}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`w-4 h-4 ${
                errors.agreement ? "border-red-500" : "border-gray-300"
              }`}
              ref={agreementRef}
            />
            <label htmlFor="agreement" className="text-sm text-gray-700">
              이용약관에 동의합니다
            </label>
          </div>
          {errors.agreement && (
            <p className="text-red-500 text-xs mt-1">{errors.agreement}</p>
          )}

          <div className="text-center pt-5">
            <Button type="submit" disabled={loading}>
              {loading ? "가입 중..." : "가입하기"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default RegisterPage;
