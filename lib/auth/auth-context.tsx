"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AuthUser,
  AuthSession,
  authAdapter,
  RegisterDonorPayload,
  RegisterHospitalPayload,
  RegisterNgoPayload,
} from "./auth-adapter";
import { UserRole } from "@/lib/types";

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerDonor: (payload: RegisterDonorPayload) => Promise<void>;
  registerHospital: (payload: RegisterHospitalPayload) => Promise<void>;
  registerNgo: (payload: RegisterNgoPayload) => Promise<void>;
  logout: () => void;
  getDashboardRouteForRole: (role?: UserRole | null) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const activeSession = authAdapter.getSession();
      setSession(activeSession);
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDashboardRouteForRole = (userRole?: UserRole | null): string => {
    const targetRole = userRole || session?.user?.role;
    switch (targetRole) {
      case "donor":
        return "/donor/dashboard";
      case "hospital":
        return "/hospital/dashboard";
      case "ngo":
        return "/ngo/dashboard";
      case "admin":
        return "/hospital/dashboard";
      default:
        return "/login";
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const newSession = await authAdapter.login(email, password);
      setSession(newSession);
      const targetRoute = getDashboardRouteForRole(newSession.user.role);
      router.push(targetRoute);
    } finally {
      setIsLoading(false);
    }
  };

  const registerDonor = async (payload: RegisterDonorPayload) => {
    setIsLoading(true);
    try {
      const newSession = await authAdapter.registerDonor(payload);
      setSession(newSession);
      router.push("/donor/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const registerHospital = async (payload: RegisterHospitalPayload) => {
    setIsLoading(true);
    try {
      const newSession = await authAdapter.registerHospital(payload);
      setSession(newSession);
      router.push("/hospital/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const registerNgo = async (payload: RegisterNgoPayload) => {
    setIsLoading(true);
    try {
      const newSession = await authAdapter.registerNgo(payload);
      setSession(newSession);
      router.push("/ngo/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authAdapter.logout();
    setSession(null);
    router.push("/login");
  };

  const value: AuthContextType = {
    user: session?.user || null,
    role: session?.user?.role || null,
    isAuthenticated: !!session?.user,
    isLoading,
    login,
    registerDonor,
    registerHospital,
    registerNgo,
    logout,
    getDashboardRouteForRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const defaultGuestAuth: AuthContextType = {
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  registerDonor: async () => {},
  registerHospital: async () => {},
  registerNgo: async () => {},
  logout: () => {},
  getDashboardRouteForRole: (role?: UserRole | null) => {
    switch (role) {
      case "donor":
        return "/donor/dashboard";
      case "hospital":
        return "/hospital/dashboard";
      case "ngo":
        return "/ngo/dashboard";
      default:
        return "/login";
    }
  },
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    return defaultGuestAuth;
  }
  return context;
}
