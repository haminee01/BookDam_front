import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
// 데모/프론트 단독 모드는 Supabase 설정 여부와 무관하게 env 플래그로 강제한다.
export const isMockMode = import.meta.env.VITE_FRONT_ONLY_MODE === "true";

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const toNumericUserId = (id: string): number => {
  const compact = id.replace(/-/g, "").slice(0, 12);
  const parsed = Number.parseInt(compact, 16);
  if (Number.isNaN(parsed)) return 1;
  return parsed % 1000000000;
};
