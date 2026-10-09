"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ADMIN_NAV_ITEMS, ALL_BLOOD_GROUPS, REQUEST_STATUS_CONFIG } from "@/lib/constants";
import { BloodRequest, BloodGroup, RequestStatus, RequestPriority } from "@/lib/types";
import { requestService } from "@/lib/requests/request-service";
import { adminService } from "@/lib/admin/admin-service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Download,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  Loader2,
  Activity,
} from "lucide-react";

export default function AdminRequestsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
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

  const loadRequests = useCallback(async () => {
    if (user?.role !== "admin") return;
    setDataLoading(true);
    try {
      const items = await requestService.getRequests();
      setRequests(items);
    } catch (err: any) {
      console.error("Failed to load blood requisitions", err);
      setFeedbackMsg({ type: "error", text: err.message || "Failed to load blood requisitions." });
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadRequests();
    }
  }, [user, loadRequests]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const csv = await adminService.exportReportToCsv("REQUESTS");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `drop4life-requisitions-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setFeedbackMsg({ type: "success", text: "Requisitions report successfully exported." });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      console.error("Requests export failed", err);
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

  const openCount = requests.filter(
    (r) => r.status === "SUBMITTED" || r.status === "UNDER_REVIEW" || r.status === "IN_PROGRESS" || r.status === "OPEN"
  ).length;
  const fulfilledCount = requests.filter((r) => r.status === "FULFILLED").length;
  const criticalCount = requests.filter((r) => r.priority === "CRITICAL").length;
  const totalUnits = requests.reduce((sum, r) => sum + r.unitsNeeded, 0);

  const filteredRequests = requests.filter((r) => {
    if (bloodGroupFilter !== "ALL" && r.bloodGroup !== bloodGroupFilter) return false;
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && r.priority !== priorityFilter) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        r.referenceNumber.toLowerCase().includes(q) ||
        r.hospitalName.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.bloodGroup.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

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
              <span className="p-2 rounded-xl bg-red-50 text-red-600">
                <Send className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-slate-900">
                Requisitions Oversight Board
              </h1>
            </div>
            <p className="text-sm text-slate-600">
              Platform-wide blood requests monitoring, emergency trauma allocations, and fulfillment tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={isExporting || requests.length === 0}
              className="gap-2 text-xs font-semibold"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRequests}
              disabled={dataLoading}
              className="gap-2 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin" : ""}`} />
              Refresh
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Active / Open</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{openCount}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Fulfilled Requests</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{fulfilledCount}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Critical Priority</p>
              <p className="text-2xl font-black text-red-600 mt-1">{criticalCount}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Total Units Requested</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalUnits}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search reference, hospital, city..."
              aria-label="Search reference, hospital, city"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <label htmlFor="admin-req-blood-filter" className="sr-only">Filter by Blood Group</label>
            <select
              id="admin-req-blood-filter"
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700"
            >
              <option value="ALL">All Groups</option>
              {ALL_BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>

            <label htmlFor="admin-req-status-filter" className="sr-only">Filter by Status</label>
            <select
              id="admin-req-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <label htmlFor="admin-req-priority-filter" className="sr-only">Filter by Priority</label>
            <select
              id="admin-req-priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="URGENT">Urgent</option>
              <option value="ROUTINE">Routine</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        {dataLoading ? (
          <div className="p-12 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-2" />
            <p className="text-sm font-medium text-slate-500">Loading blood requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
            <Send className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Hospital & Location</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => {
                  const statusCfg = REQUEST_STATUS_CONFIG[req.status] || {
                    label: req.status,
                    badgeVariant: "secondary" as const,
                  };

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {req.referenceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{req.hospitalName}</p>
                        <p className="text-[11px] text-slate-400">{req.city}, {req.area}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center justify-center font-black px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200">
                          {req.bloodGroup}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {req.unitsFulfilled} / {req.unitsNeeded} units
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={req.priority === "CRITICAL" ? "destructive" : req.priority === "URGENT" ? "warning" : "secondary"}
                          className="text-[10px]"
                        >
                          {req.priority}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={statusCfg.badgeVariant} className="text-[10px]">
                          {statusCfg.label}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
