"use client";

import { useAuthContext } from "@/components/providers/AuthProvider";

export function useAuth() {
  const { user, license, logout } = useAuthContext();
  return { user, license, isLoading: false as const, logout };
}
