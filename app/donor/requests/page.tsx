"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { DONOR_NAV_ITEMS } from "@/lib/constants";
import { BloodRequest, RequestDonorInvitation } from "@/lib/types";
import { matchingService, MATCHING_CLINICAL_DISCLAIMER } from "@/lib/matching/matching-service";
import { EmergencyBadge } from "@/components/requests/emergency-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Inbox,
  Sparkles,
  Building2,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  ShieldCheck,
  Heart,
  Droplet,
  Loader2,
} from "lucide-react";

import { MedicalPrescreeningDialog } from "@/components/screening/medical-prescreening-dialog";
import { medicalScreeningService } from "@/lib/screening/screening-service";

interface MatchingRequestItem {
  request: BloodRequest;
  matchScore: number;
  explanation: string;
  invitation?: RequestDonorInvitation;
}

export default function DonorRequestsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MatchingRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isScreeningOpen, setIsScreeningOpen] = useState<boolean>(false);
  const [pendingAcceptRequestId, setPendingAcceptRequestId] = useState<string | null>(null);

  const loadDonorMatches = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await matchingService.getMatchingRequestsForDonor(user.id);
      setItems(data);
    } catch (err) {
      console.error("Failed to load donor matches", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDonorMatches();
  }, [loadDonorMatches]);

  const executeAccept = async (requestId: string) => {
    if (!user?.id) return;
    setRespondingId(requestId);
    setActionSuccess(null);
    setActionError(null);

    try {
      await matchingService.donorRespondToInvitation(
        requestId,
        user.id,
        "ACCEPTED",
        "Donor accepted via mobile portal with verified medical pre-screening."
      );
      setActionSuccess(
        "Thank you! You have completed pre-screening and accepted this donation coordination request. Hospital clinical staff will reach out."
      );
      await loadDonorMatches();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to record response.");
      }
    } finally {
      setRespondingId(null);
    }
  };

  const handleRespond = async (
    requestId: string,
    response: "ACCEPTED" | "DECLINED"
  ) => {
    if (!user?.id) return;

    if (response === "ACCEPTED") {
      // Feature 2 Check: Prior to accepting an SOS request, verify that medical pre-screening has been completed
      const existingScreening = medicalScreeningService.getLatestScreening(user.id);
      if (!existingScreening) {
        setPendingAcceptRequestId(requestId);
        setIsScreeningOpen(true);
        return;
      }
      await executeAccept(requestId);
      return;
    }

    setRespondingId(requestId);
    setActionSuccess(null);
    setActionError(null);

    try {
      await matchingService.donorRespondToInvitation(
        requestId,
        user.id,
        response,
        "Donor unable to attend."
      );
      setActionSuccess("Response logged. Thank you for notifying the coordination team.");
      await loadDonorMatches();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to record response.");
      }
    } finally {
      setRespondingId(null);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "text-emerald-700 bg-emerald-50 border-emerald-300";
    if (score >= 70) return "text-blue-700 bg-blue-50 border-blue-300";
    return "text-amber-700 bg-amber-50 border-amber-300";
  };

  const invitedItems = items.filter((i) => i.invitation?.status === "INVITED");
  const acceptedItems = items.filter((i) => i.invitation?.status === "ACCEPTED");
  const otherMatches = items.filter((i) => !i.invitation || i.invitation.status === "DECLINED");

  return (
    <ProtectedRoute allowedRoles={["donor"]}>
      <DashboardShell
        role="donor"
        navItems={DONOR_NAV_ITEMS}
        userName={user?.fullName || "Volunteer Donor"}
        userEmail={user?.email || "donor@drop4life.org"}
      >
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-800/80 text-red-200 text-xs font-semibold mb-3 border border-red-700/50">
              <Inbox className="w-3.5 h-3.5" />
              <span>Personalized Matching Feed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Matching Blood Requisitions
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Active hospital blood requests compatible with your blood group ({user?.bloodGroup || "O-"}) and region.
            </p>
          </div>

          {/* Clinical Disclaimer */}
          <Alert className="bg-amber-50 border-amber-200 text-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5" />
            <AlertTitle className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Transfusion Safety & Clinical Protocol
            </AlertTitle>
            <AlertDescription className="text-xs text-amber-800 mt-1 leading-relaxed">
              {MATCHING_CLINICAL_DISCLAIMER}
            </AlertDescription>
          </Alert>

          {actionSuccess && (
            <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <AlertDescription className="text-xs font-semibold">{actionSuccess}</AlertDescription>
            </Alert>
          )}

          {actionError && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-xs">{actionError}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
              <Clock className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Checking compatible requisitions...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-lg">No Active Requisitions Right Now</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                There are currently no open hospital requisitions matching your blood group in your area. We will notify you when a nearby hospital requests your blood type.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Direct Invitations Section */}
              {invitedItems.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-red-600" />
                    Direct Hospital Invitations ({invitedItems.length})
                  </h3>

                  <div className="space-y-4">
                    {invitedItems.map(({ request, matchScore, explanation }) => (
                      <Card
                        key={request.id}
                        className="border-2 border-red-400/80 bg-red-50/20 shadow-md overflow-hidden"
                      >
                        <CardHeader className="pb-3 border-b border-red-100 bg-red-50/50">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <EmergencyBadge priority={request.priority} size="sm" />
                              <span className="font-mono text-xs font-bold text-slate-600">
                                {request.referenceNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">Compatibility Score:</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-black border ${getScoreBadge(
                                  matchScore
                                )}`}
                              >
                                {matchScore}%
                              </span>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 sm:p-6 space-y-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-red-600" />
                                {request.hospitalName}
                              </h4>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Department: {request.department} • Location: {request.city}
                                {request.area ? `, ${request.area}` : ""}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-mono">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  Required By: {request.requiredDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Droplet className="w-3.5 h-3.5 text-red-600" />
                                  {request.unitsNeeded} units of {request.bloodGroup}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-slate-600 hover:bg-slate-100"
                                onClick={() => handleRespond(request.id, "DECLINED")}
                                disabled={respondingId === request.id}
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-700 hover:bg-red-800 text-white font-bold gap-1.5"
                                onClick={() => handleRespond(request.id, "ACCEPTED")}
                                disabled={respondingId === request.id}
                              >
                                {respondingId === request.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Accept & Coordinate
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="p-2.5 bg-white border border-red-100 rounded-lg text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">Match Reason:</span>{" "}
                            {explanation}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Accepted Confirmations */}
              {acceptedItems.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Confirmed Coordination ({acceptedItems.length})
                  </h3>
                  <div className="space-y-3">
                    {acceptedItems.map(({ request, matchScore }) => (
                      <Card key={request.id} className="border-emerald-200 bg-emerald-50/20">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="success" className="text-xs">
                                Accepted
                              </Badge>
                              <span className="font-mono text-xs font-bold text-slate-700">
                                {request.referenceNumber}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm mt-1">
                              {request.hospitalName} ({request.department})
                            </h4>
                            <p className="text-xs text-slate-500">
                              Hospital coordination staff will contact you for clinical intake and screening appointment.
                            </p>
                          </div>
                          <EmergencyBadge priority={request.priority} size="sm" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Matching Requisitions */}
              {otherMatches.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-slate-500" />
                    All Compatible Regional Requisitions ({otherMatches.length})
                  </h3>

                  <div className="space-y-3">
                    {otherMatches.map(({ request, matchScore, explanation, invitation }) => (
                      <Card key={request.id} className="border-slate-200 shadow-sm">
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <EmergencyBadge priority={request.priority} size="sm" />
                                <span className="font-mono text-xs font-bold text-slate-500">
                                  {request.referenceNumber}
                                </span>
                                {invitation?.status === "DECLINED" && (
                                  <Badge variant="secondary" className="text-slate-500 text-[10px]">
                                    Declined
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-bold text-slate-900 text-sm">
                                {request.hospitalName} ({request.department})
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Location: {request.city}{request.area ? `, ${request.area}` : ""} • Required Date: {request.requiredDate}
                              </p>
                              <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                <span className="font-semibold text-slate-700">Match score: {matchScore}%</span> • {explanation}
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span className="text-xs text-slate-500 block">Required</span>
                              <span className="font-black text-sm text-slate-900">
                                {request.unitsNeeded} units of {request.bloodGroup}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feature 2: Medical Pre-Screening Dialog required before accepting SOS requests */}
          {user && (
            <MedicalPrescreeningDialog
              isOpen={isScreeningOpen}
              onClose={() => {
                setIsScreeningOpen(false);
                setPendingAcceptRequestId(null);
              }}
              donorId={user.id}
              onSuccess={() => {
                setIsScreeningOpen(false);
                if (pendingAcceptRequestId) {
                  const reqId = pendingAcceptRequestId;
                  setPendingAcceptRequestId(null);
                  executeAccept(reqId);
                }
              }}
            />
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
