"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { HOSPITAL_NAV_ITEMS } from "@/lib/constants";
import { HospitalProfile } from "@/lib/types";
import { hospitalService } from "@/lib/hospital/hospital-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Building2,
  ShieldCheck,
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  Lock,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
} from "lucide-react";

export default function HospitalProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [hospitalName, setHospitalName] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [contactPerson, setContactPerson] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [emergencyPhone, setEmergencyPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");

  useEffect(() => {
    if (!user?.id) return;
    const currentUserId = user.id;
    let isMounted = true;

    async function fetchProfile() {
      try {
        const p = await hospitalService.getHospitalProfile(currentUserId);
        if (isMounted) {
          setProfile(p);
          setHospitalName(p.hospitalName || "");
          setDepartment(p.department || "");
          setContactPerson(p.contactPerson || "");
          setPhone(p.phone || "");
          setEmergencyPhone(p.emergencyPhone || "");
          setAddress(p.address || "");
          setCity(p.city || "");
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
    setHospitalName(profile.hospitalName || "");
    setDepartment(profile.department || "");
    setContactPerson(profile.contactPerson || "");
    setPhone(profile.phone || "");
    setEmergencyPhone(profile.emergencyPhone || "");
    setAddress(profile.address || "");
    setCity(profile.city || "");
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!hospitalName.trim()) {
      setErrorMessage("Hospital name cannot be empty.");
      return;
    }
    if (!contactPerson.trim()) {
      setErrorMessage("Authorized contact person name is required.");
      return;
    }

    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updated = await hospitalService.updateHospitalProfile(user.id, {
        hospitalName: hospitalName.trim(),
        department: department.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        emergencyPhone: emergencyPhone.trim(),
        address: address.trim(),
        city: city.trim(),
      });

      setProfile(updated);
      setSuccessMessage("Hospital organization profile updated successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["hospital", "admin"]}>
      <DashboardShell
        role="hospital"
        userName={profile?.contactPerson || user?.fullName || "Hospital Staff"}
        userEmail={profile?.workEmail || user?.email || "hospital@drop4life.org"}
        navItems={HOSPITAL_NAV_ITEMS}
      >
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Clinical Organization Profile</Badge>
              <span className="text-xs text-slate-500 font-mono">
                ID: {profile?.id || "hosp-prof-002"}
              </span>
              {profile?.isVerified && (
                <Badge variant="success" className="text-[10px] gap-1 font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Hospital Facility
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Hospital Facility & Blood Bank Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Manage your healthcare institution accreditation, authorized clinical staff, dispatch lines, and facility location.
            </p>
          </div>

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

          <form onSubmit={handleSave}>
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-4">
                <CardTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Hospital Institution Details
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Accredited facility details displayed on emergency donor invitations and blood requisition orders.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Facility Name & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hosp-name" className="block text-xs font-bold text-slate-700 mb-1">
                      Hospital / Institution Legal Name *
                    </label>
                    <Input
                      id="hosp-name"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="hosp-dept" className="block text-xs font-bold text-slate-700 mb-1">
                      Department / Blood Bank Division
                    </label>
                    <Input
                      id="hosp-dept"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Transfusion Medicine Blood Bank"
                    />
                  </div>
                </div>

                {/* Accreditation & License References (Read-only verified) */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hospital License #
                    </label>
                    <Input
                      value={profile?.licenseNumber || "NY-MED-884210-A"}
                      disabled
                      className="bg-slate-50 text-slate-600 cursor-not-allowed font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Blood Bank Regulatory License
                    </label>
                    <Input
                      value={profile?.bloodBankLicense || "FDA-BB-2024-9982"}
                      disabled
                      className="bg-slate-50 text-slate-600 cursor-not-allowed font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Total Bed Capacity
                    </label>
                    <Input
                      value={`${profile?.totalBeds || 650} Licensed Inpatient Beds`}
                      disabled
                      className="bg-slate-50 text-slate-600 cursor-not-allowed text-xs"
                    />
                  </div>
                </div>

                {/* Authorized Contact & Direct Phone */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-600" />
                    Authorized Representative & Emergency Helpline
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="hosp-contact" className="block text-xs font-bold text-slate-700 mb-1">
                        Authorized Staff Contact Person *
                      </label>
                      <Input
                        id="hosp-contact"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Work Email (Verified Account)
                      </label>
                      <Input
                        value={profile?.workEmail || user?.email || ""}
                        disabled
                        className="bg-slate-50 text-slate-500 cursor-not-allowed text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="hosp-phone" className="block text-xs font-bold text-slate-700 mb-1">
                        Direct Blood Bank Phone
                      </label>
                      <Input
                        id="hosp-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 00002"
                      />
                    </div>

                    <div>
                      <label htmlFor="hosp-emergency-phone" className="block text-xs font-bold text-red-800 mb-1">
                        24/7 Trauma Emergency Dispatch Line *
                      </label>
                      <Input
                        id="hosp-emergency-phone"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="e.g. +91 40 2360 7777"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Physical Facility Location */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-600" />
                    Physical Facility & Blood Drop Location
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="hosp-city" className="block text-xs font-bold text-slate-700 mb-1">
                        City *
                      </label>
                      <Input
                        id="hosp-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="hosp-address" className="block text-xs font-bold text-slate-700 mb-1">
                        Street Address & Blood Bank Wing *
                      </label>
                      <Input
                        id="hosp-address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 420 East 70th Street, Transfusion Wing"
                        required
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
                      Save Hospital Profile
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
