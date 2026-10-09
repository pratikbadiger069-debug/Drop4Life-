"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardRedirectDispatcher() {
  const { user, isAuthenticated, isLoading, getDashboardRouteForRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login");
      } else {
        const target = getDashboardRouteForRole(user.role);
        router.push(target);
      }
    }
  }, [isLoading, isAuthenticated, user, getDashboardRouteForRole, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
      <Spinner size="lg" label="Routing to authorized dashboard portal..." />
    </div>
  );
}
