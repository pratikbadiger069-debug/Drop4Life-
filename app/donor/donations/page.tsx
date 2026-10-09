"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { DONOR_NAV_ITEMS } from "@/lib/constants";
import { DonationRecord, DonorProfile } from "@/lib/types";
import { donorService } from "@/lib/donor/donor-service";
import { LogDonationDialog } from "@/components/donor/log-donation-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  History,
  CheckCircle2,
  Clock,
  PlusCircle,
  FileText,
  Heart,
  Droplet,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DonorDonationsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [records, setRecords] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "VERIFIED" | "SELF_REPORTED">("ALL");
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.id) return;
    const currentUserId = user.id;
    let isMounted = true;

    async function loadDonations() {
      try {
        const [p, recs] = await Promise.all([
          donorService.getDonorProfile(currentUserId),
          donorService.getDonationHistory(currentUserId),
        ]);
        if (isMounted) {
          setProfile(p);
          setRecords(recs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDonations();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleRecordCreated = (newRecord: DonationRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
  };

  const filteredRecords = useMemo(() => {
    if (activeFilter === "ALL") return records;
    return records.filter((r) => r.recordStatus === activeFilter);
  }, [records, activeFilter]);

  const verifiedCount = records.filter((r) => r.recordStatus === "VERIFIED").length;
  const selfReportedCount = records.filter((r) => r.recordStatus === "SELF_REPORTED").length;
  const totalUnits = records.reduce((sum, r) => sum + (r.units || 1), 0);

  return (
    <ProtectedRoute allowedRoles={["donor"]}>
      <DashboardShell
        role="donor"
        userName={profile?.fullName || user?.fullName || "Donor Member"}
        userEmail={profile?.email || user?.email || "donor@drop4life.org"}
        navItems={DONOR_NAV_ITEMS}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="blush">Donation Activity Log</Badge>
                <span className="text-xs text-slate-500 font-mono">
                  {records.length} Recorded Milestone{records.length === 1 ? "" : "s"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                My Blood Donation History
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                A verified record of your voluntary blood donations, certificates, and community impact.
              </p>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => setIsLogModalOpen(true)}
              className="font-bold text-xs gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log a Donation</span>
            </Button>
          </div>

          {/* Metrics Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-100 text-primary">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold">Total Events</p>
                  <p className="text-lg font-black text-slate-900">{records.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold">Hospital Verified</p>
                  <p className="text-lg font-black text-emerald-700">{verifiedCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold">Total Units</p>
                  <p className="text-lg font-black text-slate-900">{totalUnits} Units</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold">Est. Lives Saved</p>
                  <p className="text-lg font-black text-purple-900">~{verifiedCount * 3}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Records Table Card */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Donation Records Log
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Hospital-verified records are confirmed directly through authorized Drop4Life blood banks.
                  </CardDescription>
                </div>

                {/* Filter Switcher */}
                <div className="flex items-center bg-slate-200/80 p-1 rounded-lg text-xs font-semibold self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setActiveFilter("ALL")}
                    className={cn(
                      "px-3 py-1.5 rounded-md transition-all",
                      activeFilter === "ALL"
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    All ({records.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("VERIFIED")}
                    className={cn(
                      "px-3 py-1.5 rounded-md transition-all",
                      activeFilter === "VERIFIED"
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    Verified ({verifiedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("SELF_REPORTED")}
                    className={cn(
                      "px-3 py-1.5 rounded-md transition-all",
                      activeFilter === "SELF_REPORTED"
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    Self-Reported ({selfReportedCount})
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredRecords.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-400">
                    <History className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-800">
                    No records found for this filter
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {activeFilter === "ALL"
                      ? "You have not recorded any donations yet. Click 'Log a Donation' to register your past blood donation milestones."
                      : `No ${activeFilter.toLowerCase().replace("_", " ")} donation records exist.`}
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsLogModalOpen(true)}
                    className="text-xs font-bold"
                  >
                    Log a Donation Event
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm" aria-label="Donation History Table">
                    <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-700 tracking-wider">
                      <tr>
                        <th scope="col" className="px-4 py-3 border-b border-slate-200">
                          Date & Facility
                        </th>
                        <th scope="col" className="px-4 py-3 border-b border-slate-200">
                          Blood Type & Units
                        </th>
                        <th scope="col" className="px-4 py-3 border-b border-slate-200">
                          Verification Status
                        </th>
                        <th scope="col" className="px-4 py-3 border-b border-slate-200 hidden md:table-cell">
                          Certificate Ref & Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredRecords.map((rec) => {
                        const isVerified = rec.recordStatus === "VERIFIED";
                        return (
                          <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-900 block text-sm">
                                  {rec.facilityName}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    {rec.donationDate}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {rec.facilityCity}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-red-50 text-red-800 font-extrabold text-xs border border-red-100">
                                  {rec.bloodGroup}
                                </span>
                                <div>
                                  <span className="font-semibold text-slate-800 block text-xs">
                                    {rec.units} Unit{rec.units === 1 ? "" : "s"} ({rec.donationType.replace("_", " ")})
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              {isVerified ? (
                                <Badge variant="success" className="text-xs font-bold gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Hospital Verified
                                </Badge>
                              ) : rec.recordStatus === "PENDING_REVIEW" ? (
                                <Badge variant="warning" className="text-xs font-bold">
                                  Pending Verification
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs font-medium text-slate-700 bg-slate-100">
                                  Self-Reported
                                </Badge>
                              )}
                            </td>

                            <td className="px-4 py-3.5 text-xs text-slate-600 hidden md:table-cell">
                              <div className="space-y-0.5">
                                {rec.referenceNumber && (
                                  <span className="font-mono text-[11px] text-slate-500 block">
                                    Ref: {rec.referenceNumber}
                                  </span>
                                )}
                                {rec.notes && (
                                  <span className="text-slate-600 line-clamp-1 italic">
                                    &ldquo;{rec.notes}&rdquo;
                                  </span>
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
            </CardContent>
          </Card>
        </div>

        {/* Modal: Log Donation */}
        {user && profile && (
          <LogDonationDialog
            isOpen={isLogModalOpen}
            onClose={() => setIsLogModalOpen(false)}
            userId={user.id}
            defaultBloodGroup={profile.bloodGroup}
            defaultCity={profile.city}
            onRecordCreated={handleRecordCreated}
          />
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
