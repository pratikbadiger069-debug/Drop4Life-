"use client";

import React, { useState } from "react";
import { AdminAnalyticsReport } from "@/lib/types";
import { adminService } from "@/lib/admin/admin-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  BarChart3,
} from "lucide-react";

interface ReportsGeneratorProps {
  initialReport: AdminAnalyticsReport;
  onRefreshReport: (filters: { startDate?: string; endDate?: string }) => Promise<void>;
}

export function ReportsGenerator({
  initialReport,
  onRefreshReport,
}: ReportsGeneratorProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [exportType, setExportType] = useState<"REQUESTS" | "USERS" | "INVENTORY" | "AUDIT_LOGS">("REQUESTS");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const handleApplyFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRefreshing(true);
    try {
      await onRefreshReport({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    setExportSuccessMsg(null);
    try {
      const csvString = await adminService.exportReportToCsv(exportType);
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `drop4life_${exportType.toLowerCase()}_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccessMsg(`Successfully generated and downloaded ${exportType} CSV dataset.`);
      setTimeout(() => setExportSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Export error", err);
    } finally {
      setIsExporting(false);
    }
  };

  const { summary } = initialReport;

  return (
    <div className="space-y-6">
      {/* Date Filter Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <form onSubmit={handleApplyFilter} className="flex flex-col md:flex-row items-end gap-3 justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full">
              <div>
                <Label htmlFor="rep-start" className="text-xs font-bold text-slate-700">
                  Filter Start Date
                </Label>
                <Input
                  id="rep-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 text-xs h-9"
                />
              </div>

              <div>
                <Label htmlFor="rep-end" className="text-xs font-bold text-slate-700">
                  Filter End Date
                </Label>
                <Input
                  id="rep-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 text-xs h-9"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-9 text-xs font-semibold gap-1.5 w-full md:w-auto"
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Filter className="w-3.5 h-3.5" />
                )}
                <span>Apply Range Filter</span>
              </Button>

              {(startDate || endDate) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    onRefreshReport({});
                  }}
                  className="h-9 text-xs text-slate-500"
                >
                  Reset
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Blood Demanded</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {summary.totalUnitsRequested} Units
          </div>
          <span className="text-[11px] text-slate-400">across {summary.totalRequests} requisitions</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 uppercase">Fulfilled Units</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {summary.totalUnitsFulfilled} Units
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">{summary.fulfillmentRate}% fulfillment rate</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 uppercase">Community Mobilization</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {summary.totalVolunteersPledged} Pledges
          </div>
          <span className="text-[11px] text-slate-400">across {summary.totalCampaigns} campaigns</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 uppercase">Available Buffer Stock</span>
          <div className="text-2xl font-black text-red-700 mt-1">
            {summary.currentAvailableBloodUnits} Units
          </div>
          <span className="text-[11px] text-slate-400">{summary.totalVerifiedOrgs} verified facilities</span>
        </div>
      </div>

      {/* CSV Export Bar Card */}
      <Card className="border-slate-200 bg-slate-50/50 shadow-sm">
        <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              <h4 className="text-sm font-bold text-slate-900">
                Official Compliance CSV Data Export
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              Generate standardized CSV records for clinical governance audits. Personal donor home addresses and private patient notes are automatically redacted.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as any)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold focus:border-red-500 focus:outline-none"
              aria-label="Select Report Dataset"
            >
              <option value="REQUESTS">Requisitions Dataset</option>
              <option value="USERS">Users & Orgs Directory</option>
              <option value="INVENTORY">Blood Inventory Records</option>
              <option value="AUDIT_LOGS">System Audit Trail</option>
            </select>

            <Button
              onClick={handleExportCsv}
              disabled={isExporting}
              size="sm"
              className="h-9 bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-1.5 shrink-0"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Export CSV</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {exportSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportSuccessMsg}</span>
        </div>
      )}
    </div>
  );
}
