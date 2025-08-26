// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // 환경변수 미설정 시에도 앱이 죽지 않도록 경고만
  // eslint-disable-next-line no-console
  console.warn('[Supabase] REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY 가 설정되지 않았습니다.');
}

export const supabase = createClient(url || '', anon || '');
