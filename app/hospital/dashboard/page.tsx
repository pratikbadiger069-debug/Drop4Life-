"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { HOSPITAL_NAV_ITEMS, APP_CONFIG } from "@/lib/constants";
import { HospitalProfile, BloodInventoryItem, InventoryAuditLog } from "@/lib/types";
import { hospitalService } from "@/lib/hospital/hospital-service";
import { InventorySummaryCards } from "@/components/hospital/inventory-summary-cards";
import { InventoryTable } from "@/components/hospital/inventory-table";
import { InventoryAdjustmentDialog } from "@/components/hospital/inventory-adjustment-dialog";
import { InventoryAuditLogView } from "@/components/hospital/inventory-audit-log-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Activity,
  Layers,
  ShieldAlert,
  Building2,
  PhoneCall,
  Clock,
  Send,
  AlertTriangle,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function HospitalDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<InventoryAuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<BloodInventoryItem | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const currentUserId = user.id;
    let isMounted = true;

    async function loadData() {
      try {
        const [prof, inv, logs] = await Promise.all([
          hospitalService.getHospitalProfile(currentUserId),
          hospitalService.getBloodInventory(currentUserId),
          hospitalService.getInventoryAuditLogs(currentUserId),
        ]);
        if (isMounted) {
          setProfile(prof);
          setInventory(inv);
          setAuditLogs(logs);
        }
      } catch (err) {
        console.error("Failed to load hospital data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleAdjustmentSuccess = (updatedItem: BloodInventoryItem, newAuditLog: InventoryAuditLog) => {
    setInventory((prev) =>
      prev.map((i) => (i.bloodGroup === updatedItem.bloodGroup ? updatedItem : i))
    );
    setAuditLogs((prev) => [newAuditLog, ...prev]);
  };

  const criticalShortages = inventory.filter((item) => item.stockStatus === "CRITICAL_LOW");

  return (
    <ProtectedRoute allowedRoles={["hospital", "admin"]}>
      <DashboardShell
        role="hospital"
        userName={profile?.contactPerson || user?.fullName || "Hospital Staff"}
        userEmail={profile?.workEmail || user?.email || "hospital@drop4life.org"}
        navItems={HOSPITAL_NAV_ITEMS}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Hospital Portal (Phase 6 Active)</Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {profile?.licenseNumber || "NY-MED-884210-A"}
                </span>
                {profile?.isVerified && (
                  <Badge variant="success" className="text-[10px] gap-1 font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Facility
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {profile?.hospitalName || "St. Jude Medical Center"} — Command Radar
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Department: <strong>{profile?.department || "Transfusion Medicine Blood Bank"}</strong> • City: <strong>{profile?.city || "New York"}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/hospital/inventory">
                <Button size="sm" variant="outline" className="font-semibold text-xs gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Full Inventory</span>
                </Button>
              </Link>
              <Link href="/find-blood">
                <Button size="sm" variant="default" className="font-bold text-xs">
                  Public Radar
                </Button>
              </Link>
            </div>
          </div>

          {/* Critical Shortage Warning Banner (If Any Critical Stocks Exist) */}
          {criticalShortages.length > 0 && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-red-950">
                    Critical Blood Inventory Shortage Detected
                  </h3>
                  <p className="text-xs text-red-800">
                    The following blood groups have fallen below safety minimums:{" "}
                    <strong>{criticalShortages.map((g) => `Type ${g.bloodGroup} (${g.availableUnits} units available)`).join(", ")}</strong>.
                  </p>
                </div>
              </div>

              <Link href="/find-blood" className="self-start sm:self-center">
                <Button size="sm" variant="destructive" className="font-bold text-xs">
                  Review Emergency Demands
                </Button>
              </Link>
            </div>
          )}

          {/* KPI Cards */}
          <InventorySummaryCards inventory={inventory} />

          {/* 8-Group Inventory Table Register */}
          <InventoryTable
            inventory={inventory}
            onSelectForEdit={(item) => setSelectedItemForEdit(item)}
          />

          {/* Audit Logs Trail */}
          <InventoryAuditLogView logs={auditLogs} />

          {/* Quarantine & Expiry Clinical Integrity Notice */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-slate-900 font-bold">
                Clinical Storage & Regulatory Isolation Protocol:
              </strong>
              <p>
                Under clinical blood banking guidelines, units undergoing viral serology or infectious screening are stored in separate temperature-monitored quarantine compartments. Units marked as quarantined or expired are mathematically excluded from usable transfusion tallies.
              </p>
            </div>
          </div>
        </div>

        {/* Modal: Adjust Inventory */}
        {profile && (
          <InventoryAdjustmentDialog
            isOpen={Boolean(selectedItemForEdit)}
            onClose={() => setSelectedItemForEdit(null)}
            hospitalId={profile.userId}
            item={selectedItemForEdit}
            staffName={profile.contactPerson || user?.fullName || "Staff Member"}
            onSuccess={handleAdjustmentSuccess}
          />
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
