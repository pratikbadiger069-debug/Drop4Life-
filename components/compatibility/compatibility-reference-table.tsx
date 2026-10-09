"use client";

import React, { useState } from "react";
import { BloodGroup } from "@/lib/types";
import { ALL_BLOOD_GROUPS } from "@/lib/constants";
import {
  canDonateRedCells,
  getCompatibleDonors,
  getCompatibleRecipients,
  BLOOD_GROUP_DIRECTORY,
  RED_CELL_COMPATIBILITY_DISCLAIMER,
} from "@/lib/blood-compatibility";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, ShieldAlert, Sparkles, HelpCircle, Layers, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function CompatibilityReferenceTable() {
  const [activeTab, setActiveTab] = useState<"recipient" | "donor" | "matrix">("recipient");
  const [highlightedGroup, setHighlightedGroup] = useState<BloodGroup | null>(null);

  return (
    <Card className="border-slate-200 shadow-md bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-red-100 text-red-800">
                <Layers className="w-4 h-4" />
              </span>
              <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                Red Blood Cell Compatibility Reference Table
              </CardTitle>
            </div>
            <CardDescription className="mt-1.5 text-xs sm:text-sm text-slate-600">
              Verified clinical standard reference guide for ABO and Rh(D) red blood cell transfusions across all eight blood groups.
            </CardDescription>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-lg self-start sm:self-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("recipient")}
              className={cn(
                "px-3 py-1.5 rounded-md transition-all",
                activeTab === "recipient"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Recipient View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("donor")}
              className={cn(
                "px-3 py-1.5 rounded-md transition-all",
                activeTab === "donor"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Donor View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("matrix")}
              className={cn(
                "px-3 py-1.5 rounded-md transition-all",
                activeTab === "matrix"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              8×8 Matrix
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Recipient View Tab */}
        {activeTab === "recipient" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Find your blood group below to see which donor groups you can receive red blood cells from.
            </p>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm" aria-label="Recipient Blood Compatibility Table">
                <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-700 tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3 border-b border-slate-200 w-36">
                      Recipient Group
                    </th>
                    <th scope="col" className="px-4 py-3 border-b border-slate-200">
                      Compatible Red Cell Donor Groups
                    </th>
                    <th scope="col" className="px-4 py-3 border-b border-slate-200 hidden md:table-cell">
                      Antigen Status & Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {ALL_BLOOD_GROUPS.map((recipient) => {
                    const compatibleDonors = getCompatibleDonors(recipient);
                    const isUniversal = recipient === "AB+";
                    const isOminus = recipient === "O-";

                    return (
                      <tr
                        key={`recip-row-${recipient}`}
                        className={cn(
                          "hover:bg-slate-50/80 transition-colors",
                          isUniversal && "bg-blue-50/30",
                          isOminus && "bg-rose-50/20"
                        )}
                      >
                        <td className="px-4 py-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-800 font-extrabold text-sm border border-red-200">
                              {recipient}
                            </span>
                            {isUniversal && (
                              <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
                                Universal Recipient
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {compatibleDonors.map((donor) => (
                              <span
                                key={`chip-${recipient}-${donor}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200"
                              >
                                <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                                <span>{donor}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 hidden md:table-cell">
                          {BLOOD_GROUP_DIRECTORY[recipient].antigensOnRedCells}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Donor View Tab */}
        {activeTab === "donor" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Find your blood group below to see which recipient groups can safely receive your red blood cells.
            </p>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm" aria-label="Donor Blood Compatibility Table">
                <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-700 tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3 border-b border-slate-200 w-36">
                      Donor Group
                    </th>
                    <th scope="col" className="px-4 py-3 border-b border-slate-200">
                      Can Donate Red Blood Cells To
                    </th>
                    <th scope="col" className="px-4 py-3 border-b border-slate-200 hidden md:table-cell">
                      Clinical Significance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {ALL_BLOOD_GROUPS.map((donor) => {
                    const compatibleRecipients = getCompatibleRecipients(donor);
                    const isUniversal = donor === "O-";

                    return (
                      <tr
                        key={`donor-row-${donor}`}
                        className={cn(
                          "hover:bg-slate-50/80 transition-colors",
                          isUniversal && "bg-emerald-50/40"
                        )}
                      >
                        <td className="px-4 py-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-700 text-white font-extrabold text-sm">
                              {donor}
                            </span>
                            {isUniversal && (
                              <Badge variant="success" className="text-[10px] hidden sm:inline-flex">
                                Universal Donor
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {compatibleRecipients.map((recip) => (
                              <span
                                key={`chip-give-${donor}-${recip}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200"
                              >
                                <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                                <span>{recip}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 hidden md:table-cell">
                          {isUniversal
                            ? "Essential in emergency trauma when recipient blood type is unknown."
                            : `${compatibleRecipients.length} of 8 standard blood groups can receive this group.`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8x8 Cross-Match Matrix Tab */}
        {activeTab === "matrix" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <p>
                Rows represent <strong>Recipient</strong> blood groups; Columns represent <strong>Donor</strong> blood groups.
              </p>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Compatible
                </span>
                <span className="inline-flex items-center gap-1 text-slate-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Incompatible
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-center text-xs" aria-label="8 by 8 Red Blood Cell Compatibility Matrix">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th scope="col" className="p-3 text-left font-bold text-xs bg-slate-950 border-r border-slate-800">
                      Recip. ↓ \ Donor →
                    </th>
                    {ALL_BLOOD_GROUPS.map((donor) => (
                      <th
                        key={`matrix-col-${donor}`}
                        scope="col"
                        className="p-2.5 font-extrabold text-xs sm:text-sm text-red-200 border-r border-slate-800 last:border-r-0"
                      >
                        {donor}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {ALL_BLOOD_GROUPS.map((recipient) => (
                    <tr
                      key={`matrix-row-${recipient}`}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <th
                        scope="row"
                        className="p-3 text-left font-bold text-slate-900 bg-slate-50 border-r border-slate-200 text-xs sm:text-sm"
                      >
                        {recipient}
                      </th>
                      {ALL_BLOOD_GROUPS.map((donor) => {
                        const isComp = canDonateRedCells(donor, recipient);
                        return (
                          <td
                            key={`matrix-cell-${recipient}-${donor}`}
                            className={cn(
                              "p-2 border-r border-slate-100 last:border-r-0 transition-colors",
                              isComp ? "bg-emerald-50/60 font-bold text-emerald-800" : "text-slate-300 bg-white"
                            )}
                            title={`Donor ${donor} to Recipient ${recipient}: ${isComp ? "Compatible" : "Incompatible"}`}
                          >
                            {isComp ? (
                              <div className="flex items-center justify-center gap-0.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                <span className="sr-only">Compatible</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center text-slate-300">
                                <X className="w-3 h-3 text-slate-300" />
                                <span className="sr-only">Incompatible</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
