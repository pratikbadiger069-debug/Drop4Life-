"use client";

import React from "react";
import { BloodInventoryItem } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ShieldCheck, Lock, AlertTriangle, Layers, Droplet } from "lucide-react";

interface InventorySummaryCardsProps {
  inventory: BloodInventoryItem[];
}

export function InventorySummaryCards({ inventory }: InventorySummaryCardsProps) {
  const totalAvailable = inventory.reduce((acc, item) => acc + item.availableUnits, 0);
  const totalReserved = inventory.reduce((acc, item) => acc + item.reservedUnits, 0);
  const totalQuarantined = inventory.reduce((acc, item) => acc + item.quarantinedUnits, 0);
  const totalExpired = inventory.reduce((acc, item) => acc + item.expiredUnits, 0);

  const criticalGroups = inventory.filter((item) => item.stockStatus === "CRITICAL_LOW");
  const lowStockGroups = inventory.filter((item) => item.stockStatus === "LOW_STOCK");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1: Total Available (Usable for Transfusions) */}
      <Card className="border-emerald-200 bg-white shadow-xs">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
              Available Units
            </p>
            <p className="text-xl font-black text-slate-900">
              {totalAvailable} Units
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold">
              Cleared for immediate transfusion
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2: Total Reserved Units */}
      <Card className="border-blue-200 bg-white shadow-xs">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
              Reserved for Surgery
            </p>
            <p className="text-xl font-black text-slate-900">
              {totalReserved} Units
            </p>
            <span className="text-[10px] text-blue-700 font-semibold">
              Crossmatched & allocated
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 3: Quarantined / In-Screening */}
      <Card className="border-amber-200 bg-white shadow-xs">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
              Quarantined / Testing
            </p>
            <p className="text-xl font-black text-slate-900">
              {totalQuarantined} Units
            </p>
            <span className="text-[10px] text-amber-800 font-medium">
              Isolated pending lab clearance
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 4: Shortage Alerts */}
      <Card className="border-red-200 bg-white shadow-xs">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700 font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
              Shortage Alerts
            </p>
            <p className="text-xl font-black text-red-700">
              {criticalGroups.length + lowStockGroups.length} Groups
            </p>
            <span className="text-[10px] text-red-600 font-medium">
              {criticalGroups.length} Critical ({criticalGroups.map((g) => g.bloodGroup).join(", ") || "None"})
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
