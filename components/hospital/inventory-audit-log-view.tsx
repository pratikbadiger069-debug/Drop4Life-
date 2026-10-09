"use client";

import React from "react";
import { InventoryAuditLog, InventoryAdjustmentReason } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, User, FileText, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

interface InventoryAuditLogViewProps {
  logs: InventoryAuditLog[];
}

export function InventoryAuditLogView({ logs }: InventoryAuditLogViewProps) {
  const getReasonBadge = (reason: InventoryAdjustmentReason) => {
    switch (reason) {
      case "DONATION_RECEIVED":
        return <Badge variant="success" className="text-[10px]">Donation Received</Badge>;
      case "TRANSFUSION_DISPATCH":
        return <Badge variant="destructive" className="text-[10px]">Transfusion Dispatch</Badge>;
      case "RESERVED_FOR_SURGERY":
        return <Badge variant="secondary" className="text-[10px]">Surgery Reserve Hold</Badge>;
      case "EXPIRED_DISPOSAL":
        return <Badge variant="destructive" className="text-[10px]">Expired Disposal</Badge>;
      case "QUARANTINE_ADJUSTMENT":
        return <Badge variant="warning" className="text-[10px]">Quarantine Adjustment</Badge>;
      case "ROUTINE_AUDIT":
      default:
        return <Badge variant="outline" className="text-[10px]">Routine Audit</Badge>;
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Inventory Transaction & Audit Trail
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Regulatory compliance log capturing responsible staff, timestamped changes, and clinical reasons.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No audit log records recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.slice(0, 8).map((log) => {
              const diffAvailable = log.newAvailable - log.previousAvailable;

              return (
                <div
                  key={log.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-800 font-extrabold text-xs border border-red-200 shrink-0">
                      {log.bloodGroup}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          Type {log.bloodGroup} Adjustment
                        </span>
                        {getReasonBadge(log.reason)}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span>
                          Available: <strong>{log.previousAvailable}</strong> →{" "}
                          <strong className="text-slate-900">{log.newAvailable}</strong>
                        </span>
                        {diffAvailable !== 0 && (
                          <span
                            className={
                              diffAvailable > 0
                                ? "text-emerald-700 font-bold text-[11px]"
                                : "text-red-700 font-bold text-[11px]"
                            }
                          >
                            ({diffAvailable > 0 ? `+${diffAvailable}` : diffAvailable} units)
                          </span>
                        )}
                      </div>

                      {log.notes && (
                        <p className="text-[11px] text-slate-500 italic">
                          &ldquo;{log.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-[11px] space-y-0.5">
                    <span className="text-slate-600 block flex items-center sm:justify-end gap-1 font-medium">
                      <User className="w-3 h-3 text-slate-400" />
                      {log.staffName}
                    </span>
                    <span className="text-slate-400 block font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
