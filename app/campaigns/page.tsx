"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { MOCK_PUBLIC_CAMPAIGNS, PublicCampaign } from "@/lib/mock-data";
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
} from "lucide-react";

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [activeModalCampaign, setActiveModalCampaign] = useState<PublicCampaign | null>(null);

  const filteredCampaigns = useMemo(() => {
    return MOCK_PUBLIC_CAMPAIGNS.filter((camp) => {
      if (
        searchQuery.trim() !== "" &&
        !camp.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) &&
        !camp.city.toLowerCase().includes(searchQuery.toLowerCase().trim()) &&
        !camp.organizerName.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ) {
        return false;
      }
      if (selectedStatus !== "ALL" && camp.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedStatus]);

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
                <span className="text-xs text-muted-foreground font-mono">Sample Drives (Phase 2)</span>
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
                  <option value="UPCOMING">Upcoming Drives</option>
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
              Simulated demonstration feed
            </span>
          </div>

          {filteredCampaigns.length === 0 ? (
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
                  className="flex flex-col justify-between border-slate-200 hover:border-amber-300 transition-all hover:shadow-md bg-white"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          camp.status === "ACTIVE"
                            ? "success"
                            : camp.status === "UPCOMING"
                            ? "warning"
                            : "secondary"
                        }
                        dot={camp.status === "ACTIVE"}
                      >
                        {camp.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">
                        {camp.organizerType}
                      </span>
                    </div>

                    <CardTitle className="text-lg font-bold text-slate-900 mt-2 leading-snug">
                      {camp.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Organized by <strong>{camp.organizerName}</strong>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs text-slate-600 py-2">
                    <p className="line-clamp-2 text-slate-600 leading-relaxed">
                      {camp.description}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-red-700 shrink-0" />
                        <span className="font-medium">{camp.startDate} – {camp.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-red-700 shrink-0" />
                        <span>{camp.locationAddress}, {camp.city}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Target: {camp.targetUnits} Units</span>
                        <span>{camp.registeredDonors} Registered ({Math.round((camp.registeredDonors / camp.targetUnits) * 100)}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((camp.registeredDonors / camp.targetUnits) * 100)
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
                    <Link href="/register/donor" className="w-full">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs font-bold"
                      >
                        Pledge / RSVP
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* NGO HOST CALLOUT */}
          <div className="mt-16 rounded-2xl border border-amber-200 bg-amber-50/50 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
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

            <Link href="/contact">
              <Button variant="default" className="font-bold shrink-0">
                Partner as an NGO
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
          description={`Organized by ${activeModalCampaign.organizerName} (${activeModalCampaign.organizerType})`}
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModalCampaign(null)}
              >
                Close
              </Button>
              <Link href="/register/donor">
                <Button variant="default" size="sm" className="font-bold">
                  Sign In to RSVP
                </Button>
              </Link>
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
                <span className="font-semibold text-slate-900">{activeModalCampaign.startDate} – {activeModalCampaign.endDate}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Venue Address:</span>
                <span className="font-semibold text-slate-900">{activeModalCampaign.locationAddress}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">City / Region:</span>
                <span className="font-semibold text-slate-900">{activeModalCampaign.city}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Target Donations:</span>
                <span className="font-bold text-primary">{activeModalCampaign.targetUnits} Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registered Volunteers:</span>
                <span className="font-bold text-emerald-700">{activeModalCampaign.registeredDonors} Participants</span>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-[11px] text-amber-900 border border-amber-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Volunteer Note:</strong> Please bring a valid government photo ID and ensure adequate hydration prior to donation.
              </span>
            </div>
          </div>
        </Dialog>
      )}

      <Footer />
    </div>
  );
}
