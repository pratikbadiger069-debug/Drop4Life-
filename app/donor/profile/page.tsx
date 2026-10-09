"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { DONOR_NAV_ITEMS, ALL_BLOOD_GROUPS } from "@/lib/constants";
import { DonorProfile, BloodGroup, PreferredContactMethod, DonorAvailabilityStatus } from "@/lib/types";
import { donorService, calculateProfileCompletion } from "@/lib/donor/donor-service";
import { isValidBloodGroup } from "@/lib/blood-compatibility";
import { ProfileCompletionBar } from "@/components/donor/profile-completion-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  User,
  ShieldCheck,
  Droplet,
  Phone,
  Mail,
  MapPin,
  Lock,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  MessageSquare,
  Building,
  HeartHandshake,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DonorProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState<string>("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O-");
  const [phone, setPhone] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [area, setArea] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<PreferredContactMethod>("SMS");
  const [preferredLocation, setPreferredLocation] = useState<string>("");
  const [availabilityNotes, setAvailabilityNotes] = useState<string>("");
  const [lastDonatedAt, setLastDonatedAt] = useState<string>("");

  useEffect(() => {
    if (!user?.id) return;
    const currentUserId = user.id;
    let isMounted = true;

    async function fetchProfile() {
      try {
        const p = await donorService.getDonorProfile(currentUserId);
        if (isMounted) {
          setProfile(p);
          setFullName(p.fullName || "");
          setBloodGroup(p.bloodGroup || "O-");
          setPhone(p.phone || "");
          setCity(p.city || "");
          setArea(p.area || "");
          setAddress(p.address || "");
          setDateOfBirth(p.dateOfBirth || "");
          setPreferredContactMethod(p.preferredContactMethod || "SMS");
          setPreferredLocation(p.preferredLocation || "");
          setAvailabilityNotes(p.availabilityNotes || "");
          setLastDonatedAt(p.lastDonatedAt || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleReset = () => {
    if (!profile) return;
    setFullName(profile.fullName || "");
    setBloodGroup(profile.bloodGroup || "O-");
    setPhone(profile.phone || "");
    setCity(profile.city || "");
    setArea(profile.area || "");
    setAddress(profile.address || "");
    setDateOfBirth(profile.dateOfBirth || "");
    setPreferredContactMethod(profile.preferredContactMethod || "SMS");
    setPreferredLocation(profile.preferredLocation || "");
    setAvailabilityNotes(profile.availabilityNotes || "");
    setLastDonatedAt(profile.lastDonatedAt || "");
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }
    if (!isValidBloodGroup(bloodGroup)) {
      setErrorMessage("Please select a valid blood group.");
      return;
    }
    if (phone.trim() && phone.trim().length < 7) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updated = await donorService.updateDonorProfile(user.id, {
        fullName: fullName.trim(),
        bloodGroup,
        phone: phone.trim(),
        city: city.trim(),
        area: area.trim(),
        address: address.trim(),
        dateOfBirth: dateOfBirth || undefined,
        preferredContactMethod,
        preferredLocation: preferredLocation.trim(),
        availabilityNotes: availabilityNotes.trim(),
        lastDonatedAt: lastDonatedAt || undefined,
      });

      setProfile(updated);
      setSuccessMessage("Your donor profile has been updated successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const previewCompletion = calculateProfileCompletion({
    fullName,
    bloodGroup,
    phone,
    email: profile?.email || user?.email,
    city,
    area,
    preferredContactMethod,
    preferredLocation,
  });

  return (
    <ProtectedRoute allowedRoles={["donor"]}>
      <DashboardShell
        role="donor"
        userName={profile?.fullName || user?.fullName || "Donor Member"}
        userEmail={profile?.email || user?.email || "donor@drop4life.org"}
        navItems={DONOR_NAV_ITEMS}
      >
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <Badge variant="blush">Donor Profile Management</Badge>
              <span className="text-xs text-slate-500 font-mono">
                ID: {profile?.id || "prof-donor-001"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              My Donor Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Manage your personal information, blood typing, coordination location, and emergency contact visibility.
            </p>
          </div>

          {/* Profile Completion Indicator */}
          <ProfileCompletionBar
            profile={{ ...profile, profileCompletion: previewCompletion }}
            showChecklist={true}
          />

          {/* Feedback Banners */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs sm:text-sm text-emerald-900 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-xs sm:text-sm text-red-900 flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Profile Form Card */}
          <form onSubmit={handleSave}>
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-4">
                <CardTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Personal & Blood Typing Information
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Update your contact methods and blood typing details. Changes are verified and securely persisted.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Full Name & Blood Group Selector */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="donor-full-name" className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name *
                    </label>
                    <Input
                      id="donor-full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      required
                    />
                  </div>

                  {/* Blood Group Radio Chips */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Blood Group (ABO/Rh) *
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Selected: <strong className="text-primary font-bold">{bloodGroup}</strong>
                      </span>
                    </div>

                    <div
                      role="radiogroup"
                      aria-label="Blood group selection"
                      className="grid grid-cols-4 sm:grid-cols-8 gap-2"
                    >
                      {ALL_BLOOD_GROUPS.map((bg) => {
                        const isSelected = bloodGroup === bg;
                        return (
                          <button
                            key={`profile-bg-${bg}`}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => setBloodGroup(bg)}
                            className={cn(
                              "p-2.5 rounded-lg border-2 text-center font-extrabold text-sm transition-all",
                              isSelected
                                ? "border-red-700 bg-red-50 text-red-900 ring-2 ring-red-700/20 shadow-xs"
                                : "border-slate-200 bg-white hover:border-slate-300 text-slate-800"
                            )}
                          >
                            {bg}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-600" />
                    Contact & Communication Preferences
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email (Read-only / verified) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Email Address
                        </label>
                        <Badge variant="success" className="text-[9px] py-0 px-1.5">
                          Verified
                        </Badge>
                      </div>
                      <Input
                        value={profile?.email || user?.email || ""}
                        disabled
                        className="bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Associated with your Drop4Life login account.
                      </span>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="donor-phone" className="block text-xs font-bold text-slate-700">
                          Contact Phone Number *
                        </label>
                        {profile?.phoneVerified && (
                          <Badge variant="success" className="text-[9px] py-0 px-1.5">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <Input
                        id="donor-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +1 (555) 234-5678"
                      />
                    </div>
                  </div>

                  {/* Preferred Contact Method */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Preferred Contact Method
                      </label>
                      <select
                        value={preferredContactMethod}
                        onChange={(e) => setPreferredContactMethod(e.target.value as PreferredContactMethod)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary"
                      >
                        <option value="SMS">SMS Text Message</option>
                        <option value="PHONE">Direct Phone Call</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="EMAIL">Email Notification</option>
                      </select>
                    </div>

                    {/* Date of Birth (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Date of Birth (Optional)
                      </label>
                      <Input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Used only to verify minimum donor age requirement (18+).
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location & Privacy */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-600" />
                    Location & Center Proximity
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* City */}
                    <div>
                      <label htmlFor="donor-city" className="block text-xs font-bold text-slate-700 mb-1">
                        City *
                      </label>
                      <Input
                        id="donor-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. New York"
                        required
                      />
                    </div>

                    {/* District / Area */}
                    <div>
                      <label htmlFor="donor-area" className="block text-xs font-bold text-slate-700 mb-1">
                        Neighborhood / District / Area
                      </label>
                      <Input
                        id="donor-area"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. Manhattan & Brooklyn"
                      />
                    </div>
                  </div>

                  {/* Street Address (Confidential) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="donor-address" className="block text-xs font-bold text-slate-700">
                        Street Address (Private & Encrypted)
                      </label>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        Confidential Access
                      </span>
                    </div>
                    <Input
                      id="donor-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 350 5th Avenue, Apt 4B"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Never shared publicly. Only used for dispatching certified emergency mobile collection vans with your direct consent.
                    </span>
                  </div>

                  {/* Preferred Location / Blood Center */}
                  <div>
                    <label htmlFor="donor-preferred-center" className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Donation Center / Hospital Blood Bank
                    </label>
                    <Input
                      id="donor-preferred-center"
                      value={preferredLocation}
                      onChange={(e) => setPreferredLocation(e.target.value)}
                      placeholder="e.g. Manhattan Central Hospital Blood Bank"
                    />
                  </div>
                </div>

                {/* Donation History Milestone */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    Last Donation Date & Coordination Notes
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Last Known Donation Date
                      </label>
                      <Input
                        type="date"
                        value={lastDonatedAt}
                        onChange={(e) => setLastDonatedAt(e.target.value)}
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Used to calculate your 56-day rest and recovery window.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Availability Notes (Non-medical)
                      </label>
                      <Input
                        value={availabilityNotes}
                        onChange={(e) => setAvailabilityNotes(e.target.value)}
                        placeholder="e.g. Available weekdays after 5 PM, weekends anytime"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isSaving}
                  className="w-full sm:w-auto text-xs text-slate-600"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Discard Changes
                </Button>

                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSaving}
                  className="w-full sm:w-auto font-bold text-xs"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      Save Profile Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>

          {/* Clinical Non-Eligibility Disclaimer Notice */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-amber-950 font-bold">
                Clinical Eligibility & Regulatory Notice:
              </strong>
              <p className="leading-relaxed">
                Completing this profile registers your voluntary intent to donate. It does not certify medical clearance or pre-approve donor eligibility. All donors undergo clinical screening, hemoglobin evaluation, and antibody crossmatching conducted on-site by qualified healthcare professionals prior to any blood draw.
              </p>
            </div>
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
