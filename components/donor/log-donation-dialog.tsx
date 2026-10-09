"use client";

import React, { useState } from "react";
import { BloodGroup, DonationType, DonationRecord } from "@/lib/types";
import { ALL_BLOOD_GROUPS } from "@/lib/constants";
import { donorService } from "@/lib/donor/donor-service";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Calendar, Building2, MapPin, Droplet, Hash, FileText } from "lucide-react";

interface LogDonationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  defaultBloodGroup: BloodGroup;
  defaultCity: string;
  onRecordCreated: (record: DonationRecord) => void;
}

export function LogDonationDialog({
  isOpen,
  onClose,
  userId,
  defaultBloodGroup,
  defaultCity,
  onRecordCreated,
}: LogDonationDialogProps) {
  const [donationDate, setDonationDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [facilityName, setFacilityName] = useState<string>("");
  const [facilityCity, setFacilityCity] = useState<string>(defaultCity || "");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(defaultBloodGroup || "O-");
  const [units, setUnits] = useState<number>(1);
  const [donationType, setDonationType] = useState<DonationType>("WHOLE_BLOOD");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityName.trim()) {
      setError("Please provide the hospital or donation center name.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await donorService.addDonationRecord(userId, {
        donationDate,
        facilityName: facilityName.trim(),
        facilityCity: facilityCity.trim() || defaultCity,
        bloodGroup,
        units,
        donationType,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      onRecordCreated(created);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to record donation.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Log Past Blood Donation Event"
      description="Record your voluntary donation milestone. Self-reported records will be marked accordingly until verified by partner hospitals."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Donation Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Donation Date *
            </label>
            <Input
              type="date"
              value={donationDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDonationDate(e.target.value)}
              required
            />
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Blood Group *
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary"
            >
              {ALL_BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  Type {bg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hospital or Center */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Donation Center / Hospital Name *
          </label>
          <Input
            placeholder="e.g. Apollo Hospital Blood Center, Red Cross Camp"
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              City
            </label>
            <Input
              placeholder="e.g. Hyderabad"
              value={facilityCity}
              onChange={(e) => setFacilityCity(e.target.value)}
            />
          </div>

          {/* Donation Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Donation Type
            </label>
            <select
              value={donationType}
              onChange={(e) => setDonationType(e.target.value as DonationType)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary"
            >
              <option value="WHOLE_BLOOD">Whole Blood</option>
              <option value="RED_CELLS">Packed Red Cells (Double)</option>
              <option value="PLATELETS">Platelets (Apheresis)</option>
              <option value="PLASMA">Plasma</option>
            </select>
          </div>

          {/* Units */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Units Donated
            </label>
            <Input
              type="number"
              min={1}
              max={4}
              value={units}
              onChange={(e) => setUnits(parseInt(e.target.value, 10) || 1)}
            />
          </div>
        </div>

        {/* Reference / Certificate # */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Certificate or Donor Reference Number (Optional)
          </label>
          <Input
            placeholder="e.g. MSH-2026-9912 or Card ID"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Personal Notes (Optional)
          </label>
          <Input
            placeholder="e.g. Felt great, standard 56-day rest cycle"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="default" size="sm" disabled={isSubmitting} className="font-bold">
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
            Save Donation Record
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
