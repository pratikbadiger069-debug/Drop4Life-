"use client";

import React, { useState } from "react";
import { CampaignParticipant } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, Clock, CheckCircle2, UserCheck, Heart } from "lucide-react";

interface CampaignParticipantListProps {
  participants: CampaignParticipant[];
  capacityLimit?: number;
}

export function CampaignParticipantList({
  participants,
  capacityLimit,
}: CampaignParticipantListProps) {
  const [filterRole, setFilterRole] = useState<string>("ALL");

  const filtered = participants.filter((p) => {
    if (filterRole !== "ALL" && p.participantRole !== filterRole) return false;
    return true;
  });

  const donorsCount = participants.filter((p) => p.participantRole === "donor").length;
  const volunteersCount = participants.filter(
    (p) => p.participantRole === "volunteer" || p.participantRole === "medical_volunteer"
  ).length;

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Total Registrations
          </span>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {participants.length}
            {capacityLimit && (
              <span className="text-xs font-normal text-slate-500 ml-1">
                / {capacityLimit} max
              </span>
            )}
          </div>
        </div>

        <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
          <span className="text-xs font-bold text-red-700 uppercase">
            Pledged Donors
          </span>
          <div className="text-xl font-black text-red-700 mt-0.5">{donorsCount}</div>
        </div>

        <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
          <span className="text-xs font-bold text-indigo-700 uppercase">
            Support Volunteers
          </span>
          <div className="text-xl font-black text-indigo-800 mt-0.5">{volunteersCount}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 border-b border-slate-200 pb-2">
        <Button
          size="sm"
          variant={filterRole === "ALL" ? "default" : "outline"}
          className={`text-xs h-7 ${filterRole === "ALL" ? "bg-red-700 hover:bg-red-800 text-white" : ""}`}
          onClick={() => setFilterRole("ALL")}
        >
          All Roles ({participants.length})
        </Button>
        <Button
          size="sm"
          variant={filterRole === "donor" ? "default" : "outline"}
          className={`text-xs h-7 ${filterRole === "donor" ? "bg-red-700 hover:bg-red-800 text-white" : ""}`}
          onClick={() => setFilterRole("donor")}
        >
          Donors ({donorsCount})
        </Button>
        <Button
          size="sm"
          variant={filterRole === "volunteer" ? "default" : "outline"}
          className={`text-xs h-7 ${filterRole === "volunteer" ? "bg-red-700 hover:bg-red-800 text-white" : ""}`}
          onClick={() => setFilterRole("volunteer")}
        >
          Volunteers ({volunteersCount})
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-xs">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No participants registered in this category yet.
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Role & Blood Group</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p.userName}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={p.participantRole === "donor" ? "destructive" : "secondary"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {p.participantRole === "donor"
                            ? "Donor"
                            : p.participantRole === "medical_volunteer"
                            ? "Medical"
                            : "Volunteer"}
                        </Badge>
                        {p.bloodGroup && (
                          <span className="font-mono font-bold text-slate-700">
                            {p.bloodGroup}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-mono">
                      <div>{p.userEmail}</div>
                      {p.userPhone && (
                        <div className="text-[11px] text-slate-400">{p.userPhone}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono">
                      {new Date(p.registeredAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {p.notes || "—"}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Badge variant="success" className="text-[10px] px-1.5 py-0">
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
