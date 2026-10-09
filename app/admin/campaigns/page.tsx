"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ADMIN_NAV_ITEMS, CAMPAIGN_STATUS_CONFIG } from "@/lib/constants";
import { Campaign, CampaignStatus } from "@/lib/types";
import { campaignService } from "@/lib/campaigns/campaign-service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Flag,
  Users,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Calendar,
  Building2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AdminCampaignsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
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

  const loadCampaigns = useCallback(async () => {
    if (user?.role !== "admin") return;
    setDataLoading(true);
    try {
      const items = await campaignService.getCampaigns();
      setCampaigns(items);
    } catch (err: any) {
      console.error("Failed to load campaigns", err);
      setFeedbackMsg({ type: "error", text: err.message || "Failed to load NGO campaigns." });
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadCampaigns();
    }
  }, [user, loadCampaigns]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  const activeCount = campaigns.filter((c) => c.status === "ACTIVE" || c.status === "PUBLISHED").length;
  const completedCount = campaigns.filter((c) => c.status === "COMPLETED").length;
  const totalVolunteers = campaigns.reduce((sum, c) => sum + c.registeredCount, 0);
  const totalTargetUnits = campaigns.reduce((sum, c) => sum + (c.targetUnits || 0), 0);

  const filteredCampaigns = campaigns.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        c.title.toLowerCase().includes(q) ||
        c.ngoName.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.venueName.toLowerCase().includes(q);
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
              <span className="p-2 rounded-xl bg-orange-50 text-orange-600">
                <Flag className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-slate-900">
                NGO Campaign Oversight & Blood Drives
              </h1>
            </div>
            <p className="text-sm text-slate-600">
              Review non-profit blood drives, track pledged volunteer registrations, and oversee community outreach events.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadCampaigns}
              disabled={dataLoading}
              className="gap-2 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin" : ""}`} />
              Refresh Drives
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
              <p className="text-xs font-medium text-slate-500">Total Campaigns</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{campaigns.length}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Active / Upcoming</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Volunteers Pledged</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{totalVolunteers}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Target Blood Units</p>
              <p className="text-2xl font-black text-purple-600 mt-1">{totalTargetUnits}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search title, NGO, city, venue..."
              aria-label="Search title, NGO, city, venue"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="admin-camp-status-filter" className="sr-only">Filter by Campaign Status</label>
            <select
              id="admin-camp-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active (Live)</option>
              <option value="PUBLISHED">Published (Upcoming)</option>
              <option value="COMPLETED">Completed</option>
              <option value="DRAFT">Draft</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Campaigns Grid */}
        {dataLoading ? (
          <div className="p-12 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-2" />
            <p className="text-sm font-medium text-slate-500">Loading blood drive campaigns...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
            <Flag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No campaigns match filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCampaigns.map((camp) => {
              const statusCfg = CAMPAIGN_STATUS_CONFIG[camp.status] || {
                label: camp.status,
                badgeVariant: "secondary" as const,
              };

              return (
                <Card key={camp.id} className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900 line-clamp-1">
                        {camp.title}
                      </CardTitle>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        {camp.ngoName}
                      </p>
                    </div>
                    <Badge variant={statusCfg.badgeVariant} className="text-[10px] shrink-0">
                      {statusCfg.label}
                    </Badge>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-3 text-xs">
                    <p className="text-slate-600 line-clamp-2">{camp.description}</p>

                    <div className="space-y-1 text-slate-600 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{camp.venueName}, {camp.city}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{camp.startDate} to {camp.endDate} ({camp.startTime} - {camp.endTime})</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-900">
                        <span className="text-[10px] text-blue-700 block">Pledged Donors</span>
                        <span className="font-bold text-base">{camp.registeredCount}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-900">
                        <span className="text-[10px] text-purple-700 block">Target Units</span>
                        <span className="font-bold text-base">{camp.targetUnits || "—"}</span>
                      </div>
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
