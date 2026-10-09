"use client";

import React, { useState } from "react";
import { DonorMatchResult, BloodRequest } from "@/lib/types";
import { matchingService, MATCHING_CLINICAL_DISCLAIMER } from "@/lib/matching/matching-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ShieldAlert,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  MessageSquare,
  Phone,
  Mail,
  HelpCircle,
  Loader2,
  Users,
} from "lucide-react";

interface SmartDonorMatchingTableProps {
  request: BloodRequest;
  matches: DonorMatchResult[];
  onDonorInvited?: () => void;
  canInvite?: boolean;
}

export function SmartDonorMatchingTable({
  request,
  matches,
  onDonorInvited,
  canInvite = true,
}: SmartDonorMatchingTableProps) {
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleInvite = async (donorId: string, donorName: string) => {
    setInvitingId(donorId);
    setActionError(null);
    setActionSuccess(null);

    try {
      await matchingService.inviteDonor(
        request.id,
        donorId,
        `Matched for ${request.bloodGroup} requisition (${request.referenceNumber})`
      );
      setActionSuccess(`Coordination invitation dispatched to ${donorName}.`);
      if (onDonorInvited) {
        onDonorInvited();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to invite donor.");
      }
    } finally {
      setInvitingId(null);
    }
  };

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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-700 bg-emerald-50 border-emerald-300";
    if (score >= 70) return "text-blue-700 bg-blue-50 border-blue-300";
    return "text-amber-700 bg-amber-50 border-amber-300";
  };

  return (
    <div className="space-y-4">
      {/* Medical Safety & Clinical Disclaimer Notice */}
      <Alert className="bg-amber-50/70 border-amber-200 text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-700" />
        <AlertTitle className="text-xs font-bold uppercase tracking-wider text-amber-800">
          Preliminary Match Disclaimer & Clinical Safety Note
        </AlertTitle>
        <AlertDescription className="text-xs text-amber-800 mt-1 leading-relaxed">
          {MATCHING_CLINICAL_DISCLAIMER}
        </AlertDescription>
      </Alert>

      {actionSuccess && (
        <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <AlertDescription className="text-xs font-medium">{actionSuccess}</AlertDescription>
        </Alert>
      )}

      {actionError && (
        <Alert variant="destructive">
          <AlertTitle className="text-xs">Invitation Error</AlertTitle>
          <AlertDescription className="text-xs">{actionError}</AlertDescription>
        </Alert>
      )}

      {matches.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 p-6">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="font-semibold text-slate-800">No Eligible Donors Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            No active donors currently meet red blood cell compatibility for {request.bloodGroup} in this area, or potential donors have marked themselves unavailable.
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Rank & Score</th>
                  <th className="py-3 px-4">Donor Name & Group</th>
                  <th className="py-3 px-4">Location / Proximity</th>
                  <th className="py-3 px-4">Match Explanation</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4 text-right">Coordination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matches.map((donor, idx) => {
                  const isInvited = donor.invitationStatus === "INVITED";
                  const isAccepted = donor.invitationStatus === "ACCEPTED";
                  const isDeclined = donor.invitationStatus === "DECLINED";
                  const isConfirmed = donor.invitationStatus === "CONFIRMED";

                  return (
                    <tr
                      key={donor.donorId}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Rank & Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-center font-bold text-slate-400">
                            #{idx + 1}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-black border ${getScoreColor(
                              donor.matchScore
                            )}`}
                          >
                            {donor.matchScore}%
                          </span>
                        </div>
                      </td>

                      {/* Name & Blood Group */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          {donor.donorName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge
                            variant={donor.isExactMatch ? "destructive" : "secondary"}
                            className="text-[10px] px-1.5 py-0 font-bold"
                          >
                            {donor.bloodGroup} {donor.isExactMatch ? "Exact" : "Compatible"}
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

                      {/* Match Explanation */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-600 leading-relaxed font-normal">
                          {donor.matchExplanation}
                        </p>
                      </td>

                      {/* Channel */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-slate-700 font-medium text-[11px]">
                          {getContactIcon(donor.preferredContactMethod)}
                          <span>{donor.preferredContactMethod}</span>
                        </div>
                      </td>

                      {/* Action / Coordination Status */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isAccepted ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Accepted
                          </Badge>
                        ) : isConfirmed ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Confirmed
                          </Badge>
                        ) : isDeclined ? (
                          <Badge variant="secondary" className="text-slate-500">
                            Declined
                          </Badge>
                        ) : isInvited ? (
                          <Badge variant="warning" className="gap-1">
                            <Clock className="w-3 h-3" />
                            Invitation Sent
                          </Badge>
                        ) : canInvite && request.status !== "CANCELLED" && request.status !== "FULFILLED" ? (
                          <Button
                            size="sm"
                            className="bg-red-700 hover:bg-red-800 text-white text-xs h-7 px-2.5 font-semibold"
                            onClick={() => handleInvite(donor.donorId, donor.donorName)}
                            disabled={invitingId === donor.donorId}
                          >
                            {invitingId === donor.donorId ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-3 h-3 mr-1" />
                                Invite Donor
                              </>
                            )}
                          </Button>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
