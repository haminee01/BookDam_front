// src.zip/constants/categories.ts

export const CATEGORY_MAPPING = {
  "소설/시/희곡": "소설",
  에세이: "에세이",
  자기계발: "자기계발",
  경제경영: "경영",
  인문학: "인문학",
  역사: "역사",
  자연과학: "과학",
  사회과학: "사회과학",
  예술: "예술",
  만화: "만화",
  장르소설: "장르소설",
  고전: "고전",
};

export const CATEGORY_ID_MAP = {
  소설: 1,
  에세이: 55889,
  자기계발: 336,
  경영: 170,
  인문학: 656,
  역사: 74,
  과학: 983,
  사회과학: 798,
  예술: 517,
  만화: 2551,
  장르소설: 112011,
  고전: 2105,
  전체: 0,
};

export const getCategoryId = (category?: string): number => {
  return category
    ? CATEGORY_ID_MAP[category as keyof typeof CATEGORY_ID_MAP] || 0
    : 0;
};
