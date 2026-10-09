"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  medicalScreeningService,
  MEDICAL_SCREENING_DISCLAIMER,
} from "@/lib/screening/screening-service";
import { MedicalPreScreeningResponse } from "@/lib/types";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  X,
  FileText,
  Loader2,
  Info,
} from "lucide-react";

interface MedicalPrescreeningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (screening: MedicalPreScreeningResponse) => void;
  donorId?: string;
  contextTitle?: string;
}

export function MedicalPrescreeningDialog({
  isOpen,
  onClose,
  onSuccess,
  donorId,
  contextTitle = "Preliminary Donor Medical Pre-Screening",
}: MedicalPrescreeningDialogProps) {
  const [weightKg, setWeightKg] = useState<number>(65);
  const [hasRecentTravel, setHasRecentTravel] = useState<boolean>(false);
  const [travelDetails, setTravelDetails] = useState<string>("");
  const [hasRecentTattooOrPiercing, setHasRecentTattooOrPiercing] = useState<boolean>(false);
  const [hemoglobinKnown, setHemoglobinKnown] = useState<boolean>(false);
  const [hemoglobinLevel, setHemoglobinLevel] = useState<number>(13.5);
  const [currentMedications, setCurrentMedications] = useState<string>("None");
  const [takingHighRiskMedications, setTakingHighRiskMedications] = useState<boolean>(false);
  const [disclaimerAcknowledged, setDisclaimerAcknowledged] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<MedicalPreScreeningResponse | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!disclaimerAcknowledged) {
      setErrorMsg("Please acknowledge the clinical disclaimer before submitting.");
      return;
    }

    if (!weightKg || weightKg < 35 || weightKg > 200) {
      setErrorMsg("Please enter a realistic weight in kilograms (35-200 kg).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await medicalScreeningService.submitScreening(
        {
          weightKg: Number(weightKg),
          hasRecentTravel,
          travelDetails,
          hasRecentTattooOrPiercing,
          hemoglobinKnown,
          hemoglobinLevel: hemoglobinKnown ? Number(hemoglobinLevel) : undefined,
          currentMedications,
          takingHighRiskMedications,
          disclaimerAcknowledged,
        },
        donorId
      );

      setSubmittedResult(res);
      onSuccess(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit medical pre-screening.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prescreening-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="prescreening-title" className="text-lg font-bold">
                {contextTitle}
              </h2>
              <p className="text-xs text-red-100 mt-0.5">
                5-Question Preliminary Health Safety Checklist
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {submittedResult ? (
            <div className="space-y-4 py-2">
              <div
                className={`p-4 rounded-xl border ${
                  submittedResult.requiresProfessionalReview
                    ? "bg-amber-50 border-amber-200"
                    : "bg-emerald-50 border-emerald-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {submittedResult.requiresProfessionalReview ? (
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h3
                      className={`text-sm font-bold ${
                        submittedResult.requiresProfessionalReview
                          ? "text-amber-900"
                          : "text-emerald-900"
                      }`}
                    >
                      {submittedResult.requiresProfessionalReview
                        ? "Pre-Screening Complete: Professional Review Flagged"
                        : "Preliminary Pre-Screening Passed"}
                    </h3>
                    <p
                      className={`text-xs ${
                        submittedResult.requiresProfessionalReview
                          ? "text-amber-800"
                          : "text-emerald-800"
                      }`}
                    >
                      {submittedResult.requiresProfessionalReview
                        ? "One or more responses have been flagged for clinical review by blood bank personnel prior to donation."
                        : "Responses are within initial preliminary criteria. Final eligibility will be confirmed at the facility."}
                    </p>
                  </div>
                </div>

                {submittedResult.reviewFlags.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-amber-200/80 space-y-1">
                    <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">
                      Flags For Healthcare Personnel Review:
                    </span>
                    <ul className="list-disc pl-4 text-xs text-amber-900 space-y-1">
                      {submittedResult.reviewFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Legal Non-Certification Notice */}
              <Alert variant="info" className="bg-slate-50 border-slate-200">
                <Info className="h-4 w-4 text-slate-700" />
                <AlertTitle className="text-xs font-bold text-slate-900">
                  Mandatory Medical Confirmation Notice
                </AlertTitle>
                <AlertDescription className="text-xs text-slate-600 leading-relaxed mt-1">
                  {MEDICAL_SCREENING_DISCLAIMER}
                </AlertDescription>
              </Alert>

              <div className="pt-2 flex justify-end">
                <Button onClick={onClose} className="font-bold">
                  Continue to Donation Workflow
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Submission Error</AlertTitle>
                  <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
                </Alert>
              )}

              {/* Question 1: Weight */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="screen-weight" className="text-sm font-bold text-slate-900">
                    1. Recent Body Weight (kg)
                  </Label>
                  <Badge variant={weightKg >= 45 ? "success" : "destructive"}>
                    {weightKg >= 45 ? ">= 45 kg (Eligible)" : "< 45 kg (Underweight)"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  National blood donation standards in India require a minimum body weight of 45 kg.
                </p>
                <Input
                  id="screen-weight"
                  type="number"
                  min="35"
                  max="200"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  required
                  className="bg-white max-w-xs"
                />
              </div>

              {/* Question 2: Travel History */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    2. Recent Travel History (Past 6 Months)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHasRecentTravel(false)}
                      className={`px-3 py-1 text-xs rounded-lg font-bold border transition-colors ${
                        !hasRecentTravel
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      No Travel
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasRecentTravel(true)}
                      className={`px-3 py-1 text-xs rounded-lg font-bold border transition-colors ${
                        hasRecentTravel
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      Yes, Traveled
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Have you traveled outside India or to malaria-endemic zones in the last 6 months?
                </p>
                {hasRecentTravel && (
                  <Input
                    placeholder="Enter location/country visited (e.g. Northeast region, Southeast Asia)"
                    value={travelDetails}
                    onChange={(e) => setTravelDetails(e.target.value)}
                    className="bg-white mt-2"
                  />
                )}
              </div>

              {/* Question 3: Tattoos or Piercings */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    3. Tattoos or Body Piercings
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHasRecentTattooOrPiercing(false)}
                      className={`px-3 py-1 text-xs rounded-lg font-bold border transition-colors ${
                        !hasRecentTattooOrPiercing
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      No Tattoo &gt; 12 mo
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasRecentTattooOrPiercing(true)}
                      className={`px-3 py-1 text-xs rounded-lg font-bold border transition-colors ${
                        hasRecentTattooOrPiercing
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      Within Past 12 Months
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Have you gotten a tattoo, cosmetic ink, acupuncture, or ear/body piercing in the last 6 to 12 months?
                </p>
              </div>

              {/* Question 4: Hemoglobin Levels */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    4. Recent Hemoglobin Level (if known)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHemoglobinKnown(false)}
                      className={`px-3 py-1 text-xs rounded-lg font-bold border transition-colors ${
                        !hemoglobinKnown
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      Unknown (Test at Camp)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHemoglobinKnown(true)}
                      className={`px-3 py-1 text-xs rounded-lg font-bold border transition-colors ${
                        hemoglobinKnown
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      I Know My Level
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  The clinical minimum for voluntary whole blood donation is 12.5 g/dL. Blood banks perform a finger-prick test on site.
                </p>
                {hemoglobinKnown && (
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      type="number"
                      step="0.1"
                      min="6"
                      max="20"
                      value={hemoglobinLevel}
                      onChange={(e) => setHemoglobinLevel(Number(e.target.value))}
                      className="bg-white max-w-xs"
                    />
                    <span className="text-xs font-semibold text-slate-600">g/dL</span>
                  </div>
                )}
              </div>

              {/* Question 5: Current Medications */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="screen-meds" className="text-sm font-bold text-slate-900">
                    5. Current Medications or Treatment
                  </Label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={takingHighRiskMedications}
                      onChange={(e) => setTakingHighRiskMedications(e.target.checked)}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <span>Antibiotics / Blood Thinners</span>
                  </label>
                </div>
                <p className="text-xs text-slate-500">
                  List any prescription drugs, aspirin, or chronic therapy. Type "None" if healthy and unmedicated.
                </p>
                <Input
                  id="screen-meds"
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  placeholder="e.g. Paracetamol, Metformin, or None"
                  className="bg-white"
                />
              </div>

              {/* Mandatory Clinical Disclaimer Agreement */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-950 leading-relaxed font-medium">
                    {MEDICAL_SCREENING_DISCLAIMER}
                  </p>
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-amber-200/80">
                  <input
                    type="checkbox"
                    checked={disclaimerAcknowledged}
                    onChange={(e) => setDisclaimerAcknowledged(e.target.checked)}
                    required
                    className="mt-0.5 rounded border-amber-400 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-slate-900">
                    I acknowledge that this pre-screening does not certify fitness, and I will undergo mandatory in-person verification by qualified blood bank medical officers.
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !disclaimerAcknowledged}
                  className="font-bold gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating...</span>
                    </>
                  ) : (
                    <span>Submit & Proceed to Donation</span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
