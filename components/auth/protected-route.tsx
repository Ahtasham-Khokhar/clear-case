// File: /components/auth/protected-route.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to login if not authenticated
        router.push("/login");
        return;
      }

      // Fetch user role from your users table
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("clerk_id", user.id)
        .single();

      if (!userData || !allowedRoles.includes(userData.role)) {
        // Redirect to unauthorized page or home if role not allowed
        router.push("/unauthorized");
      }
    };

    checkAuth();
  }, [router, allowedRoles]);

  return <>{children}</>;
}