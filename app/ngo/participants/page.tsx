"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { NGO_NAV_ITEMS } from "@/lib/constants";
import { Campaign, CampaignParticipant } from "@/lib/types";
import { campaignService } from "@/lib/campaigns/campaign-service";
import { CampaignParticipantList } from "@/components/campaigns/campaign-participant-list";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, Clock, Flag, Filter } from "lucide-react";

export default function NgoParticipantsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("ALL");
  const [participants, setParticipants] = useState<CampaignParticipant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const campList = await campaignService.getCampaigns({ ngoId: user.id });
      setCampaigns(campList);

      // Load all participants for these campaigns
      const allParts: CampaignParticipant[] = [];
      for (const camp of campList) {
        const parts = await campaignService.getCampaignParticipants(camp.id);
        allParts.push(...parts);
      }
      setParticipants(allParts);
    } catch (err) {
      console.error("Failed to load participants", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const displayedParticipants =
    selectedCampaignId === "ALL"
      ? participants
      : participants.filter((p) => p.campaignId === selectedCampaignId);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  return (
    <ProtectedRoute allowedRoles={["ngo", "admin"]}>
      <DashboardShell
        role="ngo"
        userName={user?.fullName || "NGO Coordinator"}
        userEmail={user?.email || "ngo@drop4life.org"}
        navItems={NGO_NAV_ITEMS}
      >
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <Users className="w-5 h-5" />
                </span>
                <h1 className="text-2xl font-black text-slate-900">Volunteer Participant Rosters</h1>
              </div>
              <p className="text-xs text-slate-500">
                Review registered donors, community volunteers, and attendance rosters across your campaigns.
              </p>
            </div>

            {/* Campaign Select */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                Select Drive:
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium focus:border-amber-500 focus:outline-none max-w-xs truncate"
                aria-label="Filter participants by campaign"
              >
                <option value="ALL">All Campaigns ({campaigns.length})</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Participant Table */}
          {loading ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
              <Clock className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-2" />
              <p className="text-xs text-slate-500">Loading participant rosters...</p>
            </div>
          ) : (
            <CampaignParticipantList
              participants={displayedParticipants}
              capacityLimit={selectedCampaign?.capacityLimit}
            />
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
