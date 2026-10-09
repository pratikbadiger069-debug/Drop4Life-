"use client";

import React, { useState } from "react";
import { BloodGroup, RequestPriority, BloodRequest } from "@/lib/types";
import { ALL_BLOOD_GROUPS, PRIORITY_CONFIG } from "@/lib/constants";
import { requestService, CreateBloodRequestInput } from "@/lib/requests/request-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Send, Loader2, CheckCircle2 } from "lucide-react";
import { EmergencyBadge } from "./emergency-badge";

interface RequestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestCreated: (request: BloodRequest) => void;
  defaultBloodGroup?: BloodGroup;
  defaultCity?: string;
}

export function RequestFormDialog({
  open,
  onOpenChange,
  onRequestCreated,
  defaultBloodGroup = "O-",
  defaultCity = "New York",
}: RequestFormDialogProps) {
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(defaultBloodGroup);
  const [unitsNeeded, setUnitsNeeded] = useState<number>(2);
  const [priority, setPriority] = useState<RequestPriority>("EMERGENCY");
  const [requiredDate, setRequiredDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [department, setDepartment] = useState<string>("Emergency Trauma Wing");
  const [city, setCity] = useState<string>(defaultCity);
  const [area, setArea] = useState<string>("Manhattan");
  const [requesterPhone, setRequesterPhone] = useState<string>("+1 (555) 911-7890");
  const [clinicalNotes, setClinicalNotes] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const input: CreateBloodRequestInput = {
        bloodGroup,
        unitsNeeded: Number(unitsNeeded),
        priority,
        requiredDate,
        department,
        city,
        area,
        requesterPhone,
        clinicalNotes,
      };

      const newRequest = await requestService.createBloodRequest(input);
      setSuccessMessage(`Requisition ${newRequest.referenceNumber} created successfully.`);

      setTimeout(() => {
        onRequestCreated(newRequest);
        onOpenChange(false);
        setSuccessMessage(null);
      }, 700);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred while creating the request.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Submit Blood Requisition"
      description="Create an official hospital request and activate smart donor matching."
      className="max-w-2xl"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Emergency Disclaimer Notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Notice regarding emergency situations:</span> Drop4Life provides logistical matching assistance and does not guarantee immediate donor arrival or fulfillment. In life-critical emergencies, always contact hospital emergency reserves and regional blood banks directly.
          </div>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>Submission Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Blood Group */}
            <div>
              <Label htmlFor="blood-group-select" className="font-medium text-slate-700">
                Required Blood Group *
              </Label>
              <select
                id="blood-group-select"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                required
              >
                {ALL_BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg} {bg === "O-" ? "(Universal RBC Donor)" : bg === "AB+" ? "(Universal Recipient)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Units Needed */}
            <div>
              <Label htmlFor="units-needed-input" className="font-medium text-slate-700">
                Units Required (1 - 20) *
              </Label>
              <Input
                id="units-needed-input"
                type="number"
                min={1}
                max={20}
                value={unitsNeeded}
                onChange={(e) => setUnitsNeeded(parseInt(e.target.value, 10) || 1)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Urgency Level */}
            <div>
              <Label htmlFor="priority-select" className="font-medium text-slate-700">
                Urgency Level *
              </Label>
              <select
                id="priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as RequestPriority)}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                required
              >
                <option value="CRITICAL">Critical (&lt; 1 hour)</option>
                <option value="EMERGENCY">Emergency (&lt; 4 hours)</option>
                <option value="URGENT">Urgent (&lt; 24 hours)</option>
                <option value="NORMAL">Standard / Scheduled</option>
              </select>
              <div className="mt-1.5">
                <EmergencyBadge priority={priority} size="sm" />
              </div>
            </div>

            {/* Required Date */}
            <div>
              <Label htmlFor="required-date-input" className="font-medium text-slate-700">
                Required By Date *
              </Label>
              <Input
                id="required-date-input"
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <Label htmlFor="department-input" className="font-medium text-slate-700">
                Clinical Department / Wing *
              </Label>
              <Input
                id="department-input"
                type="text"
                placeholder="e.g. ICU, Trauma, Cardio Surgery"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            {/* City */}
            <div>
              <Label htmlFor="city-input" className="font-medium text-slate-700">
                Hospital City / Service Area *
              </Label>
              <Input
                id="city-input"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Area / Borough */}
            <div>
              <Label htmlFor="area-input" className="font-medium text-slate-700">
                Neighborhood / Borough (Optional)
              </Label>
              <Input
                id="area-input"
                type="text"
                placeholder="e.g. Manhattan, Midtown"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Coordination Phone */}
            <div>
              <Label htmlFor="phone-input" className="font-medium text-slate-700">
                Hospital Coordination Hotline *
              </Label>
              <Input
                id="phone-input"
                type="tel"
                value={requesterPhone}
                onChange={(e) => setRequesterPhone(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          {/* Clinical Notes */}
          <div>
            <Label htmlFor="clinical-notes-input" className="font-medium text-slate-700">
              Clinical Notes & Transfusion Indications
            </Label>
            <textarea
              id="clinical-notes-input"
              rows={2}
              placeholder="e.g., Surgery indication, required crossmatching details, special patient antibodies..."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-700 hover:bg-red-800 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging Requisition...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Blood Requisition
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
