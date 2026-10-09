"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Campaign } from "@/lib/types";
import { campaignService } from "@/lib/campaigns/campaign-service";
import { CampaignRegistrationDialog } from "@/components/campaigns/campaign-registration-dialog";
import {
  Search,
  Calendar,
  MapPin,
  Building2,
  Users,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [activeModalCampaign, setActiveModalCampaign] = useState<Campaign | null>(null);
  const [registeringCampaign, setRegisteringCampaign] = useState<Campaign | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await campaignService.getCampaigns({ excludeDrafts: true });
      setCampaigns(data);
    } catch (err) {
      console.error("Failed to load campaigns", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((camp) => {
      if (
        searchQuery.trim() !== "" &&
        !camp.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) &&
        !camp.city.toLowerCase().includes(searchQuery.toLowerCase().trim()) &&
        !camp.ngoName.toLowerCase().includes(searchQuery.toLowerCase().trim()) &&
        !camp.venueName.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ) {
        return false;
      }
      if (selectedStatus !== "ALL" && camp.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [campaigns, searchQuery, selectedStatus]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* Hero Header */}
        <section className="bg-white border-b border-slate-200 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2">
                <Badge variant="warning">Community Mobilization</Badge>
                <span className="text-xs text-muted-foreground font-mono">Public Donation Drives</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Public Blood Donation Campaigns
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Discover and RSVP for community blood drives organized by certified NGOs, regional blood banks, and partner hospital auxiliaries.
              </p>
            </div>
          </div>
        </section>

        {/* SEARCH & FILTERS BAR */}
        <section className="sticky top-16 z-20 bg-white/95 backdrop-blur border-b border-slate-200 py-4 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex-1 w-full sm:max-w-md relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by drive title, city, or NGO name..."
                  className="h-9 w-full rounded-md border border-input bg-background px-3 pr-8 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:ring-2 focus:ring-primary w-full sm:w-44"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active (Ongoing)</option>
                  <option value="PUBLISHED">Upcoming / Published</option>
                  <option value="COMPLETED">Past Completed</option>
                </select>

                {(searchQuery || selectedStatus !== "ALL") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="h-9 gap-1 text-xs shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CAMPAIGN LIST SECTION */}
        <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Showing {filteredCampaigns.length} Campaign{filteredCampaigns.length === 1 ? "" : "s"}
            </p>
            <span className="text-xs text-muted-foreground">
              Live Verified Campaigns
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">Loading community campaigns...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-6 w-6 text-slate-400" />}
              title="No Campaigns Found"
              description="No community blood donation campaigns match your search query or status filter."
              actionLabel="Reset Search"
              onAction={handleReset}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((camp) => (
                <Card
                  key={camp.id}
                  className="flex flex-col justify-between border-slate-200 hover:border-red-300 transition-all hover:shadow-md bg-white"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          camp.status === "ACTIVE"
                            ? "success"
                            : camp.status === "PUBLISHED"
                            ? "warning"
                            : camp.status === "COMPLETED"
                            ? "secondary"
                            : "destructive"
                        }
                        dot={camp.status === "ACTIVE"}
                      >
                        {camp.status}
                      </Badge>
                      {camp.isVerifiedOrg && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-200">
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          Verified NGO
                        </span>
                      )}
                    </div>

                    <CardTitle className="text-lg font-bold text-slate-900 mt-2 leading-snug">
                      {camp.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Organized by <strong>{camp.ngoName}</strong>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs text-slate-600 py-2">
                    <p className="line-clamp-2 text-slate-600 leading-relaxed">
                      {camp.description}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-red-700 shrink-0" />
                        <span className="font-medium">
                          {camp.startDate} {camp.startDate !== camp.endDate ? `– ${camp.endDate}` : ""} ({camp.startTime} - {camp.endTime})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-red-700 shrink-0" />
                        <span className="truncate">{camp.venueName}, {camp.city}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Target: {camp.targetUnits} Units</span>
                        <span>{camp.registeredCount} Registered ({Math.round((camp.registeredCount / camp.targetUnits) * 100)}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-red-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((camp.registeredCount / camp.targetUnits) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-3 border-t flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold"
                      onClick={() => setActiveModalCampaign(camp)}
                    >
                      Drive Details
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full text-xs font-bold bg-red-700 hover:bg-red-800 text-white"
                      disabled={camp.status === "CANCELLED" || camp.status === "COMPLETED"}
                      onClick={() => setRegisteringCampaign(camp)}
                    >
                      <Heart className="w-3.5 h-3.5 mr-1 fill-white" />
                      Pledge / RSVP
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* NGO HOST CALLOUT */}
          <div className="mt-16 rounded-2xl border border-red-200 bg-red-50/50 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                <Building2 className="w-4 h-4" />
                <span>Are you an NGO or Community Organizer?</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Host and Coordinate Your Blood Drive on Drop4Life
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connect directly with regional partner hospitals, manage volunteer rosters, and track unit yield in Phase 8 NGO coordination tools.
              </p>
            </div>

            <Link href="/ngo/dashboard">
              <Button variant="default" className="font-bold shrink-0 bg-red-700 hover:bg-red-800 text-white">
                NGO Dashboard Portal
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* CAMPAIGN DETAILS MODAL */}
      {activeModalCampaign && (
        <Dialog
          isOpen={true}
          onClose={() => setActiveModalCampaign(null)}
          title={activeModalCampaign.title}
          description={`Organized by ${activeModalCampaign.ngoName}`}
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModalCampaign(null)}
              >
                Close
              </Button>
              <Button
                variant="default"
                size="sm"
                className="font-bold bg-red-700 hover:bg-red-800 text-white"
                disabled={activeModalCampaign.status === "CANCELLED" || activeModalCampaign.status === "COMPLETED"}
                onClick={() => {
                  const target = activeModalCampaign;
                  setActiveModalCampaign(null);
                  setRegisteringCampaign(target);
                }}
              >
                <Heart className="w-3.5 h-3.5 mr-1 fill-white" />
                Pledge / RSVP
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-sm">
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeModalCampaign.description}
            </p>

            <div className="rounded-lg bg-slate-50 p-3 space-y-2 text-xs border border-slate-200">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-semibold text-slate-900">
                  {activeModalCampaign.startDate} {activeModalCampaign.startDate !== activeModalCampaign.endDate ? `– ${activeModalCampaign.endDate}` : ""} ({activeModalCampaign.startTime} - {activeModalCampaign.endTime})
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Venue Address:</span>
                <span className="font-semibold text-slate-900">{activeModalCampaign.venueName}, {activeModalCampaign.address}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">City / Region:</span>
                <span className="font-semibold text-slate-900">{activeModalCampaign.city}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Target Donations:</span>
                <span className="font-bold text-red-700">{activeModalCampaign.targetUnits} Units</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Registered Participants:</span>
                <span className="font-bold text-emerald-700">
                  {activeModalCampaign.registeredCount} {activeModalCampaign.capacityLimit ? `/ ${activeModalCampaign.capacityLimit}` : ""} Participants
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Organizer:</span>
                <span className="font-medium text-slate-700">{activeModalCampaign.contactPhone} • {activeModalCampaign.contactEmail}</span>
              </div>
            </div>

            {activeModalCampaign.registrationInstructions && (
              <div className="rounded-lg bg-amber-50 p-3 text-[11px] text-amber-900 border border-amber-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Instructions:</strong> {activeModalCampaign.registrationInstructions}
                </span>
              </div>
            )}
          </div>
        </Dialog>
      )}

      {/* REGISTRATION DIALOG */}
      <CampaignRegistrationDialog
        campaign={registeringCampaign}
        open={!!registeringCampaign}
        onOpenChange={(open) => {
          if (!open) setRegisteringCampaign(null);
        }}
        onRegisteredSuccess={() => {
          fetchCampaigns();
        }}
      />

      <Footer />
    </div>
  );
}

