"use client";

import React from "react";
import Link from "next/link";
import { DonationRecord } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, CheckCircle2, FileText, ArrowRight, Droplet, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentDonationsWidgetProps {
  records: DonationRecord[];
  onOpenLogModal?: () => void;
}

export function RecentDonationsWidget({
  records,
  onOpenLogModal,
}: RecentDonationsWidgetProps) {
  const recentRecords = records.slice(0, 3);

  const getStatusBadge = (status: DonationRecord["recordStatus"]) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge variant="success" className="text-[10px] gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            Verified Record
          </Badge>
        );
      case "PENDING_REVIEW":
        return (
          <Badge variant="warning" className="text-[10px] font-bold">
            Hospital Reviewing
          </Badge>
        );
      case "SELF_REPORTED":
      default:
        return (
          <Badge variant="secondary" className="text-[10px] font-medium text-slate-700 bg-slate-100">
            Self-Reported
          </Badge>
        );
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Recent Donation History
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Verified hospital records and donor-logged donation milestones.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          {onOpenLogModal && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenLogModal}
              className="text-xs h-8 gap-1 border-slate-300 font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Donation</span>
            </Button>
          )}
          <Link href="/donor/donations">
            <Button variant="ghost" size="sm" className="text-xs h-8 text-primary hover:text-red-800 gap-1 font-semibold">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {recentRecords.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-500">
              <Droplet className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">
              No Donation Records Logged Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your donation history will appear here once verified by a healthcare partner or logged by you.
            </p>
            {onOpenLogModal && (
              <div className="pt-2">
                <Button size="sm" variant="default" onClick={onOpenLogModal} className="text-xs font-bold">
                  Log Your First Donation
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-800 font-black text-sm shrink-0 border border-red-100">
                    {rec.bloodGroup}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">
                        {rec.facilityName}
                      </h4>
                      {getStatusBadge(rec.recordStatus)}
                    </div>
                    <p className="text-xs text-slate-500">
                      <span>{rec.facilityCity}</span> •{" "}
                      <span>{rec.donationType.replace("_", " ")}</span> •{" "}
                      <span className="font-semibold text-slate-700">{rec.units} Unit{rec.units === 1 ? "" : "s"}</span>
                    </p>
                    {rec.referenceNumber && (
                      <p className="text-[11px] text-slate-400 font-mono">
                        Ref: {rec.referenceNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs">
                  <span className="text-slate-500 block">Date</span>
                  <span className="font-bold text-slate-800">{rec.donationDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
