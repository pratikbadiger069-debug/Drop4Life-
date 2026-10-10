"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FacilityFinder } from "@/components/location/facility-finder";
import {
  ALL_BLOOD_GROUPS,
  PRIORITY_CONFIG,
  APP_CONFIG,
} from "@/lib/constants";
import {
  MOCK_PUBLIC_REQUESTS,
  PublicBloodRequest,
} from "@/lib/mock-data";
import {
  Search,
  MapPin,
  Clock,
  Activity,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Filter,
  RefreshCw,
  Map,
  Compass,
  ArrowRight,
  Heart,
} from "lucide-react";

export default function FindBloodPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [activeModalRequest, setActiveModalRequest] = useState<PublicBloodRequest | null>(null);

  // Filter computation
  const filteredRequests = useMemo(() => {
    return MOCK_PUBLIC_REQUESTS.filter((req) => {
      // Blood Group filter
      if (selectedGroup !== "ALL" && req.bloodGroup !== selectedGroup) {
        return false;
      }
      // Location text filter
      if (
        locationSearch.trim() !== "" &&
        !req.city.toLowerCase().includes(locationSearch.toLowerCase().trim()) &&
        !req.hospitalName.toLowerCase().includes(locationSearch.toLowerCase().trim())
      ) {
        return false;
      }
      // Priority filter
      if (selectedPriority !== "ALL" && req.priority !== selectedPriority) {
        return false;
      }
      // Status filter
      if (selectedStatus !== "ALL" && req.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [selectedGroup, locationSearch, selectedPriority, selectedStatus]);

  const handleResetFilters = () => {
    setSelectedGroup("ALL");
    setLocationSearch("");
    setSelectedPriority("ALL");
    setSelectedStatus("ALL");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* Page Hero */}
        <section className="bg-white border-b border-slate-200 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2">
                <Badge variant="destructive" dot>Live Requisitions</Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  Sample Data Feeds (Phase 2)
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Find Urgent Blood Requisitions
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Search verified hospital blood demands by blood type, city location, and urgency priority. Not sure if you can donate? Check our{" "}
                <Link href="/blood-compatibility" className="text-red-700 font-semibold hover:underline inline-flex items-center gap-0.5">
                  Blood Compatibility Guide <ArrowRight className="w-3.5 h-3.5 inline" />
                </Link>
                .
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link href="/request-blood">
                  <Button size="sm" variant="default" className="font-bold text-xs gap-1.5 shadow-xs">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>Need Blood? Submit Request Form</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link href="/blood-compatibility">
                  <Button size="sm" variant="outline" className="font-semibold text-xs gap-1.5 bg-white">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    <span>Compatibility Checker</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH & FILTERS BAR */}
        <section className="sticky top-16 z-20 bg-white/95 backdrop-blur border-b border-slate-200 py-4 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              {/* Blood Group Filter */}
              <div>
                <label htmlFor="blood-group-select" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  id="blood-group-select"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">All Blood Types</option>
                  {ALL_BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      Type {group}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Input */}
              <div>
                <label htmlFor="location-search-input" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  City or Hospital
                </label>
                <div className="relative">
                  <input
                    id="location-search-input"
                    type="text"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    placeholder="e.g. Hyderabad, Bengaluru, Mumbai..."
                    className="h-9 w-full rounded-md border border-input bg-background px-3 pr-8 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label htmlFor="priority-select" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Urgency Priority
                </label>
                <select
                  id="priority-select"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">All Urgency Levels</option>
                  <option value="CRITICAL">Critical (&lt; 1 hr)</option>
                  <option value="EMERGENCY">Emergency (&lt; 4 hrs)</option>
                  <option value="URGENT">Urgent (&lt; 24 hrs)</option>
                  <option value="NORMAL">Normal / Scheduled</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="status-select" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Request Status
                </label>
                <select
                  id="status-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">Open (Needs Donors)</option>
                  <option value="MATCHING">Matching in Progress</option>
                  <option value="RESPONSES_RECEIVED">Responses Received</option>
                </select>
              </div>

              {/* Reset Button */}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="w-full h-9 gap-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* RESULTS SECTION */}
        <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Privacy & Clinical Notice */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600">
                <strong className="text-slate-900 block">Privacy Guarantee:</strong>
                Donor names, phone numbers, and private home addresses are completely confidential and never visible on public searches.
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <strong className="block font-semibold">Clinical Transfusion Notice:</strong>
                All blood donations undergo standard hospital pre-transfusion laboratory crossmatching.
              </div>
            </div>
          </div>

          {/* Results Counter */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Showing {filteredRequests.length} Active Blood Request{filteredRequests.length === 1 ? "" : "s"}
            </p>
            <span className="text-xs text-muted-foreground">
              Simulated demonstration feed
            </span>
          </div>

          {/* Grid of Request Cards or Empty State */}
          {filteredRequests.length === 0 ? (
            <EmptyState
              icon={<Search className="h-6 w-6 text-slate-400" />}
              title="No Blood Requests Found"
              description="No active emergency requests match your current search filters. Try adjusting your blood group or city filters."
              actionLabel="Clear All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((req) => {
                const priorityData = PRIORITY_CONFIG[req.priority];
                return (
                  <Card
                    key={req.id}
                    className="flex flex-col justify-between border-slate-200 hover:border-red-200 transition-all hover:shadow-md bg-white"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={priorityData.badgeVariant} dot>
                          {req.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {req.createdAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 pt-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 border border-red-200 text-primary font-black text-lg shadow-xs">
                          {req.bloodGroup}
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-slate-900 leading-tight">
                            {req.hospitalName}
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            {req.department}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2 text-xs text-slate-600 py-2">
                      <div className="flex items-center justify-between py-1 border-y border-slate-100">
                        <span className="text-slate-500">Units Required:</span>
                        <span className="font-bold text-slate-900">{req.unitsNeeded} Whole Blood Units</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          Location:
                        </span>
                        <span className="font-medium text-slate-800">{req.city}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-t border-slate-100">
                        <span className="text-slate-500">Status:</span>
                        <Badge variant="outline" className="text-[10px]">
                          {req.status}
                        </Badge>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-3 border-t flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-semibold"
                        onClick={() => setActiveModalRequest(req)}
                      >
                        View Details
                      </Button>
                      <Link href="/register/donor" className="w-full">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full text-xs font-bold"
                        >
                          Respond
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          {/* INTERACTIVE LOCATION DISCOVERY & FACILITY DIRECTORY */}
          <div className="mt-14 space-y-4">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <Badge variant="default">Interactive Discovery</Badge>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Participating Blood Banks & Transfusion Pavilions
              </h2>
              <p className="text-xs text-slate-600">
                Locate verified hospital trauma units, blood banks, and donation venues on the interactive map with live distance calculations.
              </p>
            </div>

            <FacilityFinder defaultView="map" />
          </div>
        </section>
      </main>

      {/* REQUEST DETAILS DIALOG */}
      {activeModalRequest && (
        <Dialog
          isOpen={true}
          onClose={() => setActiveModalRequest(null)}
          title={`Blood Requisition Details — ${activeModalRequest.bloodGroup}`}
          description={`Issued by ${activeModalRequest.hospitalName}`}
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModalRequest(null)}
              >
                Close
              </Button>
              <Link href="/register/donor">
                <Button variant="default" size="sm" className="font-bold">
                  Sign In to Respond
                </Button>
              </Link>
            </>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="rounded-lg bg-red-50 p-4 border border-red-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-primary block uppercase">Required Blood Group</span>
                <span className="text-2xl font-black text-red-900">{activeModalRequest.bloodGroup}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-600 block uppercase">Units Needed</span>
                <span className="text-2xl font-black text-slate-900">{activeModalRequest.unitsNeeded} Units</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Hospital Facility:</span>
                <span className="font-bold">{activeModalRequest.hospitalName}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Medical Department:</span>
                <span className="font-medium">{activeModalRequest.department}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Region / City:</span>
                <span className="font-medium">{activeModalRequest.city}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Urgency Category:</span>
                <span className="font-bold text-primary">{activeModalRequest.priority}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Reported Time:</span>
                <span className="font-medium">{activeModalRequest.createdAt}</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-100 p-3 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">How to Fulfill:</p>
              <p>
                Registered voluntary donors with compatible red blood cell typing can accept this invitation directly from their Donor Portal.
              </p>
            </div>
          </div>
        </Dialog>
      )}

      <Footer />
    </div>
  );
}
