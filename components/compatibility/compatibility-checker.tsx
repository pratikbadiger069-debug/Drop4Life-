"use client";

import React, { useState } from "react";
import { BloodGroup } from "@/lib/types";
import { ALL_BLOOD_GROUPS } from "@/lib/constants";
import {
  canDonateRedCells,
  getCompatibleDonors,
  getCompatibleRecipients,
  getBloodGroupCompatibilityDetails,
  RED_CELL_COMPATIBILITY_DISCLAIMER,
  BLOOD_GROUP_DIRECTORY,
} from "@/lib/blood-compatibility";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Info,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CompatibilityChecker() {
  const [donorGroup, setDonorGroup] = useState<BloodGroup | "">("");
  const [recipientGroup, setRecipientGroup] = useState<BloodGroup | "">("");

  const hasBothSelected = Boolean(donorGroup && recipientGroup);
  const result = hasBothSelected
    ? getBloodGroupCompatibilityDetails(donorGroup, recipientGroup)
    : null;

  const handleReset = () => {
    setDonorGroup("");
    setRecipientGroup("");
  };

  const handlePreset = (donor: BloodGroup, recipient: BloodGroup) => {
    setDonorGroup(donor);
    setRecipientGroup(recipient);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Interactive Tool Card */}
      <Card className="border-slate-200 shadow-md bg-white overflow-hidden">
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-rose-800 text-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-xs font-semibold text-red-100 backdrop-blur-sm mb-2">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Red Blood Cell Compatibility Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Blood Group Compatibility Checker
              </h2>
              <p className="mt-2 text-red-100 text-sm sm:text-base max-w-2xl">
                Select a donor blood group and a recipient blood group below to check whether their red blood cells are generally compatible for transfusion.
              </p>
            </div>

            {hasBothSelected && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="self-start sm:self-center bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-medium gap-1.5"
                aria-label="Reset blood group selections"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Selections</span>
              </Button>
            )}
          </div>

          {/* Quick Scenario Exploration Chips */}
          <div className="mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-red-200 font-medium">Quick Scenarios:</span>
            <button
              type="button"
              onClick={() => handlePreset("O-", "AB+")}
              className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-white transition-colors"
            >
              Universal Donor (O− → AB+)
            </button>
            <button
              type="button"
              onClick={() => handlePreset("AB+", "O-")}
              className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-white transition-colors"
            >
              Incompatible Pair (AB+ → O−)
            </button>
            <button
              type="button"
              onClick={() => handlePreset("A+", "A+")}
              className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-white transition-colors"
            >
              Identical Group (A+ → A+)
            </button>
            <button
              type="button"
              onClick={() => handlePreset("B-", "B+")}
              className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-white transition-colors"
            >
              Rh Match (B− → B+)
            </button>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Selectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step 1: Donor Blood Group */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    Step 1
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Select Donor Blood Group
                  </h3>
                  <p className="text-xs text-slate-500">
                    Who is donating red blood cells?
                  </p>
                </div>
                {donorGroup && (
                  <Badge variant="destructive" className="text-xs font-bold px-2.5 py-1">
                    {donorGroup}
                  </Badge>
                )}
              </div>

              <div
                role="radiogroup"
                aria-label="Donor blood group selection"
                className="grid grid-cols-4 gap-2.5"
              >
                {ALL_BLOOD_GROUPS.map((bg) => {
                  const isSelected = donorGroup === bg;
                  const isUniversal = bg === "O-";
                  return (
                    <button
                      key={`donor-${bg}`}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setDonorGroup(bg)}
                      className={cn(
                        "relative flex flex-col items-center justify-center p-3 rounded-lg border-2 text-center transition-all font-bold text-base",
                        isSelected
                          ? "border-red-700 bg-red-50/80 text-red-900 shadow-sm ring-2 ring-red-700/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                      )}
                    >
                      <span>{bg}</span>
                      {isUniversal && (
                        <span className="text-[9px] font-medium text-emerald-700 mt-0.5 leading-none">
                          Universal
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {donorGroup ? (
                <div className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-1">
                  <div className="font-semibold text-slate-800">
                    Donor {donorGroup} Profile:
                  </div>
                  <div>
                    <span className="text-slate-500">Can give red cells to: </span>
                    <span className="font-medium text-slate-900">
                      {getCompatibleRecipients(donorGroup).join(", ")}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50/60 p-2.5 rounded border border-amber-200/60 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  Please select a donor blood group to proceed.
                </p>
              )}
            </div>

            {/* Step 2: Recipient Blood Group */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Step 2
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Select Recipient Blood Group
                  </h3>
                  <p className="text-xs text-slate-500">
                    Who is receiving the red blood cells?
                  </p>
                </div>
                {recipientGroup && (
                  <Badge variant="outline" className="text-xs font-bold px-2.5 py-1 border-slate-400">
                    {recipientGroup}
                  </Badge>
                )}
              </div>

              <div
                role="radiogroup"
                aria-label="Recipient blood group selection"
                className="grid grid-cols-4 gap-2.5"
              >
                {ALL_BLOOD_GROUPS.map((bg) => {
                  const isSelected = recipientGroup === bg;
                  const isUniversal = bg === "AB+";
                  return (
                    <button
                      key={`recipient-${bg}`}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setRecipientGroup(bg)}
                      className={cn(
                        "relative flex flex-col items-center justify-center p-3 rounded-lg border-2 text-center transition-all font-bold text-base",
                        isSelected
                          ? "border-slate-800 bg-slate-100/90 text-slate-900 shadow-sm ring-2 ring-slate-400/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                      )}
                    >
                      <span>{bg}</span>
                      {isUniversal && (
                        <span className="text-[9px] font-medium text-blue-700 mt-0.5 leading-none">
                          Universal
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {recipientGroup ? (
                <div className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-1">
                  <div className="font-semibold text-slate-800">
                    Recipient {recipientGroup} Profile:
                  </div>
                  <div>
                    <span className="text-slate-500">Can receive red cells from: </span>
                    <span className="font-medium text-slate-900">
                      {getCompatibleDonors(recipientGroup).join(", ")}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50/60 p-2.5 rounded border border-amber-200/60 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  Please select a recipient blood group to see the result.
                </p>
              )}
            </div>
          </div>

          {/* Compatibility Result Section (Live Screen-Reader Announced) */}
          <div aria-live="polite" aria-atomic="true" className="pt-4 border-t border-slate-200">
            {!hasBothSelected && (
              <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-slate-200/70 text-slate-600 mb-1">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h4 className="text-base font-semibold text-slate-800">
                  Awaiting Complete Selection
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Select both a donor blood group and a recipient blood group above to view the red blood cell compatibility analysis.
                </p>
              </div>
            )}

            {result && (
              <div
                className={cn(
                  "p-6 sm:p-7 rounded-xl border-2 transition-all space-y-5",
                  result.isCompatible
                    ? "bg-emerald-50/70 border-emerald-400 text-emerald-950"
                    : "bg-slate-50 border-amber-300 text-slate-900"
                )}
                id="compatibility-result"
              >
                {/* Visual Flow Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-3 rounded-full shrink-0",
                        result.isCompatible
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-600 text-white"
                      )}
                    >
                      {result.isCompatible ? (
                        <CheckCircle2 className="w-7 h-7" />
                      ) : (
                        <XCircle className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                        Compatibility Verdict
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black tracking-tight">
                        {result.message}
                      </h4>
                    </div>
                  </div>

                  {/* Donor -> Recipient Visual Chips */}
                  <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-2 rounded-lg border border-slate-200/80 shadow-sm self-start sm:self-center">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Donor</span>
                      <span className="text-sm font-extrabold text-red-700">{result.donor}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Recipient</span>
                      <span className="text-sm font-extrabold text-slate-800">{result.recipient}</span>
                    </div>
                  </div>
                </div>

                {/* Explanation & Antigen Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="bg-white/90 p-4 rounded-lg border border-slate-200/70 space-y-1.5 shadow-sm">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-red-600" />
                      Biological Rationale
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {result.antigenSummary}
                    </p>
                  </div>

                  <div className="bg-white/90 p-4 rounded-lg border border-slate-200/70 space-y-1.5 shadow-sm">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-slate-700" />
                      Component Scope Notice
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      This calculation strictly applies to <strong>Packed Red Blood Cells (RBC)</strong>. Fresh Frozen Plasma (FFP) and platelet transfusions follow inverse compatibility rules.
                    </p>
                  </div>
                </div>

                {/* Highlight badges */}
                {(result.isUniversalDonor || result.isUniversalRecipient) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {result.isUniversalDonor && (
                      <Badge variant="success" className="text-xs py-1 px-2.5">
                        ⭐ Universal Red Blood Cell Donor (O−) Selected
                      </Badge>
                    )}
                    {result.isUniversalRecipient && (
                      <Badge variant="secondary" className="text-xs py-1 px-2.5 font-semibold">
                        ⭐ Universal Red Blood Cell Recipient (AB+) Selected
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mandatory Clinical Disclaimer */}
          <div className="rounded-lg bg-amber-50/80 border border-amber-200 p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-950 block">
                Clinical Safety & Educational Disclaimer:
              </span>
              <p className="text-amber-900 leading-relaxed">
                {RED_CELL_COMPATIBILITY_DISCLAIMER}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
