"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import type { LicenseCache, User } from "@kaemform/shared";
import { createClient } from "@/lib/supabase/client";

export interface AuthContextValue {
  user: User;
  license: LicenseCache;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  user,
  license,
  children,
}: {
  user: User;
  license: LicenseCache;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, license, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
