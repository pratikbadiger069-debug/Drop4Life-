"use client";

import React from "react";
import Link from "next/link";
import { DonorProfile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, ArrowRight, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileCompletionBarProps {
  profile: Partial<DonorProfile>;
  showChecklist?: boolean;
}

export function ProfileCompletionBar({
  profile,
  showChecklist = false,
}: ProfileCompletionBarProps) {
  const percentage = profile.profileCompletion ?? 0;

  const checklistItems = [
    { label: "Full Name", isComplete: Boolean(profile.fullName?.trim()) },
    { label: "Blood Group", isComplete: Boolean(profile.bloodGroup) },
    { label: "Contact Phone", isComplete: Boolean(profile.phone && profile.phone.trim().length >= 7) },
    { label: "Primary City", isComplete: Boolean(profile.city?.trim()) },
    { label: "District / Area", isComplete: Boolean(profile.area?.trim()) },
    { label: "Contact Preference", isComplete: Boolean(profile.preferredContactMethod) },
    { label: "Preferred Center", isComplete: Boolean(profile.preferredLocation?.trim()) },
  ];

  const completedCount = checklistItems.filter((item) => item.isComplete).length;
  const isFullyComplete = percentage >= 100;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-50 text-primary">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              Profile Readiness & Completion
            </h4>
            <p className="text-[11px] text-slate-500">
              {completedCount} of {checklistItems.length} profile sections verified
            </p>
          </div>
        </div>

        <Badge
          variant={isFullyComplete ? "success" : "warning"}
          className="text-xs font-bold px-2 py-0.5"
        >
          {percentage}% Complete
        </Badge>
      </div>

      {/* Progress Bar */}
      <div
        className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Donor profile completion percentage"
      >
        <div
          className={cn(
            "h-2.5 rounded-full transition-all duration-500",
            percentage >= 100
              ? "bg-emerald-500"
              : percentage >= 70
              ? "bg-gradient-to-r from-red-600 to-rose-500"
              : "bg-amber-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist items */}
      {showChecklist && (
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {checklistItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              {item.isComplete ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <span className={item.isComplete ? "text-slate-700" : "text-slate-400 font-medium"}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {!isFullyComplete && (
        <div className="pt-1 flex justify-end">
          <Link href="/donor/profile">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-red-800 gap-1 px-2 font-semibold">
              <span>Complete Profile</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
