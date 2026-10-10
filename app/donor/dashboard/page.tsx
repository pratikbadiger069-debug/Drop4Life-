"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { DONOR_NAV_ITEMS, APP_CONFIG } from "@/lib/constants";
import { DonorProfile, DonationRecord } from "@/lib/types";
import { donorService } from "@/lib/donor/donor-service";
import { AvailabilityToggle } from "@/components/donor/availability-toggle";
import { ProfileCompletionBar } from "@/components/donor/profile-completion-bar";
import { RecentDonationsWidget } from "@/components/donor/recent-donations-widget";
import { LogDonationDialog } from "@/components/donor/log-donation-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DonorRewardsCard } from "@/components/donor/donor-rewards-card";
import { DonorAppointmentsCard } from "@/components/donor/donor-appointments-card";
import { MedicalPrescreeningDialog } from "@/components/screening/medical-prescreening-dialog";
import { medicalScreeningService } from "@/lib/screening/screening-service";
import { MedicalPreScreeningResponse } from "@/lib/types";
import {
  Heart,
  Droplet,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  ArrowRight,
  PlusCircle,
  AlertTriangle,
  Stethoscope,
  Award,
  ShieldAlert,
} from "lucide-react";

export default function DonorDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [records, setRecords] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [isScreeningModalOpen, setIsScreeningModalOpen] = useState<boolean>(false);
  const [screening, setScreening] = useState<MedicalPreScreeningResponse | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const currentUserId = user.id;
    let isMounted = true;

    async function loadData() {
      try {
        const [p, r] = await Promise.all([
          donorService.getDonorProfile(currentUserId),
          donorService.getDonationHistory(currentUserId),
        ]);
        const scr = medicalScreeningService.getLatestScreening(currentUserId);
        if (isMounted) {
          setProfile(p);
          setRecords(r);
          setScreening(scr);
        }
      } catch (err) {
        console.error("Failed to load donor profile data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleRecordCreated = (newRecord: DonationRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
    if (user?.id) {
      donorService.getDonorProfile(user.id).then((updated) => setProfile(updated));
    }
  };

  // Eligibility calculation helper (56-day standard rest interval)
  const getEligibilityInfo = () => {
    if (!profile?.lastDonatedAt) {
      return { isEligible: true, message: "Eligible to donate now", daysRemaining: 0 };
    }
    const lastDate = new Date(profile.lastDonatedAt).getTime();
    const nextEligibleDate = new Date(lastDate + 56 * 24 * 60 * 60 * 1000);
    const now = Date.now();
    const diffDays = Math.ceil((nextEligibleDate.getTime() - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { isEligible: true, message: "Eligible to donate now", daysRemaining: 0 };
    }
    return {
      isEligible: false,
      message: `Next eligible in ~${diffDays} days (${nextEligibleDate.toISOString().split("T")[0]})`,
      daysRemaining: diffDays,
    };
  };

  const eligibility = getEligibilityInfo();
  const verifiedDonationsCount = records.filter((r) => r.recordStatus === "VERIFIED").length;

  return (
    <ProtectedRoute allowedRoles={["donor"]}>
      <DashboardShell
        role="donor"
        userName={profile?.fullName || user?.fullName || "Donor Member"}
        userEmail={profile?.email || user?.email || "donor@drop4life.org"}
        navItems={DONOR_NAV_ITEMS}
      >
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="blush">Donor Portal (Phase 5 Active)</Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  Blood Group: <strong>{profile?.bloodGroup || user?.bloodGroup || "O-"}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Welcome back, {profile?.fullName || user?.fullName || "Rahul Kumar"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Track your voluntary donation milestones, manage emergency contact availability, and stay ready to save lives.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={screening ? "outline" : "default"}
                size="sm"
                onClick={() => setIsScreeningModalOpen(true)}
                className="text-xs font-bold gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{screening ? "Medical Pre-Screening: Active" : "Complete Medical Pre-Screening"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLogModalOpen(true)}
                className="text-xs font-semibold gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Log Donation</span>
              </Button>
              <Link href="/donor/requests">
                <Button size="sm" variant="destructive" className="font-bold text-xs gap-1.5 shadow-xs">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>SOS Requisitions</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Core Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Blood Group */}
            <Card className="border-red-100 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-red-100 text-primary flex items-center justify-center font-black text-lg border border-red-200 shadow-xs">
                  {profile?.bloodGroup || user?.bloodGroup || "O-"}
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Blood Type</p>
                  <p className="text-sm font-extrabold text-slate-900">
                    Type {profile?.bloodGroup || user?.bloodGroup || "O-"}
                  </p>
                  <Link href="/blood-compatibility" className="text-[10px] text-red-700 hover:underline">
                    View Compatibility →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Availability State */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Availability</p>
                  <p className="text-sm font-bold text-slate-900">
                    {profile?.availabilityStatus === "AVAILABLE"
                      ? "Ready for Contact"
                      : profile?.availabilityStatus === "TEMPORARILY_UNAVAILABLE"
                      ? "Paused / Rest"
                      : "Do Not Contact"}
                  </p>
                  <Link href="/donor/profile" className="text-[10px] text-slate-500 hover:underline">
                    Edit Preferences →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Total Donations */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                  <Heart className="w-6 h-6 text-red-600 fill-current" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Total Donations</p>
                  <p className="text-sm font-extrabold text-slate-900">
                    {records.length} Event{records.length === 1 ? "" : "s"} ({verifiedDonationsCount} Verified)
                  </p>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    {verifiedDonationsCount * 3} Potential Lives Impacted
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Eligibility Window */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Rest Interval</p>
                  <p className="text-xs font-bold text-slate-900">
                    {eligibility.message}
                  </p>
                  <span className="text-[10px] text-slate-400">Standard 56-day cycle</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Completion Bar */}
          {profile && (
            <ProfileCompletionBar profile={profile} showChecklist={true} />
          )}

          {/* Blood Availability Switcher Card */}
          {user && profile && (
            <AvailabilityToggle
              userId={user.id}
              currentStatus={profile.availabilityStatus}
              preferredLocation={profile.preferredLocation}
              preferredContactMethod={profile.preferredContactMethod}
              notes={profile.availabilityNotes}
              onStatusUpdated={(newStatus) => {
                setProfile((prev) => prev ? { ...prev, availabilityStatus: newStatus } : null);
              }}
            />
          )}

          {/* Donor Rewards & Lifesaver Milestones */}
          {user && (
            <DonorRewardsCard userId={user.id} />
          )}

          {/* Donation Appointments & Scheduled Slots */}
          {user && (
            <DonorAppointmentsCard userId={user.id} />
          )}

          {/* Recent Donation Records List */}
          <RecentDonationsWidget
            records={records}
            onOpenLogModal={() => setIsLogModalOpen(true)}
          />

          {/* Clinical Non-Eligibility Disclaimer Notice */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-amber-950">Medical & Eligibility Disclaimer:</strong>
              <p>
                Profile information and self-reported availability indicate voluntary interest and contact readiness. Official medical clearance, hemoglobin screening, and pre-transfusion testing are conducted on-site by certified clinical personnel at every donation session.
              </p>
            </div>
          </div>
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

        {/* Modal: Medical Eligibility Pre-Screening */}
        {user && (
          <MedicalPrescreeningDialog
            isOpen={isScreeningModalOpen}
            onClose={() => setIsScreeningModalOpen(false)}
            donorId={user.id}
            onSuccess={(result) => {
              setScreening(result);
            }}
          />
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
