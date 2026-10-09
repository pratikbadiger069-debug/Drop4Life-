"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ADMIN_NAV_ITEMS, ALL_BLOOD_GROUPS, STOCK_STATUS_CONFIG } from "@/lib/constants";
import { BloodInventoryItem, BloodGroup, StockStatus } from "@/lib/types";
import { hospitalService } from "@/lib/hospital/hospital-service";
import { adminService } from "@/lib/admin/admin-service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  Clock,
  Loader2,
} from "lucide-react";

export default function AdminInventoryPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
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

  const loadInventory = useCallback(async () => {
    if (user?.role !== "admin") return;
    setDataLoading(true);
    try {
      // Demo hospital repository inventory
      const items = await hospitalService.getBloodInventory("usr-hosp-002");
      setInventory(items);
    } catch (err: any) {
      console.error("Failed to load global inventory", err);
      setFeedbackMsg({ type: "error", text: err.message || "Failed to load blood inventory." });
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadInventory();
    }
  }, [user, loadInventory]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const csv = await adminService.exportReportToCsv("INVENTORY");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `drop4life-inventory-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setFeedbackMsg({ type: "success", text: "Inventory report successfully exported." });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      console.error("Inventory export failed", err);
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

  const totalAvailable = inventory.reduce((sum, item) => sum + item.availableUnits, 0);
  const totalReserved = inventory.reduce((sum, item) => sum + item.reservedUnits, 0);
  const totalQuarantined = inventory.reduce((sum, item) => sum + item.quarantinedUnits, 0);
  const totalExpired = inventory.reduce((sum, item) => sum + item.expiredUnits, 0);
  const criticalCount = inventory.filter((item) => item.stockStatus === "CRITICAL_LOW").length;

  const filteredInventory = inventory.filter((item) => {
    if (bloodGroupFilter !== "ALL" && item.bloodGroup !== bloodGroupFilter) return false;
    if (statusFilter !== "ALL" && item.stockStatus !== statusFilter) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const match = item.bloodGroup.toLowerCase().includes(q) || item.stockStatus.toLowerCase().includes(q);
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
                <Layers className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-slate-900">
                Global Blood Bank Inventory Oversight
              </h1>
            </div>
            <p className="text-sm text-slate-600">
              System-wide oversight of blood reserves across all 8 blood groups, safety thresholds, and quarantine controls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={isExporting || inventory.length === 0}
              className="gap-2 text-xs font-semibold"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Export Inventory CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadInventory}
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

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Available Stock</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{totalAvailable} <span className="text-xs font-normal text-slate-500">units</span></p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Reserved For Patients</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{totalReserved} <span className="text-xs font-normal text-slate-500">units</span></p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Quarantine / Testing</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{totalQuarantined} <span className="text-xs font-normal text-slate-500">units</span></p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Discarded / Expired</p>
              <p className="text-2xl font-black text-slate-600 mt-1">{totalExpired} <span className="text-xs font-normal text-slate-500">units</span></p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Critical Shortages</p>
              <p className="text-2xl font-black text-red-600 mt-1">{criticalCount} <span className="text-xs font-normal text-slate-500">groups</span></p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search blood group or status..."
              aria-label="Search blood group or status"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <label htmlFor="admin-inv-blood-filter" className="sr-only">Filter by Blood Group</label>
            <select
              id="admin-inv-blood-filter"
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700"
            >
              <option value="ALL">All Blood Groups</option>
              {ALL_BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>

            <label htmlFor="admin-inv-status-filter" className="sr-only">Filter by Stock Status</label>
            <select
              id="admin-inv-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="CRITICAL_LOW">Critical Shortage</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="ADEQUATE">Adequate</option>
              <option value="SURPLUS">Surplus</option>
            </select>
          </div>
        </div>

        {/* Inventory Cards / Table */}
        {dataLoading ? (
          <div className="p-12 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-2" />
            <p className="text-sm font-medium text-slate-500">Loading blood bank inventory registers...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No inventory records match filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredInventory.map((item) => {
              const statusCfg = STOCK_STATUS_CONFIG[item.stockStatus] || {
                label: item.stockStatus,
                color: "text-slate-700 bg-slate-50 border-slate-200",
                badgeVariant: "secondary" as const,
              };

              return (
                <Card key={item.bloodGroup} className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 font-black text-lg flex items-center justify-center border border-red-100">
                        {item.bloodGroup}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-900">
                          Group {item.bloodGroup}
                        </CardTitle>
                        <p className="text-[11px] text-slate-500">
                          Threshold: {item.lowStockThreshold} units
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusCfg.badgeVariant} className="text-[10px]">
                      {statusCfg.label}
                    </Badge>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                        <span className="text-[10px] text-emerald-700 font-medium block">Available</span>
                        <span className="text-lg font-black text-emerald-800">{item.availableUnits}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                        <span className="text-[10px] text-blue-700 font-medium block">Reserved</span>
                        <span className="text-lg font-black text-blue-800">{item.reservedUnits}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                        <span className="text-[10px] text-amber-700 font-medium block">Quarantined</span>
                        <span className="text-lg font-black text-amber-800">{item.quarantinedUnits}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                        <span className="text-[10px] text-slate-600 font-medium block">Discarded</span>
                        <span className="text-lg font-black text-slate-700">{item.expiredUnits}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-100">
                      <Clock className="w-3 h-3" />
                      <span>Updated: {item.lastUpdatedAt ? new Date(item.lastUpdatedAt).toLocaleDateString() : "Active"}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
