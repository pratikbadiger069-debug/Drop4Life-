"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { OrganizationVerificationItem } from "@/lib/types";
import { adminService } from "@/lib/admin/admin-service";
import { VerificationTable } from "@/components/admin/verification-table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function AdminVerificationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<OrganizationVerificationItem[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/unauthorized");
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  const loadQueue = async () => {
    setDataLoading(true);
    try {
      const data = await adminService.getVerificationQueue();
      setItems(data);
    } catch (err) {
      console.error("Failed to load verification queue", err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadQueue();
    }
  }, [user]);

  const handleDecision = async (
    userId: string,
    decision: "verified" | "rejected",
    reason?: string
  ) => {
    await adminService.processVerification(userId, decision, reason);
    await loadQueue();
  };

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  const pendingCount = items.filter((i) => i.verificationStatus === "pending").length;

  return (
    <DashboardShell
      role="admin"
      userName={user.fullName || "System Administrator"}
      userEmail={user.email}
      navItems={ADMIN_NAV_ITEMS}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-slate-900">
                Institutional Verification Center
              </h1>
              {pendingCount > 0 && (
                <Badge variant="warning" className="text-xs font-bold">
                  {pendingCount} Pending Review
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Review, approve, or reject participating hospital clinical licenses and community NGO registration certificates.
            </p>
          </div>
        </div>

        {/* Verification Table */}
        {dataLoading ? (
          <div className="py-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
            Loading verification queue...
          </div>
        ) : (
          <VerificationTable items={items} onDecision={handleDecision} />
        )}
      </div>
    </DashboardShell>
  );
}
