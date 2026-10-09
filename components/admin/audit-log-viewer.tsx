"use client";

import React, { useState } from "react";
import { AuditLogEntry, AuditActionType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  Search,
  Clock,
  Layers,
  Send,
  ShieldCheck,
  User,
  FileSpreadsheet,
  Lock,
} from "lucide-react";

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
}

export function AuditLogViewer({ logs }: AuditLogViewerProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");

  const filtered = logs.filter((log) => {
    if (selectedAction !== "ALL" && log.action !== selectedAction) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        log.details.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        (log.actorEmail && log.actorEmail.toLowerCase().includes(q)) ||
        (log.targetName && log.targetName.toLowerCase().includes(q)) ||
        log.targetId.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case "INVENTORY_CHANGE":
        return (
          <Badge variant="warning" className="text-[10px] gap-1">
            <Layers className="w-3 h-3" />
            Inventory Change
          </Badge>
        );
      case "REQUEST_STATUS_CHANGE":
        return (
          <Badge variant="destructive" className="text-[10px] gap-1">
            <Send className="w-3 h-3" />
            Request Status
          </Badge>
        );
      case "VERIFICATION_DECISION":
        return (
          <Badge variant="success" className="text-[10px] gap-1">
            <ShieldCheck className="w-3 h-3" />
            Verification
          </Badge>
        );
      case "USER_STATUS_CHANGE":
        return (
          <Badge variant="secondary" className="text-[10px] gap-1">
            <User className="w-3 h-3" />
            User Status
          </Badge>
        );
      case "REPORT_EXPORTED":
        return (
          <Badge variant="default" className="text-[10px] gap-1">
            <FileSpreadsheet className="w-3 h-3" />
            Report Exported
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[10px]">
            {action}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-red-500 focus:outline-none w-full sm:w-auto"
            aria-label="Filter by Audit Action"
          >
            <option value="ALL">All Audit Actions</option>
            <option value="INVENTORY_CHANGE">Inventory Changes</option>
            <option value="REQUEST_STATUS_CHANGE">Requisition Status</option>
            <option value="VERIFICATION_DECISION">Verification Decisions</option>
            <option value="USER_STATUS_CHANGE">User Account Status</option>
            <option value="REPORT_EXPORTED">Report Exports</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Ref</th>
                <th className="py-3 px-4">Audit Record Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No audit records match current search filter.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">{getActionBadge(log.action)}</td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.actorName}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Role: {log.actorRole}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.targetType}: {log.targetId}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
