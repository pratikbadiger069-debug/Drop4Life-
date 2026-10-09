"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { NGO_NAV_ITEMS, CAMPAIGN_STATUS_CONFIG } from "@/lib/constants";
import { Campaign, NGOProfile } from "@/lib/types";
import { campaignService } from "@/lib/campaigns/campaign-service";
import { CampaignFormDialog } from "@/components/campaigns/campaign-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Building2,
  Calendar,
  Users,
  Flag,
  Sparkles,
  PlusCircle,
  MapPin,
  Clock,
  CheckCircle2,
  Heart,
  Droplet,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function NgoDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<NGOProfile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const loadData = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [prof, list] = await Promise.all([
        campaignService.getNgoProfile(user.id),
        campaignService.getCampaigns({ ngoId: user.id }),
      ]);
      setProfile(prof);
      setCampaigns(list);
    } catch (err) {
      console.error("Failed to load NGO dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE" || c.status === "PUBLISHED");
  const totalTargetUnits = campaigns.reduce((sum, c) => sum + c.targetUnits, 0);
  const totalRegistrations = campaigns.reduce((sum, c) => sum + c.registeredCount, 0);
  const totalCollectedUnits = campaigns.reduce((sum, c) => sum + (c.collectedUnits || 0), 0);

  const handleCampaignSaved = (saved: Campaign) => {
    loadData();
  };

  return (
    <ProtectedRoute allowedRoles={["ngo", "admin"]}>
      <DashboardShell
        role="ngo"
        userName={user?.fullName || "NGO Coordinator"}
        userEmail={user?.email || "ngo@drop4life.org"}
        navItems={NGO_NAV_ITEMS}
      >
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{profile?.organizationName || user?.organizationName || "NGO Coordinator"}</span>
                </span>
                {profile?.isVerified && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Organization</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Campaign & Blood Drive Command
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
                Mobilize community blood drives, manage participant capacity, and publish public donation campaigns.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Create Campaign
              </Button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-xs">
              <CardContent className="p-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Drives
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {activeCampaigns.length}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">Live or upcoming drives</span>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/40 shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Total Registrations
                  </span>
                  <Users className="w-4 h-4 text-amber-700" />
                </div>
                <div className="text-2xl font-black text-amber-900 mt-1">
                  {totalRegistrations}
                </div>
                <span className="text-xs text-amber-700/80 mt-1 block">Pledged volunteers</span>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/40 shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                    Target Collection
                  </span>
                  <Droplet className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-2xl font-black text-red-700 mt-1">
                  {totalTargetUnits}
                </div>
                <span className="text-xs text-red-600/80 mt-1 block">Units planned</span>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/40 shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Units Collected
                  </span>
                  <Heart className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-800 mt-1">
                  {totalCollectedUnits}
                </div>
                <span className="text-xs text-emerald-600/80 mt-1 block">Verified intake</span>
              </CardContent>
            </Card>
          </div>

          {/* Active Campaigns Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-amber-700" />
                Organization Campaigns ({campaigns.length})
              </h3>
              <Link
                href="/ngo/campaigns"
                className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
              >
                <span>Manage All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
                <Clock className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading campaigns...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <Card className="border-slate-200 text-center py-12 p-6">
                <Flag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800">No Campaigns Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Get started by creating and publishing your first community blood drive.
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  Create First Campaign
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((camp) => {
                  const statusCfg = CAMPAIGN_STATUS_CONFIG[camp.status] || {
                    label: camp.status,
                    badgeVariant: "default",
                  };

                  return (
                    <Card
                      key={camp.id}
                      className="border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
                    >
                      <CardHeader className="pb-3 border-b border-slate-100">
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant={statusCfg.badgeVariant as any} className="text-[10px]">
                            {statusCfg.label}
                          </Badge>
                          <span className="text-[11px] font-mono text-slate-500">
                            Goal: {camp.targetUnits} units
                          </span>
                        </div>
                        <CardTitle className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
                          {camp.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-4 space-y-2 text-xs text-slate-600 flex-1">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            {camp.venueName}, {camp.city}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>
                            {camp.startDate} {camp.startDate !== camp.endDate ? `– ${camp.endDate}` : ""}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-500">Registrations:</span>
                          <span className="font-bold text-slate-800">
                            {camp.registeredCount} {camp.capacityLimit ? `/ ${camp.capacityLimit}` : ""}
                          </span>
                        </div>
                      </CardContent>

                      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <Link
                          href="/ngo/campaigns"
                          className="text-xs font-bold text-amber-800 hover:text-amber-900"
                        >
                          View Details &rarr;
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Create Campaign Dialog */}
        <CampaignFormDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onCampaignSaved={handleCampaignSaved}
          defaultCity={user?.city || "Bengaluru"}
        />
      </DashboardShell>
    </ProtectedRoute>
  );
}
