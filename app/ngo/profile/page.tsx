"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { NGO_NAV_ITEMS } from "@/lib/constants";
import { NGOProfile } from "@/lib/types";
import { campaignService } from "@/lib/campaigns/campaign-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Building2,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Edit2,
} from "lucide-react";

export default function NgoProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<NGOProfile | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [contactPerson, setContactPerson] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [coverageArea, setCoverageArea] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const loadProfile = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await campaignService.getNgoProfile(user.id);
      setProfile(data);
      setContactPerson(data.contactPerson);
      setPhone(data.phone);
      setCity(data.city || "New York");
      setAddress(data.address || "");
      setCoverageArea(data.coverageArea);
      setWebsite(data.website || "");
      setDescription(data.description || "");
    } catch (err) {
      console.error("Failed to load NGO profile", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setSuccessMsg(null);

    try {
      const updated = await campaignService.updateNgoProfile(user.id, {
        contactPerson,
        phone,
        city,
        address,
        coverageArea,
        website,
        description,
      });
      setProfile(updated);
      setSuccessMsg("Organization profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ngo", "admin"]}>
      <DashboardShell
        role="ngo"
        userName={user?.fullName || "NGO Coordinator"}
        userEmail={user?.email || "ngo@drop4life.org"}
        navItems={NGO_NAV_ITEMS}
      >
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Building2 className="w-5 h-5" />
                </span>
                <h1 className="text-2xl font-black text-slate-900">Organization Profile</h1>
              </div>
              <p className="text-xs text-slate-500">
                Official registration credentials, coverage regions, and public coordinator details.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {profile?.isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified Organization
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Verification Pending
                </span>
              )}
            </div>
          </div>

          {successMsg && (
            <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <AlertDescription className="text-xs font-semibold">{successMsg}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
              <Clock className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-2" />
              <p className="text-xs text-slate-500">Loading organization profile...</p>
            </div>
          ) : !isEditing ? (
            /* View Mode */
            <div className="space-y-6">
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      {profile?.organizationName}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 font-mono mt-0.5">
                      Registration ID: {profile?.registrationId}
                    </CardDescription>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="text-xs h-8 gap-1 font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Profile
                  </Button>
                </CardHeader>

                <CardContent className="p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
                        Designated Coordinator
                      </span>
                      <p className="font-bold text-slate-900 text-sm">{profile?.contactPerson}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
                        Contact Hotline
                      </span>
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 font-mono text-sm">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{profile?.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
                        Headquarters Location
                      </span>
                      <div className="flex items-start gap-1.5 text-slate-800 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{profile?.address || "New York Headquarters"}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
                        Designated Coverage Region
                      </span>
                      <p className="font-bold text-slate-900">{profile?.coverageArea}</p>
                    </div>
                  </div>

                  {profile?.website && (
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
                        Official Partner Website
                      </span>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-800 hover:text-amber-900 font-semibold inline-flex items-center gap-1"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{profile.website}</span>
                      </a>
                    </div>
                  )}

                  {profile?.description && (
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
                        Mission & Community Purpose
                      </span>
                      <p className="text-slate-700 leading-relaxed">{profile.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Verification Info Banner */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Authorized Organization Verification:</span> Drop4Life enforces formal documentation reviews prior to granting verified organization badges to guarantee donor confidence and logistical accountability.
                </div>
              </div>
            </div>
          ) : (
            /* Edit Form */
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">
                  Edit Organization Details
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Update public coordinator information and coverage areas.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-coordinator" className="text-xs font-bold text-slate-700">
                        Designated Coordinator Name *
                      </Label>
                      <Input
                        id="edit-coordinator"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="mt-1 text-xs"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-phone" className="text-xs font-bold text-slate-700">
                        Contact Hotline *
                      </Label>
                      <Input
                        id="edit-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-city" className="text-xs font-bold text-slate-700">
                        City *
                      </Label>
                      <Input
                        id="edit-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1 text-xs"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-coverage" className="text-xs font-bold text-slate-700">
                        Coverage Area *
                      </Label>
                      <Input
                        id="edit-coverage"
                        value={coverageArea}
                        onChange={(e) => setCoverageArea(e.target.value)}
                        className="mt-1 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-address" className="text-xs font-bold text-slate-700">
                      Headquarters Address
                    </Label>
                    <Input
                      id="edit-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-website" className="text-xs font-bold text-slate-700">
                      Website URL
                    </Label>
                    <Input
                      id="edit-website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-desc" className="text-xs font-bold text-slate-700">
                      Mission Description
                    </Label>
                    <textarea
                      id="edit-desc"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-3 border-t flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Profile Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
