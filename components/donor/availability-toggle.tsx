"use client";

import React, { useState } from "react";
import { DonorAvailabilityStatus, PreferredContactMethod } from "@/lib/types";
import { DONOR_AVAILABILITY_CONFIG } from "@/lib/constants";
import { donorService } from "@/lib/donor/donor-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, Ban, Loader2, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvailabilityToggleProps {
  userId: string;
  currentStatus: DonorAvailabilityStatus;
  preferredLocation?: string;
  preferredContactMethod?: PreferredContactMethod;
  notes?: string;
  onStatusUpdated?: (newStatus: DonorAvailabilityStatus) => void;
  compact?: boolean;
}

export function AvailabilityToggle({
  userId,
  currentStatus,
  preferredLocation,
  preferredContactMethod,
  notes,
  onStatusUpdated,
  compact = false,
}: AvailabilityToggleProps) {
  const [status, setStatus] = useState<DonorAvailabilityStatus>(currentStatus);
  const [loadingStatus, setLoadingStatus] = useState<DonorAvailabilityStatus | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: DonorAvailabilityStatus) => {
    if (newStatus === status) return;
    setLoadingStatus(newStatus);
    setFeedback(null);
    setError(null);

    try {
      await donorService.updateDonorAvailability(userId, {
        status: newStatus,
        preferredLocation,
        preferredContactMethod,
        notes,
      });
      setStatus(newStatus);
      setFeedback(`Availability status successfully updated to "${DONOR_AVAILABILITY_CONFIG[newStatus]?.label}".`);
      onStatusUpdated?.(newStatus);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update availability status.";
      setError(message);
    } finally {
      setLoadingStatus(null);
    }
  };

  const statusOptions: Array<{
    id: DonorAvailabilityStatus;
    icon: React.ReactNode;
  }> = [
    {
      id: "AVAILABLE",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: "TEMPORARILY_UNAVAILABLE",
      icon: <Clock className="w-4 h-4 text-amber-600" />,
    },
    {
      id: "DO_NOT_CONTACT",
      icon: <Ban className="w-4 h-4 text-slate-500" />,
    },
  ];

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => {
            const config = DONOR_AVAILABILITY_CONFIG[opt.id];
            const isSelected = status === opt.id;
            const isLoading = loadingStatus === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleStatusChange(opt.id)}
                disabled={Boolean(loadingStatus)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all",
                  isSelected
                    ? "border-primary bg-red-50 text-red-900 ring-2 ring-primary/20 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                ) : (
                  opt.icon
                )}
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
        {feedback && (
          <p className="text-[11px] text-emerald-700 font-medium">{feedback}</p>
        )}
        {error && (
          <p className="text-[11px] text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }

  const activeConfig = DONOR_AVAILABILITY_CONFIG[status];

  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Blood Donation Availability Status
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Control whether hospitals and coordinators can reach out for compatible emergency blood requests.
            </CardDescription>
          </div>

          <Badge
            variant={activeConfig?.badgeVariant || "default"}
            className="self-start sm:self-center text-xs font-bold px-2.5 py-1"
          >
            {activeConfig?.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* 3 Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {statusOptions.map((opt) => {
            const config = DONOR_AVAILABILITY_CONFIG[opt.id];
            const isSelected = status === opt.id;
            const isLoading = loadingStatus === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleStatusChange(opt.id)}
                disabled={Boolean(loadingStatus)}
                className={cn(
                  "flex flex-col text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer relative",
                  isSelected
                    ? "border-primary bg-red-50/70 shadow-xs ring-2 ring-primary/10"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-800"
                )}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                    {opt.icon}
                    {config.label}
                  </span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  )}
                  {isLoading && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {config.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Feedback / Error Alerts */}
        {feedback && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Safety Note */}
        <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Availability setting indicates your willingness to be contacted. Medical screening and clinical crossmatching occur on-site before every donation.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
