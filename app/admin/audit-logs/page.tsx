"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { AuditLogEntry } from "@/lib/types";
import { auditService } from "@/lib/audit/audit-service";
import { adminService } from "@/lib/admin/admin-service";
import { AuditLogViewer } from "@/components/admin/audit-log-viewer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  RefreshCw,
  Download,
  Lock,
  Layers,
  Send,
  UserCheck,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
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

  const loadAuditLogs = useCallback(async () => {
    if (user?.role !== "admin") return;
    setDataLoading(true);
    try {
      const records = await auditService.getAuditLogs({ limit: 100 });
      setLogs(records);
    } catch (err: any) {
      console.error("Failed to load audit logs", err);
      setFeedbackMsg({ type: "error", text: err.message || "Failed to retrieve system audit trail." });
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadAuditLogs();
    }
  }, [user, loadAuditLogs]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const csv = await adminService.exportReportToCsv("AUDIT_LOGS");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `drop4life-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setFeedbackMsg({ type: "success", text: "Audit trail successfully exported as secure CSV." });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      console.error("Audit export failed", err);
      setFeedbackMsg({ type: "error", text: err.message || "Export failed." });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  const inventoryChangesCount = logs.filter((l) => l.action === "INVENTORY_CHANGE").length;
  const requestChangesCount = logs.filter((l) => l.action === "REQUEST_STATUS_CHANGE").length;
  const verificationCount = logs.filter((l) => l.action === "VERIFICATION_DECISION").length;
  const userChangesCount = logs.filter((l) => l.action === "USER_STATUS_CHANGE").length;

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
              <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-slate-900">
                System Audit Trail & Security Ledger
              </h1>
              <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-800 border-purple-200 gap-1">
                <Lock className="w-3 h-3" /> Append-Only
              </Badge>
            </div>
            <p className="text-sm text-slate-600">
              Immutable ledger of sensitive operations including inventory updates, status overrides, and institutional verifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={isExporting || logs.length === 0}
              className="gap-2 text-xs font-semibold"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Export Audit Trail
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAuditLogs}
              disabled={dataLoading}
              className="gap-2 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin" : ""}`} />
              Refresh Logs
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

        {/* Audit Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Inventory Changes</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{inventoryChangesCount}</p>
              </div>
              <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
                <Layers className="w-4 h-4" />
              </span>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Request Statuses</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{requestChangesCount}</p>
              </div>
              <span className="p-2.5 rounded-xl bg-red-50 text-red-700">
                <Send className="w-4 h-4" />
              </span>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Verification Decisions</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{verificationCount}</p>
              </div>
              <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <UserCheck className="w-4 h-4" />
              </span>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Account Governance</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{userChangesCount}</p>
              </div>
              <span className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                <Lock className="w-4 h-4" />
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log Table */}
        {dataLoading ? (
          <div className="p-12 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
            <p className="text-sm font-medium text-slate-500">Retrieving tamper-evident audit ledger...</p>
          </div>
        ) : (
          <AuditLogViewer logs={logs} />
        )}
      </div>
    </DashboardShell>
  );
}
