import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasDb = Boolean(url && key);

export const supabase: SupabaseClient | null = hasDb
  ? createClient(url as string, key as string, {
      auth: { persistSession: false },
    })
  : null;
