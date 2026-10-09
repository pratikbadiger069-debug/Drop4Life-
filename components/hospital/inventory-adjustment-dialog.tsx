"use client";

import React, { useState, useEffect } from "react";
import { BloodGroup, BloodInventoryItem, InventoryAdjustmentReason, InventoryAuditLog } from "@/lib/types";
import { hospitalService } from "@/lib/hospital/hospital-service";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, AlertCircle, Sparkles, User, Info } from "lucide-react";

interface InventoryAdjustmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalId: string;
  item: BloodInventoryItem | null;
  staffName: string;
  onSuccess: (updated: BloodInventoryItem, auditLog: InventoryAuditLog) => void;
}

export function InventoryAdjustmentDialog({
  isOpen,
  onClose,
  hospitalId,
  item,
  staffName,
  onSuccess,
}: InventoryAdjustmentDialogProps) {
  const [availableUnits, setAvailableUnits] = useState<number>(item?.availableUnits ?? 0);
  const [reservedUnits, setReservedUnits] = useState<number>(item?.reservedUnits ?? 0);
  const [quarantinedUnits, setQuarantinedUnits] = useState<number>(item?.quarantinedUnits ?? 0);
  const [expiredUnits, setExpiredUnits] = useState<number>(item?.expiredUnits ?? 0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(item?.lowStockThreshold ?? 8);
  const [reason, setReason] = useState<InventoryAdjustmentReason>("ROUTINE_AUDIT");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setAvailableUnits(item.availableUnits);
      setReservedUnits(item.reservedUnits);
      setQuarantinedUnits(item.quarantinedUnits);
      setExpiredUnits(item.expiredUnits);
      setLowStockThreshold(item.lowStockThreshold);
      setReason("ROUTINE_AUDIT");
      setNotes("");
      setError(null);
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (availableUnits < 0 || reservedUnits < 0 || quarantinedUnits < 0 || expiredUnits < 0 || lowStockThreshold < 0) {
      setError("Unit counts and safety thresholds cannot be negative numbers.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { updatedItem, auditLog } = await hospitalService.updateBloodInventory(hospitalId, {
        bloodGroup: item.bloodGroup,
        availableUnits,
        reservedUnits,
        quarantinedUnits,
        expiredUnits,
        lowStockThreshold,
        reason,
        notes: notes.trim() || undefined,
      });

      onSuccess(updatedItem, auditLog);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update inventory.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPhysicalUnits = availableUnits + reservedUnits + quarantinedUnits + expiredUnits;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Blood Bank Inventory — Type ${item.bloodGroup}`}
      description="Record quantity updates, reserve hold allocations, and screening quarantine adjustments with audit compliance."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Blood Group Highlight Card */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-primary font-black text-lg border border-red-200 shadow-xs">
              {item.bloodGroup}
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-bold uppercase block">Target Blood Group</span>
              <span className="font-extrabold text-slate-900 text-base">Red Blood Cells (RBC)</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Physical Units</span>
            <span className="text-xl font-black text-slate-900">{totalPhysicalUnits} Units</span>
          </div>
        </div>

        {/* Quantities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Available Units (Usable) */}
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="avail-units" className="font-bold text-xs text-emerald-950">
                Available (Ready for Use) *
              </label>
              <Badge variant="success" className="text-[9px] py-0 px-1.5">
                Cleared
              </Badge>
            </div>
            <Input
              id="avail-units"
              type="number"
              min={0}
              value={availableUnits}
              onChange={(e) => setAvailableUnits(parseInt(e.target.value, 10) || 0)}
              required
              className="bg-white"
            />
            <span className="text-[10px] text-emerald-800 block">
              Tested & clinically cleared for transfusion.
            </span>
          </div>

          {/* Reserved Units */}
          <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="res-units" className="font-bold text-xs text-blue-950">
                Reserved Units *
              </label>
              <Badge variant="secondary" className="text-[9px] py-0 px-1.5 font-semibold">
                Hold
              </Badge>
            </div>
            <Input
              id="res-units"
              type="number"
              min={0}
              value={reservedUnits}
              onChange={(e) => setReservedUnits(parseInt(e.target.value, 10) || 0)}
              required
              className="bg-white"
            />
            <span className="text-[10px] text-blue-800 block">
              Allocated for scheduled surgery / patient hold.
            </span>
          </div>

          {/* Quarantined Units */}
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="quar-units" className="font-bold text-xs text-amber-950">
                Quarantined / Untested *
              </label>
              <Badge variant="warning" className="text-[9px] py-0 px-1.5">
                Isolated
              </Badge>
            </div>
            <Input
              id="quar-units"
              type="number"
              min={0}
              value={quarantinedUnits}
              onChange={(e) => setQuarantinedUnits(parseInt(e.target.value, 10) || 0)}
              required
              className="bg-white"
            />
            <span className="text-[10px] text-amber-900 block">
              In testing/screening. Not usable for patients.
            </span>
          </div>

          {/* Expired / Unsuitable */}
          <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="exp-units" className="font-bold text-xs text-rose-950">
                Expired / Unsuitable *
              </label>
              <Badge variant="destructive" className="text-[9px] py-0 px-1.5">
                Disposal
              </Badge>
            </div>
            <Input
              id="exp-units"
              type="number"
              min={0}
              value={expiredUnits}
              onChange={(e) => setExpiredUnits(parseInt(e.target.value, 10) || 0)}
              required
              className="bg-white"
            />
            <span className="text-[10px] text-rose-900 block">
              Marked for incineration / biohazard disposal.
            </span>
          </div>
        </div>

        {/* Low Stock Threshold & Adjustment Reason */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="stock-threshold" className="block text-xs font-bold text-slate-700 mb-1">
              Low-Stock Alert Threshold *
            </label>
            <Input
              id="stock-threshold"
              type="number"
              min={1}
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10) || 1)}
              required
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Alerts trigger when available units fall below this level.
            </span>
          </div>

          <div>
            <label htmlFor="adjust-reason" className="block text-xs font-bold text-slate-700 mb-1">
              Adjustment Reason (Audit Compliance) *
            </label>
            <select
              id="adjust-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as InventoryAdjustmentReason)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary"
            >
              <option value="ROUTINE_AUDIT">Routine Daily Physical Audit</option>
              <option value="DONATION_RECEIVED">Donation Batch Cleared & Received</option>
              <option value="TRANSFUSION_DISPATCH">Transfusion / Emergency Dispatch</option>
              <option value="RESERVED_FOR_SURGERY">Hold Allocated for Surgery</option>
              <option value="QUARANTINE_ADJUSTMENT">Quarantine Status Change</option>
              <option value="EXPIRED_DISPOSAL">Expired Units Disposed</option>
            </select>
          </div>
        </div>

        {/* Audit Notes */}
        <div>
          <label htmlFor="audit-notes" className="block text-xs font-bold text-slate-700 mb-1">
            Clinical / Verification Notes (Optional)
          </label>
          <Input
            id="audit-notes"
            placeholder="e.g. Cleared 2 units from Mobile Drive Batch #NY-882"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Staff Identity & Compliance Banner */}
        <div className="rounded-lg bg-slate-100 p-3 text-[11px] text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>
              Authorized Staff: <strong className="text-slate-900">{staffName}</strong>
            </span>
          </div>
          <span className="text-slate-400 font-mono">Timestamped on Save</span>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="default" size="sm" disabled={isSubmitting} className="font-bold text-xs">
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Saving Inventory...
              </>
            ) : (
              "Save Stock Adjustment"
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
