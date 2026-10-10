"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { BLOOD_BANK_NAV_ITEMS, ALL_BLOOD_GROUPS } from "@/lib/constants";
import { BloodInventoryItem, BloodGroup, BloodComponent } from "@/lib/types";
import { hospitalService } from "@/lib/hospital/hospital-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Building2,
  Droplet,
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  TrendingDown,
  Clock,
  PlusCircle,
  Edit3,
  Calendar,
  ShieldCheck,
  Activity,
  Loader2,
  XCircle,
} from "lucide-react";

export default function BloodBankDashboardPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<BloodInventoryItem | null>(null);
  const [newAvailable, setNewAvailable] = useState<number>(0);
  const [updateReason, setUpdateReason] = useState<string>("Routine inventory audit update");
  const [updating, setUpdating] = useState<boolean>(false);

  const bloodBankId = user?.id || "usr-bb-006";

  const loadInventory = async () => {
    try {
      const items = await hospitalService.getInventory(bloodBankId);
      setInventory(items);
    } catch (e) {
      console.error("Failed to load blood bank inventory", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const items = await hospitalService.getInventory(bloodBankId);
        setInventory(items);
      } catch (e) {
        console.error("Failed to load blood bank inventory", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [bloodBankId]);

  const handleOpenUpdate = (item: BloodInventoryItem) => {
    setSelectedItem(item);
    setNewAvailable(item.availableUnits);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setUpdating(true);
    try {
      await hospitalService.updateBloodInventory(bloodBankId, {
        bloodGroup: selectedItem.bloodGroup,
        availableUnits: Number(newAvailable),
        reservedUnits: selectedItem.reservedUnits,
        quarantinedUnits: selectedItem.quarantinedUnits,
        expiredUnits: selectedItem.expiredUnits,
        reason: "ROUTINE_AUDIT",
        notes: updateReason || "Routine inventory level adjustment",
      });
      setSelectedItem(null);
      await loadInventory();
    } catch (err) {
      console.error("Failed to update inventory", err);
    } finally {
      setUpdating(false);
    }
  };

  const totalAvailable = inventory.reduce((sum, item) => sum + item.availableUnits, 0);
  const lowStockGroups = inventory.filter(
    (item) => item.stockStatus === "LOW_STOCK" || item.stockStatus === "CRITICAL_LOW"
  );
  const totalReserved = inventory.reduce((sum, item) => sum + item.reservedUnits, 0);

  return (
    <ProtectedRoute allowedRoles={["bloodbank", "hospital", "admin"]}>
      <DashboardShell
        role="bloodbank"
        userName={user?.fullName || "Dr. Sneha Nair"}
        userEmail={user?.email || "bloodbank@drop4life.org"}
        navItems={BLOOD_BANK_NAV_ITEMS}
      >
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Blood Bank Operations Portal</Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  License: <strong>CDSCO-BB-MH-2024-9182</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {user?.organizationName || "Red Cross Central Blood Bank"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Manage 8-group stock levels, monitor shortages and shelf-life, and maintain audit records.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/blood-compatibility">
                <Button variant="outline" size="sm" className="font-semibold text-xs gap-1.5 bg-white">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span>Transfusion Guidelines</span>
                </Button>
              </Link>
              <Link href="/find-blood">
                <Button size="sm" variant="default" className="font-bold text-xs gap-1.5">
                  <Droplet className="w-3.5 h-3.5" />
                  <span>Incoming Requisitions</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-red-100 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-red-100 text-primary flex items-center justify-center font-bold">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Total Available Units</p>
                  <p className="text-2xl font-black text-slate-900">{totalAvailable} Units</p>
                  <span className="text-[10px] text-slate-500">Across 8 ABO/Rh Groups</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-100 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Shortage Warnings</p>
                  <p className="text-2xl font-black text-amber-700">{lowStockGroups.length} Groups</p>
                  <span className="text-[10px] text-amber-800 font-medium">Below threshold reserves</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Reserved Units</p>
                  <p className="text-2xl font-black text-slate-900">{totalReserved} Units</p>
                  <span className="text-[10px] text-slate-500">Allocated for surgery / trauma</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 8-Group Inventory Table */}
          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                    Component Inventory & Stock Status
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Live stock by blood group. Click &ldquo;Adjust Stock&rdquo; to log clinical updates with staff identity.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-semibold">
                  8-Group Matrix
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Loading blood bank inventory...
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b bg-slate-50/80 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                      <th className="p-4">Blood Group</th>
                      <th className="p-4">Available Units</th>
                      <th className="p-4">Reserved</th>
                      <th className="p-4">Quarantined / Untested</th>
                      <th className="p-4">Stock Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.map((item) => (
                      <tr key={item.bloodGroup} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-black text-sm text-slate-900 flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-primary border border-red-200">
                            {item.bloodGroup}
                          </span>
                          <span>Type {item.bloodGroup}</span>
                        </td>
                        <td className="p-4 font-extrabold text-sm text-slate-900">
                          {item.availableUnits} units
                        </td>
                        <td className="p-4 text-slate-600 font-medium">
                          {item.reservedUnits} units
                        </td>
                        <td className="p-4 text-slate-600">
                          {item.quarantinedUnits} units
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              item.stockStatus === "CRITICAL_LOW"
                                ? "destructive"
                                : item.stockStatus === "LOW_STOCK"
                                ? "warning"
                                : item.stockStatus === "SURPLUS"
                                ? "success"
                                : "default"
                            }
                            className="text-[10px] py-0.5 px-2"
                          >
                            {item.stockStatus.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenUpdate(item)}
                            className="text-xs font-bold gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Adjust</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Modal: Adjust Units */}
          {selectedItem && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
              role="dialog"
              aria-modal="true"
            >
              <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-primary font-black text-sm">
                      {selectedItem.bloodGroup}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      Adjust Type {selectedItem.bloodGroup} Stock
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveUpdate} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="adjust-available" className="text-xs font-semibold">
                      New Available Units Count
                    </Label>
                    <Input
                      id="adjust-available"
                      type="number"
                      min="0"
                      max="500"
                      value={newAvailable}
                      onChange={(e) => setNewAvailable(Number(e.target.value))}
                      required
                      className="text-sm font-bold font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="adjust-reason" className="text-xs font-semibold">
                      Reason for Adjustment / Audit Note
                    </Label>
                    <Input
                      id="adjust-reason"
                      value={updateReason}
                      onChange={(e) => setUpdateReason(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedItem(null)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={updating} className="font-bold">
                      {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Audit Record"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
