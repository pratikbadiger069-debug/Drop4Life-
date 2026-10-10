"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  communicationService,
  maskPhoneNumber,
  InitiateMaskedCallResult,
} from "@/lib/communication/communication-service";
import {
  PhoneCall,
  PhoneOff,
  ShieldCheck,
  Lock,
  X,
  Loader2,
  Volume2,
  MessageSquare,
} from "lucide-react";

interface MaskedCallingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetRole: string;
  rawPhone?: string;
}

export function MaskedCallingDialog({
  isOpen,
  onClose,
  targetName,
  targetRole,
  rawPhone = "+91 98765 00001",
}: MaskedCallingDialogProps) {
  const [callingState, setCallingState] = useState<"idle" | "connecting" | "active" | "ended">("idle");
  const [callDetails, setCallDetails] = useState<InitiateMaskedCallResult | null>(null);

  if (!isOpen) return null;

  const masked = maskPhoneNumber(rawPhone);

  const startCall = async () => {
    setCallingState("connecting");
    try {
      const res = await communicationService.initiateMaskedCall(rawPhone, `${targetName} (${targetRole})`);
      setCallDetails(res);
      setCallingState("active");
    } catch {
      setCallingState("idle");
    }
  };

  const endCall = () => {
    setCallingState("ended");
    setTimeout(() => {
      onClose();
      setCallingState("idle");
      setCallDetails(null);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="masked-call-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 id="masked-call-title" className="text-base font-bold text-white">
                Privacy-Protected Masked Call
              </h2>
              <p className="text-xs text-slate-400">
                Number Masking & Virtual Voice Bridge
              </p>
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
        <div className="p-6 space-y-5 text-center">
          {/* Simulation Watermark Banner */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>[SIMULATED DEMO] No Actual Cellular Call Placed</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900">{targetName}</h3>
            <p className="text-xs font-semibold text-slate-500">{targetRole}</p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg font-mono text-sm font-bold text-slate-800">
                {masked}
              </span>
            </div>
          </div>

          {callingState === "idle" && (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Your direct mobile number and the recipient&apos;s phone number are strictly protected. Both parties connect through a virtual proxy bridge.
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" onClick={onClose} className="text-xs">
                  Cancel
                </Button>
                <Button
                  onClick={startCall}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-xs"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Start Masked Call (Demo)</span>
                </Button>
              </div>
            </div>
          )}

          {callingState === "connecting" && (
            <div className="space-y-4 py-4">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
              <p className="text-xs font-medium text-slate-600">
                Allocating virtual bridge relay...
              </p>
            </div>
          )}

          {callingState === "active" && callDetails && (
            <div className="space-y-4 py-2">
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto animate-pulse">
                <Volume2 className="w-8 h-8" />
              </div>
              <div className="rounded-xl bg-slate-50 border p-3 text-left space-y-1">
                <p className="text-xs font-bold text-slate-900">
                  Virtual Relay Active (Simulated):
                </p>
                <p className="text-[11px] font-mono text-slate-600">
                  Bridge: {callDetails.virtualProxyNumber}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Privacy guaranteed: Real numbers hidden.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={endCall}
                className="w-full font-bold gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Disconnect Call</span>
              </Button>
            </div>
          )}

          {callingState === "ended" && (
            <div className="py-4 space-y-2">
              <PhoneOff className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Call Disconnected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
