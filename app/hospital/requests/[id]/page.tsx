"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { HOSPITAL_NAV_ITEMS, REQUEST_STATUS_CONFIG } from "@/lib/constants";
import { BloodRequest, DonorMatchResult } from "@/lib/types";
import { requestService } from "@/lib/requests/request-service";
import { matchingService, MATCHING_CLINICAL_DISCLAIMER } from "@/lib/matching/matching-service";
import { getCompatibleDonors } from "@/lib/blood-compatibility";
import { RequestStatusTimeline } from "@/components/requests/request-status-timeline";
import { SmartDonorMatchingTable } from "@/components/matching/smart-donor-matching-table";
import { EmergencyBadge } from "@/components/requests/emergency-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Users,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Send,
  Droplet,
} from "lucide-react";

export default function HospitalRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [matches, setMatches] = useState<DonorMatchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [matchingLoading, setMatchingLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const req = await requestService.getBloodRequestById(requestId);
      if (!req) {
        setErrorMsg(`Requisition '${requestId}' was not found.`);
        return;
      }
      setRequest(req);

      // Load matching donors
      setMatchingLoading(true);
      const matchResults = await matchingService.findMatchesForRequest(requestId);
      setMatches(matchResults);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to load requisition details.");
      }
    } finally {
      setLoading(false);
      setMatchingLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusUpdated = (updatedReq: BloodRequest) => {
    setRequest(updatedReq);
    // Reload matches to reflect updated coordination status
    matchingService.findMatchesForRequest(requestId).then(setMatches);
  };

  const handleDonorInvited = async () => {
    if (!request) return;
    const [updatedReq, matchResults] = await Promise.all([
      requestService.getBloodRequestById(requestId),
      matchingService.findMatchesForRequest(requestId),
    ]);
    if (updatedReq) setRequest(updatedReq);
    setMatches(matchResults);
  };

  const compatibleDonorsList = request ? getCompatibleDonors(request.bloodGroup) : [];

  return (
    <ProtectedRoute allowedRoles={["hospital", "admin"]}>
      <DashboardShell
        role="hospital"
        navItems={HOSPITAL_NAV_ITEMS}
        userName={user?.fullName || "Hospital Coordinator"}
        userEmail={user?.email || "hospital@drop4life.org"}
      >
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Top Bar Back Link */}
          <div className="flex items-center justify-between">
            <Link
              href="/hospital/requests"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Requisitions</span>
            </Link>

            {request && (
              <div className="flex items-center gap-2">
                <EmergencyBadge priority={request.priority} size="md" />
                <Badge
                  variant={
                    (REQUEST_STATUS_CONFIG[request.status]?.badgeVariant as any) || "default"
                  }
                >
                  {REQUEST_STATUS_CONFIG[request.status]?.label || request.status}
                </Badge>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm">
              <Clock className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Loading requisition details...</p>
            </div>
          ) : errorMsg || !request ? (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertTitle>Requisition Not Found</AlertTitle>
              <AlertDescription className="mt-1">
                {errorMsg || "The requested requisition could not be located."}
              </AlertDescription>
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/hospital/requests")}
                >
                  Return to Requisitions List
                </Button>
              </div>
            </Alert>
          ) : (
            <>
              {/* Header Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                        Requisition Reference
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                        {request.referenceNumber}
                      </h1>
                      <span className="px-3 py-1 rounded-xl bg-red-100 text-red-700 font-black text-base border border-red-200">
                        {request.bloodGroup} RBC Needed
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {request.hospitalName} ({request.department})
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {request.city}
                        {request.area ? `, ${request.area}` : ""}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Required: {request.requiredDate}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-center bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[180px]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Required Quantity
                    </span>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      {request.unitsFulfilled} / {request.unitsNeeded}
                      <span className="text-sm font-normal text-slate-500 ml-1">units</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      {request.unitsFulfilled >= request.unitsNeeded
                        ? "100% Fulfilled"
                        : `${request.unitsNeeded - request.unitsFulfilled} units remaining`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column (5 Cols): Requisition Specs & Status Workflow */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Requisition Specs Card */}
                  <Card className="border-slate-200">
                    <CardHeader className="pb-3 border-b border-slate-100">
                      <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-600" />
                        Requisition Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 bg-slate-50 rounded-lg">
                          <span className="text-slate-500 text-[11px] block">Blood Group</span>
                          <span className="font-bold text-slate-900 text-sm">{request.bloodGroup}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-lg">
                          <span className="text-slate-500 text-[11px] block">Units Required</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {request.unitsNeeded} units
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg space-y-1">
                        <span className="text-slate-500 text-[11px] block">Coordination Contact</span>
                        <div className="font-semibold text-slate-800">{request.requesterName}</div>
                        <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{request.requesterPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{request.requesterEmail}</span>
                        </div>
                      </div>

                      {request.clinicalNotes && (
                        <div className="p-2.5 bg-slate-50 rounded-lg">
                          <span className="text-slate-500 text-[11px] block font-medium">
                            Clinical Indications / Notes
                          </span>
                          <p className="text-slate-700 mt-1 italic leading-relaxed">
                            &ldquo;{request.clinicalNotes}&rdquo;
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* RBC Compatibility Guide */}
                  <Card className="border-red-100 bg-red-50/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                        <Droplet className="w-3.5 h-3.5 text-red-600" />
                        Compatible Red Cell Donor Groups
                      </CardTitle>
                      <CardDescription className="text-xs text-red-700/80">
                        Eligible ABO/Rh donor types for {request.bloodGroup} recipients:
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {compatibleDonorsList.map((bg) => (
                          <span
                            key={bg}
                            className={`px-2 py-1 rounded-md text-xs font-bold border ${
                              bg === request.bloodGroup
                                ? "bg-red-700 text-white border-red-800"
                                : "bg-white text-red-900 border-red-200"
                            }`}
                          >
                            {bg} {bg === request.bloodGroup ? "(Exact)" : "(Compatible)"}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Timeline & Workflow Component */}
                  <Card className="border-slate-200">
                    <CardHeader className="pb-3 border-b border-slate-100">
                      <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-600" />
                        Requisition Lifecycle & Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <RequestStatusTimeline
                        request={request}
                        onStatusUpdated={handleStatusUpdated}
                        canEdit={true}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column (7 Cols): Smart Matching Radar */}
                <div className="lg:col-span-7 space-y-6">
                  <Card className="border-slate-200">
                    <CardHeader className="pb-3 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-red-600" />
                            Smart Donor Matching Radar
                          </CardTitle>
                          <CardDescription className="text-xs text-slate-500">
                            Ranked compatible donors based on ABO/Rh compatibility, 56-day rest cycle, proximity, and readiness.
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {matches.length} Matched
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6">
                      {matchingLoading ? (
                        <div className="text-center py-12">
                          <Clock className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-2" />
                          <p className="text-xs text-slate-500">
                            Evaluating compatible donor pool & readiness scores...
                          </p>
                        </div>
                      ) : (
                        <SmartDonorMatchingTable
                          request={request}
                          matches={matches}
                          onDonorInvited={handleDonorInvited}
                          canInvite={true}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
