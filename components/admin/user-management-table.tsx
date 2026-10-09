"use client";

import React, { useState } from "react";
import { ManagedUserRecord, UserRole } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Shield,
  Heart,
  Building2,
  Activity,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface UserManagementTableProps {
  users: ManagedUserRecord[];
  onToggleStatus: (
    userId: string,
    newStatus: "active" | "suspended",
    reason?: string
  ) => Promise<void>;
}

export function UserManagementTable({ users, onToggleStatus }: UserManagementTableProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const [activeUser, setActiveUser] = useState<ManagedUserRecord | null>(null);
  const [actionStatus, setActionStatus] = useState<"active" | "suspended" | null>(null);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filtered = users.filter((u) => {
    if (filterRole !== "ALL" && u.role !== filterRole) return false;
    if (filterStatus !== "ALL" && u.status !== filterStatus) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.organizationName && u.organizationName.toLowerCase().includes(q)) ||
        (u.city && u.city.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleOpenActionModal = (u: ManagedUserRecord, nextStatus: "active" | "suspended") => {
    setActiveUser(u);
    setActionStatus(nextStatus);
    setReason(
      nextStatus === "suspended"
        ? "Administrative compliance flag or security hold."
        : "Administrative verification complete; account restored."
    );
  };

  const handleConfirmAction = async () => {
    if (!activeUser || !actionStatus) return;
    setIsSubmitting(true);
    try {
      await onToggleStatus(activeUser.id, actionStatus, reason);
      setActiveUser(null);
      setActionStatus(null);
      setReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "donor":
        return <Heart className="w-3 h-3 text-red-600 fill-red-600" />;
      case "hospital":
        return <Activity className="w-3 h-3 text-red-700" />;
      case "ngo":
        return <Building2 className="w-3 h-3 text-amber-700" />;
      case "admin":
        return <Shield className="w-3 h-3 text-indigo-700" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            placeholder="Search by name, email, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-red-500 focus:outline-none"
            aria-label="Filter by Role"
          >
            <option value="ALL">All Roles</option>
            <option value="donor">Donors Only</option>
            <option value="hospital">Hospitals Only</option>
            <option value="ngo">NGOs Only</option>
            <option value="admin">Administrators Only</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-red-500 focus:outline-none"
            aria-label="Filter by Account Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">User / Organization</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No user accounts match current search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      {u.organizationName && (
                        <div className="text-[11px] text-slate-600">{u.organizationName}</div>
                      )}
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-semibold capitalize">
                        {getRoleIcon(u.role)}
                        <span>{u.role}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">{u.city || "—"}</td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          u.verificationStatus === "verified" || u.verificationStatus === "active"
                            ? "success"
                            : u.verificationStatus === "rejected"
                            ? "secondary"
                            : "warning"
                        }
                        className="text-[10px] font-semibold"
                      >
                        {u.verificationStatus?.toUpperCase() || "PENDING"}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={u.status === "active" ? "default" : "destructive"}
                        className="text-[10px] uppercase font-bold"
                      >
                        {u.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {u.role !== "admin" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className={`text-xs h-7 px-2 font-semibold ${
                            u.status === "active"
                              ? "text-red-700 hover:text-red-800 hover:bg-red-50 border-red-200"
                              : "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                          }`}
                          onClick={() =>
                            handleOpenActionModal(
                              u,
                              u.status === "active" ? "suspended" : "active"
                            )
                          }
                        >
                          {u.status === "active" ? (
                            <>
                              <UserX className="w-3.5 h-3.5 mr-1" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {activeUser && actionStatus && (
        <Dialog
          isOpen={true}
          onClose={() => setActiveUser(null)}
          title={actionStatus === "suspended" ? "Suspend User Account" : "Reactivate User Account"}
          description={`Change operational access status for ${activeUser.fullName} (${activeUser.email}).`}
          className="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div>
                <strong>Account:</strong> {activeUser.fullName}
              </div>
              <div>
                <strong>Email:</strong> {activeUser.email}
              </div>
              <div>
                <strong>Current Status:</strong> {activeUser.status.toUpperCase()}
              </div>
            </div>

            <div>
              <Label htmlFor="status-reason" className="font-bold text-slate-800 text-xs">
                Administrative Reason & Audit Note *
              </Label>
              <Input
                id="status-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 text-xs"
                placeholder="Specify justification for audit logging..."
                required
              />
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveUser(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className={
                  actionStatus === "suspended"
                    ? "bg-red-700 hover:bg-red-800 text-white font-bold"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                }
                onClick={handleConfirmAction}
                disabled={isSubmitting || !reason.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Updating...
                  </>
                ) : actionStatus === "suspended" ? (
                  "Confirm Suspension"
                ) : (
                  "Confirm Activation"
                )}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
