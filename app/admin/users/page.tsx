"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { ManagedUserRecord } from "@/lib/types";
import { adminService } from "@/lib/admin/admin-service";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  Heart,
  Building2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AdminUsersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<ManagedUserRecord[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Security route guard
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/unauthorized");
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  const loadUsers = useCallback(async () => {
    if (user?.role !== "admin") return;
    setDataLoading(true);
    try {
      const records = await adminService.getUsersAndOrganizations();
      setUsers(records);
    } catch (err: any) {
      console.error("Failed to load users list", err);
      setFeedbackMsg({ type: "error", text: err.message || "Could not retrieve user records." });
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadUsers();
    }
  }, [user, loadUsers]);

  const handleToggleStatus = async (
    userId: string,
    newStatus: "active" | "suspended",
    reason?: string
  ) => {
    try {
      await adminService.setUserStatus(userId, newStatus, reason);
      setFeedbackMsg({
        type: "success",
        text: `User account successfully changed to ${newStatus}.`,
      });
      await loadUsers();
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      console.error("Failed to update user status", err);
      setFeedbackMsg({ type: "error", text: err.message || "Failed to update account status." });
    }
  };

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  const activeCount = users.filter((u) => u.status === "active").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;
  const donorCount = users.filter((u) => u.role === "donor").length;
  const orgCount = users.filter((u) => u.role === "hospital" || u.role === "ngo").length;

  return (
    <DashboardShell
      role="admin"
      userName={user.fullName || "System Administrator"}
      userEmail={user.email}
      navItems={ADMIN_NAV_ITEMS}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-slate-900">
                User & Organization Directory
              </h1>
            </div>
            <p className="text-sm text-slate-600">
              Manage platform participants, review access privileges, and enforce account governance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              disabled={dataLoading}
              className="gap-2 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin" : ""}`} />
              Refresh Directory
            </Button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            role="alert"
            className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
              feedbackMsg.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-red-50 text-red-900 border-red-200"
            }`}
          >
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total Accounts</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{users.length}</p>
              </div>
              <span className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                <Users className="w-4 h-4" />
              </span>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Active Donors</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{donorCount}</p>
              </div>
              <span className="p-2.5 rounded-xl bg-red-50 text-red-600">
                <Heart className="w-4 h-4" />
              </span>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Registered Orgs</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{orgCount}</p>
              </div>
              <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Building2 className="w-4 h-4" />
              </span>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Suspended</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{suspendedCount}</p>
              </div>
              <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Directory Table */}
        {dataLoading ? (
          <div className="p-12 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-2" />
            <p className="text-sm font-medium text-slate-500">Loading user and organization database...</p>
          </div>
        ) : (
          <UserManagementTable users={users} onToggleStatus={handleToggleStatus} />
        )}
      </div>
    </DashboardShell>
  );
}
