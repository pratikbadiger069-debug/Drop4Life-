"use client";

import React, { useState, useMemo } from "react";
import { BloodGroup, BloodInventoryItem, StockStatus } from "@/lib/types";
import { ALL_BLOOD_GROUPS, STOCK_STATUS_CONFIG } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Layers,
  Search,
  Filter,
  Edit,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryTableProps {
  inventory: BloodInventoryItem[];
  onSelectForEdit: (item: BloodInventoryItem) => void;
}

export function InventoryTable({ inventory, onSelectForEdit }: InventoryTableProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      if (selectedGroup !== "ALL" && item.bloodGroup !== selectedGroup) {
        return false;
      }
      if (selectedStatus !== "ALL" && item.stockStatus !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchesGroup = item.bloodGroup.toLowerCase().includes(query);
        const matchesStaff = item.lastUpdatedByStaffName?.toLowerCase().includes(query);
        if (!matchesGroup && !matchesStaff) return false;
      }
      return true;
    });
  }, [inventory, selectedGroup, selectedStatus, searchQuery]);

  const handleResetFilters = () => {
    setSelectedGroup("ALL");
    setSelectedStatus("ALL");
    setSearchQuery("");
  };

  const getStatusBadge = (status: StockStatus) => {
    const config = STOCK_STATUS_CONFIG[status];
    return (
      <Badge variant={config?.badgeVariant || "default"} className="text-xs font-bold px-2 py-0.5">
        {config?.label || status}
      </Badge>
    );
  };

  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Blood Bank Inventory Register (8 ABO/Rh Groups)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Live stock levels with physical quarantine and reserved surgery allocations.
            </CardDescription>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[160px]">
              <Input
                placeholder="Search group or staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs pr-7"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Blood Group Filter */}
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-2 focus:ring-primary"
              aria-label="Filter by Blood Group"
            >
              <option value="ALL">All Groups</option>
              {ALL_BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  Type {bg}
                </option>
              ))}
            </select>

            {/* Stock Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-2 focus:ring-primary"
              aria-label="Filter by Stock Status"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="CRITICAL_LOW">Critical Shortage</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="ADEQUATE">Adequate Reserve</option>
              <option value="SURPLUS">High Reserve</option>
            </select>

            {(selectedGroup !== "ALL" || selectedStatus !== "ALL" || searchQuery.trim() !== "") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 text-xs text-slate-500 hover:text-slate-800 px-2"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredItems.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-400">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">
              No Blood Inventory Records Match Filters
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query or reset the blood group filter.
            </p>
            <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm" aria-label="Hospital Blood Bank Inventory Table">
              <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-700 tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3 border-b border-slate-200">
                    Blood Group
                  </th>
                  <th scope="col" className="px-4 py-3 border-b border-slate-200">
                    Available (Usable)
                  </th>
                  <th scope="col" className="px-4 py-3 border-b border-slate-200">
                    Reserved
                  </th>
                  <th scope="col" className="px-4 py-3 border-b border-slate-200">
                    Quarantined / Untested
                  </th>
                  <th scope="col" className="px-4 py-3 border-b border-slate-200">
                    Expired / Disposal
                  </th>
                  <th scope="col" className="px-4 py-3 border-b border-slate-200">
                    Stock Status
                  </th>
                  <th scope="col" className="px-4 py-3 border-b border-slate-200 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredItems.map((item) => {
                  const isCritical = item.stockStatus === "CRITICAL_LOW";
                  const isLow = item.stockStatus === "LOW_STOCK";
                  const totalCount = item.availableUnits + item.reservedUnits + item.quarantinedUnits + item.expiredUnits;

                  return (
                    <tr
                      key={item.bloodGroup}
                      className={cn(
                        "hover:bg-slate-50/80 transition-colors",
                        isCritical && "bg-red-50/25",
                        isLow && "bg-amber-50/20"
                      )}
                    >
                      {/* Blood Group */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-800 font-black text-sm border border-red-200 shadow-xs">
                            {item.bloodGroup}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                              Type {item.bloodGroup}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Threshold: {item.lowStockThreshold} units
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Available Units */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <span
                            className={cn(
                              "text-sm font-black block",
                              isCritical ? "text-red-700" : isLow ? "text-amber-700" : "text-emerald-700"
                            )}
                          >
                            {item.availableUnits} Units
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Cleared & ready
                          </span>
                        </div>
                      </td>

                      {/* Reserved Units */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800 text-xs">
                          {item.reservedUnits} Units
                        </span>
                      </td>

                      {/* Quarantined Units */}
                      <td className="px-4 py-3.5">
                        {item.quarantinedUnits > 0 ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-800 text-xs">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {item.quarantinedUnits} In Testing
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">0</span>
                        )}
                      </td>

                      {/* Expired Units */}
                      <td className="px-4 py-3.5">
                        {item.expiredUnits > 0 ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-800 text-xs">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            {item.expiredUnits} Disposed
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">0</span>
                        )}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="px-4 py-3.5">
                        {getStatusBadge(item.stockStatus)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectForEdit(item)}
                          className="h-8 text-xs font-semibold gap-1"
                        >
                          <Edit className="w-3.5 h-3.5 text-slate-500" />
                          <span>Adjust</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
