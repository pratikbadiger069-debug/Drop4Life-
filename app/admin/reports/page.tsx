"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { AdminAnalyticsReport } from "@/lib/types";
import { adminService } from "@/lib/admin/admin-service";
import { ReportsGenerator } from "@/components/admin/reports-generator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  RefreshCw,
  Loader2,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";

export default function AdminReportsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [report, setReport] = useState<AdminAnalyticsReport | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const loadReport = useCallback(async (filters?: { startDate?: string; endDate?: string }) => {
    if (user?.role !== "admin") return;
    setDataLoading(true);
    setErrorMsg(null);
    try {
      const generated = await adminService.generateAnalyticsReport(filters);
      setReport(generated);
    } catch (err: any) {
      console.error("Failed to generate analytics report", err);
      setErrorMsg(err.message || "Failed to generate analytics report.");
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadReport();
    }
  }, [user, loadReport]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

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
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-slate-900">
                Administrative Analytics & Compliance Reports
              </h1>
            </div>
            <p className="text-sm text-slate-600">
              Query aggregate operational metrics, filter by date intervals, and export privacy-sanitized CSV datasets for regulatory audits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadReport()}
              disabled={dataLoading}
              className="gap-2 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin" : ""}`} />
              Recalculate Metrics
            </Button>
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-4 rounded-xl text-sm flex items-center gap-3 border bg-red-50 text-red-900 border-red-200"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {dataLoading && !report ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-sm font-medium text-slate-500">Calculating system telemetry & operational performance...</p>
          </div>
        ) : report ? (
          <ReportsGenerator
            initialReport={report}
            onRefreshReport={async (filters) => {
              await loadReport(filters);
            }}
          />
        ) : null}
      </div>
    </DashboardShell>
  );
}
