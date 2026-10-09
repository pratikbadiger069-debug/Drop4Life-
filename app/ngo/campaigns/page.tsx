"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { NGO_NAV_ITEMS, CAMPAIGN_STATUS_CONFIG } from "@/lib/constants";
import { Campaign, CampaignStatus } from "@/lib/types";
import { campaignService } from "@/lib/campaigns/campaign-service";
import { CampaignFormDialog } from "@/components/campaigns/campaign-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Flag,
  PlusCircle,
  Search,
  Calendar,
  MapPin,
  Users,
  Edit2,
  XCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export default function NgoCampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "ALL">("ALL");

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const loadCampaigns = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const list = await campaignService.getCampaigns({ ngoId: user.id });
      setCampaigns(list);
    } catch (err) {
      console.error("Failed to load campaigns", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchVenue = c.venueName.toLowerCase().includes(q);
        const matchCity = c.city.toLowerCase().includes(q);
        if (!matchTitle && !matchVenue && !matchCity) return false;
      }
      return true;
    });
  }, [campaigns, statusFilter, searchQuery]);

  const handleCreateNew = () => {
    setEditingCampaign(null);
    setIsFormOpen(true);
  };

  const handleEdit = (c: Campaign) => {
    setEditingCampaign(c);
    setIsFormOpen(true);
  };

  const handleCancelCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this campaign?")) return;
    await campaignService.cancelCampaign(id, "Cancelled by organizing NGO.");
    await loadCampaigns();
  };

  const handleCampaignSaved = () => {
    loadCampaigns();
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Flag className="w-5 h-5" />
                </span>
                <h1 className="text-2xl font-black text-slate-900">Campaign Management</h1>
              </div>
              <p className="text-xs text-slate-500">
                Organize blood drives, track registration counts, and update venue schedules.
              </p>
            </div>

            <Button
              onClick={handleCreateNew}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              New Campaign
            </Button>
          </div>

          {/* Search & Status Filters */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    placeholder="Search campaign title, venue, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:border-amber-500 focus:outline-none font-medium"
                    aria-label="Filter campaigns by status"
                  >
                    <option value="ALL">All Statuses ({campaigns.length})</option>
                    <option value="PUBLISHED">Published / Upcoming</option>
                    <option value="ACTIVE">Live Today</option>
                    <option value="DRAFT">Drafts</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table / List */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="text-center py-16 text-slate-400">
                <Clock className="w-8 h-8 animate-spin mx-auto mb-2 opacity-60" />
                <p className="text-xs">Loading campaign directory...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 p-6">
                <Flag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">No Campaigns Found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No campaigns match your filter parameters. Create a new campaign to mobilize community donors.
                </p>
                <Button size="sm" onClick={handleCreateNew} className="mt-4 bg-amber-600 text-white text-xs">
                  Create Campaign
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Campaign Title & Venue</th>
                      <th className="py-3 px-4">City & Area</th>
                      <th className="py-3 px-4">Dates & Times</th>
                      <th className="py-3 px-4">Goal & Capacity</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((c) => {
                      const statusCfg = CAMPAIGN_STATUS_CONFIG[c.status] || {
                        label: c.status,
                        badgeVariant: "default",
                      };

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Title & Venue */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">{c.title}</div>
                            <div className="text-slate-500 text-[11px] mt-0.5">{c.venueName}</div>
                          </td>

                          {/* City & Area */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{c.city}</span>
                            </div>
                            {c.area && <div className="text-[11px] text-slate-400 ml-4.5">{c.area}</div>}
                          </td>

                          {/* Dates */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{c.startDate} {c.startDate !== c.endDate ? `– ${c.endDate}` : ""}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 ml-4.5">{c.startTime} - {c.endTime}</div>
                          </td>

                          {/* Goal & Registrations */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900">
                              {c.registeredCount} {c.capacityLimit ? `/ ${c.capacityLimit}` : ""} registered
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Target: {c.targetUnits} units
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <Badge variant={statusCfg.badgeVariant as any}>{statusCfg.label}</Badge>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 px-2"
                                onClick={() => handleEdit(c)}
                              >
                                <Edit2 className="w-3 h-3 mr-1" />
                                Edit
                              </Button>

                              {c.status !== "CANCELLED" && c.status !== "COMPLETED" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleCancelCampaign(c.id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Dialog */}
        <CampaignFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          campaignToEdit={editingCampaign}
          onCampaignSaved={handleCampaignSaved}
          defaultCity={user?.city || "New York"}
        />
      </DashboardShell>
    </ProtectedRoute>
  );
}
