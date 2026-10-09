"use client";

import React, { useState } from "react";
import { OrganizationVerificationItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Activity,
  ShieldCheck,
  XCircle,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface VerificationTableProps {
  items: OrganizationVerificationItem[];
  onDecision: (
    userId: string,
    decision: "verified" | "rejected",
    reason?: string
  ) => Promise<void>;
}

export function VerificationTable({ items = [], onDecision }: VerificationTableProps) {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [activeItem, setActiveItem] = useState<OrganizationVerificationItem | null>(null);
  const [decisionType, setDecisionType] = useState<"verified" | "rejected" | null>(null);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filtered = items.filter((item) => {
    if (filterType !== "ALL" && item.type !== filterType) return false;
    if (filterStatus !== "ALL" && item.verificationStatus !== filterStatus) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        item.name.toLowerCase().includes(q) ||
        item.contactPerson.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.licenseOrRegId.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenDecisionModal = (
    item: OrganizationVerificationItem,
    type: "verified" | "rejected"
  ) => {
    setActiveItem(item);
    setDecisionType(type);
    setReason(
      type === "verified"
        ? "Institutional registry license verified with official authority records."
        : "Incomplete documentation or unverified license number."
    );
  };

  const handleConfirmDecision = async () => {
    if (!activeItem || !decisionType) return;
    setIsSubmitting(true);
    try {
      await onDecision(activeItem.userId, decisionType, reason);
      setActiveItem(null);
      setDecisionType(null);
      setReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            placeholder="Search organization or license..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-red-500 focus:outline-none"
            aria-label="Filter by Organization Type"
          >
            <option value="ALL">All Org Types</option>
            <option value="hospital">Hospitals Only</option>
            <option value="ngo">NGOs Only</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-red-500 focus:outline-none"
            aria-label="Filter by Verification Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="verified">Verified Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">License / Reg ID</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">City / Area</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No organization records matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{item.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={item.type === "hospital" ? "destructive" : "warning"}
                        className="text-[10px] uppercase font-bold"
                      >
                        {item.type}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {item.licenseOrRegId}
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      <div>{item.contactPerson}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.phone}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">{item.city}</td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          item.verificationStatus === "verified"
                            ? "success"
                            : item.verificationStatus === "rejected"
                            ? "secondary"
                            : "warning"
                        }
                        className="text-[10px] font-semibold"
                      >
                        {item.verificationStatus.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.verificationStatus !== "verified" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2 font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                            onClick={() => handleOpenDecisionModal(item, "verified")}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </Button>
                        )}
                        {item.verificationStatus !== "rejected" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 px-2 font-semibold text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleOpenDecisionModal(item, "rejected")}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal */}
      {activeItem && decisionType && (
        <Dialog
          isOpen={true}
          onClose={() => setActiveItem(null)}
          title={decisionType === "verified" ? "Approve Organization Verification" : "Reject Organization Application"}
          description={`Record authorized governance decision for ${activeItem.name} (${activeItem.type.toUpperCase()}).`}
          className="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div>
                <strong>Organization:</strong> {activeItem.name}
              </div>
              <div>
                <strong>Registration / License:</strong> {activeItem.licenseOrRegId}
              </div>
              <div>
                <strong>Contact:</strong> {activeItem.contactPerson} ({activeItem.email})
              </div>
            </div>

            <div>
              <Label htmlFor="decision-notes" className="font-bold text-slate-800 text-xs">
                Governance Decision Notes & Justification *
              </Label>
              <Input
                id="decision-notes"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 text-xs"
                placeholder="Specify verification confirmation or rejection rationale..."
                required
              />
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveItem(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className={
                  decisionType === "verified"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    : "bg-red-700 hover:bg-red-800 text-white font-bold"
                }
                onClick={handleConfirmDecision}
                disabled={isSubmitting || !reason.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Processing...
                  </>
                ) : decisionType === "verified" ? (
                  "Confirm Verification"
                ) : (
                  "Confirm Rejection"
                )}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
