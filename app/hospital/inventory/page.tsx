"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { HOSPITAL_NAV_ITEMS } from "@/lib/constants";
import { HospitalProfile, BloodInventoryItem, InventoryAuditLog } from "@/lib/types";
import { hospitalService } from "@/lib/hospital/hospital-service";
import { InventorySummaryCards } from "@/components/hospital/inventory-summary-cards";
import { InventoryTable } from "@/components/hospital/inventory-table";
import { InventoryAdjustmentDialog } from "@/components/hospital/inventory-adjustment-dialog";
import { InventoryAuditLogView } from "@/components/hospital/inventory-audit-log-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, ShieldCheck, PlusCircle } from "lucide-react";

export default function HospitalInventoryPage() {
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

    async function loadInventory() {
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
        console.error("Failed to load inventory data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInventory();
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Clinical Blood Bank Register</Badge>
                <span className="text-xs text-slate-500 font-mono">
                  {profile?.hospitalName || "St. Jude Medical Center"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Blood Bank Inventory Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Track real-time whole blood & red cell units, reserve allocations, testing quarantine holds, and disposal logs.
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <InventorySummaryCards inventory={inventory} />

          {/* 8-Group Inventory Table Register */}
          <InventoryTable
            inventory={inventory}
            onSelectForEdit={(item) => setSelectedItemForEdit(item)}
          />

          {/* Audit Logs Trail */}
          <InventoryAuditLogView logs={auditLogs} />
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
