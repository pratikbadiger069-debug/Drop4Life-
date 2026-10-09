"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { otpVerificationService } from "@/lib/auth/otp-verification-service";
import { IdentityVerificationDetails } from "@/lib/types";
import {
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Info,
  CreditCard,
  KeyRound,
} from "lucide-react";

interface OtpVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (details: { phoneVerified: boolean; idDetails?: IdentityVerificationDetails }) => void;
  phoneNumber: string;
  userId?: string;
}

export function OtpVerificationDialog({
  isOpen,
  onClose,
  onVerified,
  phoneNumber,
  userId = "user-temp",
}: OtpVerificationDialogProps) {
  const [step, setStep] = useState<"otp" | "optional_id" | "success">("otp");
  const [otpCode, setOtpCode] = useState<string>("123456");
  const [otpDispatched, setOtpDispatched] = useState<boolean>(true);
  const [otpMessage, setOtpMessage] = useState<string>(
    "[DEMO SIMULATION] Verification code sent. Use test OTP: 123456. (No actual SMS is sent in demo mode)."
  );

  // Optional Aadhaar / ABHA
  const [idType, setIdType] = useState<"AADHAAR" | "ABHA">("AADHAAR");
  const [testSuffix, setTestSuffix] = useState<string>("5678");
  const [consentGiven, setConsentGiven] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [idResult, setIdResult] = useState<IdentityVerificationDetails | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await otpVerificationService.requestOtp(phoneNumber, "phone");
      setOtpDispatched(true);
      setOtpMessage(res.message);
      if (res.demoCode) {
        setOtpCode(res.demoCode);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to dispatch OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await otpVerificationService.verifyOtp(phoneNumber, otpCode);
      if (res.success) {
        setStep("optional_id");
      } else {
        setErrorMsg(res.error || "Invalid OTP code.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      setErrorMsg("Consent is required to proceed with identity verification.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await otpVerificationService.verifyGovernmentIdSimulated(
        userId,
        idType,
        testSuffix,
        consentGiven
      );
      setIdResult(res);
      setStep("success");
      onVerified({ phoneVerified: true, idDetails: res });
    } catch (err: any) {
      setErrorMsg(err.message || "Identity verification simulation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipId = () => {
    setStep("success");
    onVerified({ phoneVerified: true });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-dialog-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 id="otp-dialog-title" className="text-base font-bold text-white">
                OTP & Identity Verification
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="destructive" className="text-[10px] py-0 px-1.5 font-bold">
                  Demo Mode
                </Badge>
                <span className="text-xs text-slate-400">Simulated Sandbox</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Verification Notice</AlertTitle>
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {/* STEP 1: OTP Code Verification */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="rounded-xl bg-red-50/70 border border-red-100 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-red-900">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <span>Phone Number: {phoneNumber}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {otpMessage}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="otp-input" className="text-xs font-bold text-slate-700">
                  Enter 6-Digit OTP Code
                </Label>
                <Input
                  id="otp-input"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="font-mono text-center text-xl tracking-widest font-bold max-w-xs mx-auto"
                  required
                />
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Resend Test OTP
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={loading} className="font-bold">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify OTP Code"}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: Optional Aadhaar / ABHA Simulated Verification */}
          {step === "optional_id" && (
            <form onSubmit={handleVerifyId} className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Phone number verified successfully (Demo Simulation).</span>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900">
                      Optional Identity Badge (Aadhaar / ABHA)
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Optional
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  In demo mode, test ID verification using a 4-digit mock suffix. <strong>Never enter real Aadhaar numbers.</strong>
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIdType("AADHAAR")}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      idType === "AADHAAR"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    <span>Simulated Aadhaar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIdType("ABHA")}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      idType === "ABHA"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    <span>Simulated ABHA ID</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="id-suffix" className="text-xs font-medium text-slate-700">
                    Test 4-Digit Sample Suffix:
                  </Label>
                  <Input
                    id="id-suffix"
                    value={testSuffix}
                    onChange={(e) => setTestSuffix(e.target.value)}
                    placeholder="5678"
                    maxLength={4}
                    className="bg-white font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    Will generate masked badge: {idType === "AADHAAR" ? `XXXX-XXXX-${testSuffix || "1234"}` : `ABHA-91-${testSuffix || "1234"}`}
                  </p>
                </div>

                <label className="flex items-start gap-2 cursor-pointer pt-2 border-t border-slate-200">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs text-slate-700">
                    I give voluntary consent to simulate {idType} verification in this demo sandbox.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <Button type="button" variant="ghost" size="sm" onClick={handleSkipId}>
                  Skip Identity Badge
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || !consentGiven}
                  className="font-bold gap-1.5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Mock ID"}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Complete / Success */}
          {step === "success" && (
            <div className="space-y-4 text-center py-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Verification Complete
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Your contact verification has been verified in demo mode.
                </p>
              </div>

              {idResult && (
                <div className="p-3 bg-slate-50 rounded-xl border text-xs text-slate-700 space-y-1">
                  <div className="font-bold flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Badge: {idResult.idMaskedNumber}</span>
                  </div>
                  <p className="text-[11px] text-amber-700 font-medium">
                    [SIMULATED DEMO VERIFICATION] This test result does not represent actual UIDAI/ABDM government verification.
                  </p>
                </div>
              )}

              <Button onClick={onClose} className="w-full font-bold">
                Continue to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
