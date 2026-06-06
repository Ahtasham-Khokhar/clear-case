import { createBrowserClient } from "@supabase/ssr";
import { createServerClient as createSSRServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import type { CookieOptions } from "@supabase/ssr";

const getSupabaseEnvVars = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your .env.local file.');
    return null;
  }

  return { supabaseUrl, supabaseAnonKey };
};

// Client-side Supabase client using @supabase/ssr for cookie-based session storage.
// This ensures sessions are accessible by both client components and the Next.js middleware.
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Alias for backward compatibility
export const getSupabaseClient = createClient;

export function createServerClient(cookieStore?: {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options: CookieOptions) => void;
  remove: (name: string, options: CookieOptions) => void;
}) {
  const envVars = getSupabaseEnvVars();
  if (!envVars) throw new Error('Unable to initialize Supabase client: Missing environment variables');

  return createSSRServerClient<Database>(
    envVars.supabaseUrl,
    envVars.supabaseAnonKey,
    { 
      cookies: {
        get: (name: string) => cookieStore ? cookieStore.get(name) : undefined,
        set: (name: string, value: string, options: CookieOptions) => {
          if (cookieStore) {
            try {
              cookieStore.set(name, value, options);
            } catch (err) {
              console.error('Error setting cookie:', err);
            }
          }
        },
        remove: (name: string, options: CookieOptions) => {
          if (cookieStore) {
            try {
              cookieStore.remove(name, options);
            } catch (err) {
              console.error('Error removing cookie:', err);
            }
          }
        }
      },
    }
  );
}

export type Case = Database["public"]["Tables"]["cases"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"] & {
  sender?: {
    id: string;
    full_name: string;
    role: string;
  } | null;
};
export type CaseUpdate = Database["public"]["Tables"]["case_updates"]["Row"] & {
  updated_by_user?: {
    full_name: string;
    role?: string;
  } | null;
};
export interface UserWithProfile {
  id: string;
  email?: string;
  full_name?: string;
  role?: string;
};
export type PoliceStation = {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
};
