// src/utils/dateFormatter.ts

export const formatKoreanDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return isoString;
  }
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  };
  return date.toLocaleString("ko-KR", options);
};

export const formatKoreanDate = (isoString: string | undefined): string => {
  if (!isoString) {
    return "";
  }
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return isoString;
  }
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleString("ko-KR", options);
};
