"use client";

import React from "react";
import { AdminDashboardMetrics } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Building2,
  Activity,
  Send,
  Flag,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Heart,
  CheckCircle2,
} from "lucide-react";

interface AdminStatsOverviewProps {
  metrics: AdminDashboardMetrics;
}

export function AdminStatsOverview({ metrics }: AdminStatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Platform Users */}
      <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Community
            </span>
            <span className="p-2 rounded-xl bg-red-50 text-red-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {metrics.totalUsers}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{metrics.totalDonors}</span> Donors •{" "}
            <span className="font-semibold text-slate-700">{metrics.totalHospitals}</span> Hospitals •{" "}
            <span className="font-semibold text-slate-700">{metrics.totalNgos}</span> NGOs
          </div>
        </CardContent>
      </Card>

      {/* Blood Requisitions */}
      <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Blood Requisitions
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Send className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {metrics.openRequests}
            <span className="text-xs font-normal text-slate-500 ml-1.5">Open Pending</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {metrics.fulfilledRequests} Fulfilled
            </span>
            <span>across trauma network</span>
          </div>
        </CardContent>
      </Card>

      {/* Hospital Inventory Reserves */}
      <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Regional Inventory
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {metrics.totalAvailableUnits}
            <span className="text-xs font-normal text-slate-500 ml-1.5">Available Units</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {metrics.criticalStockGroups > 0 ? (
              <span className="inline-flex items-center gap-1 text-red-700 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                {metrics.criticalStockGroups} Groups in Critical Shortage
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold">Reserves adequate</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Drives & Verifications */}
      <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Drives & Governance
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {metrics.activeCampaigns}
            <span className="text-xs font-normal text-slate-500 ml-1.5">Active Campaigns</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{metrics.totalCampaigns} total organized</span>
            {metrics.pendingVerifications > 0 && (
              <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                {metrics.pendingVerifications} Pending Review
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
