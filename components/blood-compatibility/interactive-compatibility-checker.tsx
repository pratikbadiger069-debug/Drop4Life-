"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  ALL_BLOOD_GROUPS,
  COMPATIBILITY_CLINICAL_DISCLAIMER,
} from "@/lib/constants";
import { BloodGroup, BloodComponent } from "@/lib/types";
import {
  getCompatibleDonors,
  getCompatibleRecipients,
  isUniversalDonor,
  isUniversalRecipient,
} from "@/lib/blood-compatibility";
import { Droplet, ArrowRight, ShieldCheck, Info, Check, HeartHandshake } from "lucide-react";

export function InteractiveBloodCompatibilityChecker() {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>("O+");
  const [component, setComponent] = useState<BloodComponent>("rbc");

  const compatibleDonors = getCompatibleDonors(selectedGroup, component);
  const compatibleRecipients = getCompatibleRecipients(selectedGroup, component);

  const isUnivDonor = isUniversalDonor(selectedGroup, component);
  const isUnivRecipient = isUniversalRecipient(selectedGroup, component);

  return (
    <Card className="border-red-200/80 shadow-md bg-white overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-50/70 via-rose-50/40 to-white border-b border-red-100 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-red-600 animate-pulse" />
              <Badge variant="destructive" className="text-xs">
                Interactive Transfusion Tool
              </Badge>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              ABO & Rh Blood Compatibility Checker
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-600 mt-1">
              Select any of the 8 blood groups and switch between Red Blood Cells and Plasma to view safe transfusion matches.
            </CardDescription>
          </div>

          {/* Component Toggle (RBC vs Plasma) */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 self-start sm:self-auto">
            <button
              type="button"
              id="component-rbc-tab"
              onClick={() => setComponent("rbc")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                component === "rbc"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Red Blood Cells (RBC)
            </button>
            <button
              type="button"
              id="component-plasma-tab"
              onClick={() => setComponent("plasma")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                component === "plasma"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Fresh Frozen Plasma
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Blood Group Selection Grid */}
        <div>
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5 block">
            Step 1: Choose Blood Group ({selectedGroup})
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {ALL_BLOOD_GROUPS.map((group) => {
              const isSelected = group === selectedGroup;
              return (
                <button
                  key={group}
                  type="button"
                  id={`blood-group-btn-${group.replace("+", "pos").replace("-", "neg")}`}
                  onClick={() => setSelectedGroup(group)}
                  className={`h-12 rounded-xl font-black text-sm transition-all border flex flex-col items-center justify-center relative ${
                    isSelected
                      ? "bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-400/40"
                      : "bg-slate-50 hover:bg-red-50 text-slate-800 border-slate-200 hover:border-red-300"
                  }`}
                >
                  <span>{group}</span>
                  {isSelected && (
                    <span className="absolute bottom-1 h-1 w-4 rounded-full bg-white/80" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Universal Status Indicators */}
        {(isUnivDonor || isUnivRecipient) && (
          <div className="flex flex-wrap gap-2">
            {isUnivDonor && (
              <Badge variant="success" className="gap-1.5 py-1 px-2.5 text-xs font-semibold">
                <Check className="w-3.5 h-3.5" />
                Universal {component === "rbc" ? "Red Cell" : "Plasma"} Donor
              </Badge>
            )}
            {isUnivRecipient && (
              <Badge variant="warning" className="gap-1.5 py-1 px-2.5 text-xs font-semibold">
                <Check className="w-3.5 h-3.5" />
                Universal {component === "rbc" ? "Red Cell" : "Plasma"} Recipient
              </Badge>
            )}
          </div>
        )}

        {/* Dual Results: Compatible Donors vs Compatible Recipients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Box 1: Can Receive From */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Can Receive {component === "rbc" ? "RBC" : "Plasma"} From
              </span>
              <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                {compatibleDonors.length} {compatibleDonors.length === 1 ? "group" : "groups"}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              When a patient is <strong className="text-slate-900">{selectedGroup}</strong>, they can safely receive from these donor groups:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {compatibleDonors.map((group) => (
                <span
                  key={group}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg font-black text-sm bg-white border border-red-200 text-red-700 shadow-xs"
                >
                  <Droplet className="w-3.5 h-3.5 fill-current mr-1 text-primary" />
                  {group}
                </span>
              ))}
            </div>
          </div>

          {/* Box 2: Can Donate To */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Can Donate {component === "rbc" ? "RBC" : "Plasma"} To
              </span>
              <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                {compatibleRecipients.length} {compatibleRecipients.length === 1 ? "group" : "groups"}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              When a donor is <strong className="text-slate-900">{selectedGroup}</strong>, their {component === "rbc" ? "red blood cells" : "plasma"} can be given to:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {compatibleRecipients.map((group) => (
                <span
                  key={group}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg font-black text-sm bg-white border border-emerald-200 text-emerald-800 shadow-xs"
                >
                  <Droplet className="w-3.5 h-3.5 fill-current mr-1 text-emerald-600" />
                  {group}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Component Scientific Note */}
        <div className="rounded-lg bg-blue-50/80 border border-blue-100 p-3 text-xs text-blue-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>Component Difference:</strong>{" "}
            {component === "rbc" ? (
              <span>
                In <strong>Red Blood Cell</strong> transfusions, O- is universal donor (lacks A, B, and Rh antigens), while AB+ is universal recipient.
              </span>
            ) : (
              <span>
                In <strong>Plasma</strong> transfusions, ABO compatibility is inverted because plasma contains antibodies: AB plasma lacks anti-A and anti-B antibodies, making <strong>AB universal plasma donor</strong>, and O recipients have no antigens, making <strong>O universal plasma recipient</strong>.
              </span>
            )}
          </div>
        </div>

        {/* Mandatory Clinical Disclaimer */}
        <Alert variant="warning" className="border-amber-300 bg-amber-50/80">
          <ShieldCheck className="h-4 w-4 text-amber-800" />
          <AlertTitle className="text-xs font-bold text-amber-950">
            Mandatory Clinical Disclaimer
          </AlertTitle>
          <AlertDescription className="text-xs text-amber-900 mt-1 leading-relaxed">
            {COMPATIBILITY_CLINICAL_DISCLAIMER}
          </AlertDescription>
        </Alert>

        {/* Fast Action CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t">
          <span className="text-xs text-slate-500">
            Need blood assistance or ready to register as a donor?
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link href="/register/donor" className="flex-1 sm:flex-none">
              <Button size="sm" variant="default" className="w-full text-xs font-bold gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Register as {selectedGroup} Donor</span>
              </Button>
            </Link>
            <Link href="/request-blood" className="flex-1 sm:flex-none">
              <Button size="sm" variant="outline" className="w-full text-xs font-bold gap-1.5">
                <span>Request {selectedGroup}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
