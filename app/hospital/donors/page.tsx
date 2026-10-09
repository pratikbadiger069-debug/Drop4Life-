"use client";

import React, { useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { HOSPITAL_NAV_ITEMS, ALL_BLOOD_GROUPS } from "@/lib/constants";
import { BloodGroup } from "@/lib/types";
import { matchingService, MATCHING_CLINICAL_DISCLAIMER } from "@/lib/matching/matching-service";
import { getCompatibleDonors } from "@/lib/blood-compatibility";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Users,
  Search,
  MapPin,
  Sparkles,
  ShieldAlert,
  Phone,
  MessageSquare,
  Mail,
  Droplet,
  Filter,
} from "lucide-react";

export default function HospitalDonorsRadarPage() {
  const { user } = useAuth();
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup>("O-");
  const [selectedCity, setSelectedCity] = useState<string>("Hyderabad");
  const [selectedArea, setSelectedArea] = useState<string>("");

  const donorPool = matchingService.getDonorPool();

  const rankedDonors = useMemo(() => {
    const results = [];
    for (const donor of donorPool) {
      const evaluation = matchingService.evaluateDonorMatch(
        donor,
        selectedBloodGroup,
        selectedCity,
        selectedArea
      );
      if (evaluation) {
        results.push({
          donor,
          evaluation,
        });
      }
    }
    return results.sort((a, b) => b.evaluation.totalScore - a.evaluation.totalScore);
  }, [donorPool, selectedBloodGroup, selectedCity, selectedArea]);

  const compatibleDonorGroups = getCompatibleDonors(selectedBloodGroup);

  const getContactIcon = (method: string) => {
    switch (method) {
      case "PHONE":
        return <Phone className="w-3.5 h-3.5 text-slate-500" />;
      case "SMS":
      case "WHATSAPP":
        return <MessageSquare className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return <Mail className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "text-emerald-700 bg-emerald-50 border-emerald-300";
    if (score >= 70) return "text-blue-700 bg-blue-50 border-blue-300";
    return "text-amber-700 bg-amber-50 border-amber-300";
  };

  return (
    <ProtectedRoute allowedRoles={["hospital", "admin"]}>
      <DashboardShell
        role="hospital"
        navItems={HOSPITAL_NAV_ITEMS}
        userName={user?.fullName || "Hospital Coordinator"}
        userEmail={user?.email || "hospital@drop4life.org"}
      >
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-800/80 text-red-200 text-xs font-semibold mb-3 border border-red-700/50">
              <Users className="w-3.5 h-3.5" />
              <span>Smart Donor Registry & Radar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Donor Availability & Compatibility Radar
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Query community donor readiness and red blood cell compatibility for active blood bank requisitions.
            </p>
          </div>

          {/* Clinical Disclaimer */}
          <Alert className="bg-amber-50 border-amber-200 text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
            <AlertTitle className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Clinical Verification Disclaimer
            </AlertTitle>
            <AlertDescription className="text-xs text-amber-800 mt-1 leading-relaxed">
              {MATCHING_CLINICAL_DISCLAIMER}
            </AlertDescription>
          </Alert>

          {/* Search Query Filter Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Filter className="w-4 h-4 text-red-600" />
                Target Blood Group & Location Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Target Blood Group */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Recipient / Target Blood Group
                  </label>
                  <select
                    value={selectedBloodGroup}
                    onChange={(e) => setSelectedBloodGroup(e.target.value as BloodGroup)}
                    className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 focus:border-red-500 focus:outline-none"
                  >
                    {ALL_BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg} {bg === "O-" ? "(Universal RBC Donor)" : bg === "AB+" ? "(Universal Recipient)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target City */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target City / Region
                  </label>
                  <input
                    type="text"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    placeholder="e.g. Hyderabad, Bengaluru"
                    className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Target Neighborhood */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Neighborhood / Area (Optional)
                  </label>
                  <input
                    type="text"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    placeholder="e.g. Jubilee Hills, Banjara Hills"
                    className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Compatible groups pill row */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  Compatible RBC Donor Types for {selectedBloodGroup}:
                </span>
                {compatibleDonorGroups.map((bg) => (
                  <span
                    key={bg}
                    className={`px-2 py-0.5 rounded text-xs font-bold border ${
                      bg === selectedBloodGroup
                        ? "bg-red-700 text-white border-red-800"
                        : "bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    {bg}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-red-600" />
                    Ranked Compatible Donors ({rankedDonors.length})
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Calculated using RBC compatibility, geographic proximity, 56-day rest cycle, and verified contact channels.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {rankedDonors.length === 0 ? (
                <div className="text-center py-12 p-6">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="font-semibold text-slate-800">No Eligible Donors Found</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    No active volunteer donors match the red blood cell compatibility for {selectedBloodGroup} in the selected area.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Rank & Score</th>
                        <th className="py-3 px-4">Donor Name & Group</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Match Explanation</th>
                        <th className="py-3 px-4">Rest Cycle</th>
                        <th className="py-3 px-4 text-right">Preferred Channel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rankedDonors.map(({ donor, evaluation }, idx) => (
                        <tr
                          key={donor.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Rank & Score */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="w-5 text-center font-bold text-slate-400">
                                #{idx + 1}
                              </span>
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-black border ${getScoreBadge(
                                  evaluation.totalScore
                                )}`}
                              >
                                {evaluation.totalScore}%
                              </span>
                            </div>
                          </td>

                          {/* Name & Blood Group */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">
                              {donor.fullName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge
                                variant={evaluation.isExactMatch ? "destructive" : "secondary"}
                                className="text-[10px] px-1.5 py-0 font-bold"
                              >
                                {donor.bloodGroup} {evaluation.isExactMatch ? "Exact" : "Compatible"}
                              </Badge>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-slate-700 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{donor.city}</span>
                            </div>
                            {donor.area && (
                              <div className="text-[11px] text-slate-500 ml-4.5">{donor.area}</div>
                            )}
                          </td>

                          {/* Explanation */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-slate-600 leading-relaxed font-normal">
                              {evaluation.explanation}
                            </p>
                          </td>

                          {/* Rest Cycle */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {evaluation.daysSinceLastDonation !== undefined ? (
                              <span
                                className={`text-xs font-semibold ${
                                  evaluation.daysSinceLastDonation >= 56
                                    ? "text-emerald-700"
                                    : "text-amber-700"
                                }`}
                              >
                                {evaluation.daysSinceLastDonation} days ago
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500">First-time</span>
                            )}
                          </td>

                          {/* Channel */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-medium text-xs">
                              {getContactIcon(donor.preferredContactMethod)}
                              <span>{donor.preferredContactMethod}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
