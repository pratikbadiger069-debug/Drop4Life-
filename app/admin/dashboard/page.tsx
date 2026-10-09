"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { AdminDashboardMetrics, OrganizationVerificationItem, AuditLogEntry } from "@/lib/types";
import { adminService } from "@/lib/admin/admin-service";
import { auditService } from "@/lib/audit/audit-service";
import { AdminStatsOverview } from "@/components/admin/admin-stats-overview";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Users,
  Send,
  Flag,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [pendingVerifications, setPendingVerifications] = useState<OrganizationVerificationItem[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLogEntry[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

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

  useEffect(() => {
    async function loadData() {
      if (user?.role !== "admin") return;
      setDataLoading(true);
      try {
        const [m, queue, logs] = await Promise.all([
          adminService.getAdminMetrics(),
          adminService.getVerificationQueue(),
          auditService.getAuditLogs({ limit: 5 }),
        ]);
        setMetrics(m);
        setPendingVerifications(queue.filter((q) => q.verificationStatus === "pending"));
        setRecentAuditLogs(logs);
      } catch (err) {
        console.error("Failed to load admin dashboard", err);
      } finally {
        setDataLoading(false);
      }
    }
    if (user?.role === "admin") {
      loadData();
    }
  }, [user]);

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
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-slate-900">
                Drop4Life Administrative Operations Center
              </h1>
              <Badge variant="default" className="text-[10px] bg-slate-900">
                System Governance
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              System-wide metrics, institutional credential verification queues, audit logs, and compliance analytics.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/admin/verifications">
              <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verification Queue ({pendingVerifications.length})</span>
              </Button>
            </Link>

            <Link href="/admin/reports">
              <Button size="sm" className="text-xs h-8 gap-1.5 bg-red-700 hover:bg-red-800 text-white font-bold">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Generate Reports</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Metrics Overview */}
        {dataLoading || !metrics ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
            Calculating live metrics across registered repositories...
          </div>
        ) : (
          <AdminStatsOverview metrics={metrics} />
        )}

        {/* Two-Column Quick Review Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Organization Verifications */}
          <Card className="border-slate-200 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Verification Queue Preview
                </CardTitle>
                <p className="text-[11px] text-slate-500">
                  Hospitals and community NGOs awaiting credential confirmation.
                </p>
              </div>
              <Link href="/admin/verifications">
                <Button variant="ghost" size="sm" className="text-xs h-7 text-red-700 font-semibold gap-1">
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-4 space-y-3 flex-1">
              {pendingVerifications.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  All submitted organizations have been reviewed!
                </div>
              ) : (
                pendingVerifications.slice(0, 3).map((org) => (
                  <div
                    key={org.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{org.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {org.type.toUpperCase()} • {org.city} • Reg: {org.licenseOrRegId}
                      </div>
                    </div>
                    <Badge variant="warning" className="text-[10px]">
                      Pending Review
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Audit Trail Preview */}
          <Card className="border-slate-200 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Recent System Audit Events
                </CardTitle>
                <p className="text-[11px] text-slate-500">
                  Tamper-evident logs of critical actions across all subsystems.
                </p>
              </div>
              <Link href="/admin/audit-logs">
                <Button variant="ghost" size="sm" className="text-xs h-7 text-indigo-700 font-semibold gap-1">
                  <span>Audit Logs</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-4 space-y-2.5 flex-1">
              {recentAuditLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <ShieldAlert className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  No audit entries recorded yet.
                </div>
              ) : (
                recentAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-white text-xs space-y-1 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="font-mono text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-1">{log.details}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
