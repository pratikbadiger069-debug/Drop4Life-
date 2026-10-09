"use client";

import React, { useState, useEffect } from "react";
import { Campaign, CampaignStatus } from "@/lib/types";
import { campaignService, CreateCampaignInput } from "@/lib/campaigns/campaign-service";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Flag, Loader2, CheckCircle2, AlertTriangle, Calendar, Building2 } from "lucide-react";

interface CampaignFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignToEdit?: Campaign | null;
  onCampaignSaved: (campaign: Campaign) => void;
  defaultCity?: string;
}

export function CampaignFormDialog({
  open,
  onOpenChange,
  campaignToEdit,
  onCampaignSaved,
  defaultCity = "New York",
}: CampaignFormDialogProps) {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [venueName, setVenueName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>(defaultCity);
  const [area, setArea] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("09:00 AM");
  const [endTime, setEndTime] = useState<string>("05:00 PM");
  const [targetUnits, setTargetUnits] = useState<number>(200);
  const [capacityLimit, setCapacityLimit] = useState<number | undefined>(250);
  const [contactPhone, setContactPhone] = useState<string>("+1 (555) 456-7890");
  const [contactEmail, setContactEmail] = useState<string>("ngo@drop4life.org");
  const [registrationInstructions, setRegistrationInstructions] = useState<string>("");
  const [status, setStatus] = useState<CampaignStatus>("PUBLISHED");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (campaignToEdit) {
      setTitle(campaignToEdit.title);
      setDescription(campaignToEdit.description);
      setVenueName(campaignToEdit.venueName);
      setAddress(campaignToEdit.address);
      setCity(campaignToEdit.city);
      setArea(campaignToEdit.area || "");
      setStartDate(campaignToEdit.startDate);
      setEndDate(campaignToEdit.endDate);
      setStartTime(campaignToEdit.startTime);
      setEndTime(campaignToEdit.endTime);
      setTargetUnits(campaignToEdit.targetUnits);
      setCapacityLimit(campaignToEdit.capacityLimit);
      setContactPhone(campaignToEdit.contactPhone);
      setContactEmail(campaignToEdit.contactEmail);
      setRegistrationInstructions(campaignToEdit.registrationInstructions || "");
      setStatus(campaignToEdit.status);
    } else {
      // Default to today and 2 days out
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
      setTitle("");
      setDescription("");
      setVenueName("");
      setAddress("");
      setCity(defaultCity);
      setArea("");
      setStartDate(today);
      setEndDate(nextWeek);
      setStartTime("09:00 AM");
      setEndTime("05:00 PM");
      setTargetUnits(200);
      setCapacityLimit(250);
      setRegistrationInstructions("Please bring a photo ID and stay hydrated. Light refreshments provided.");
      setStatus("PUBLISHED");
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [campaignToEdit, open, defaultCity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (campaignToEdit) {
        const updated = await campaignService.updateCampaign(campaignToEdit.id, {
          title,
          description,
          venueName,
          address,
          city,
          area: area || undefined,
          startDate,
          endDate,
          startTime,
          endTime,
          targetUnits: Number(targetUnits),
          capacityLimit: capacityLimit ? Number(capacityLimit) : undefined,
          contactPhone,
          contactEmail,
          registrationInstructions: registrationInstructions || undefined,
          status,
        });
        setSuccessMsg("Campaign updated successfully.");
        setTimeout(() => {
          onCampaignSaved(updated);
          onOpenChange(false);
        }, 600);
      } else {
        const input: CreateCampaignInput = {
          title,
          description,
          venueName,
          address,
          city,
          area: area || undefined,
          startDate,
          endDate,
          startTime,
          endTime,
          targetUnits: Number(targetUnits),
          capacityLimit: capacityLimit ? Number(capacityLimit) : undefined,
          contactPhone,
          contactEmail,
          registrationInstructions: registrationInstructions || undefined,
          status,
        };
        const created = await campaignService.createCampaign(input);
        setSuccessMsg("Campaign created and published successfully.");
        setTimeout(() => {
          onCampaignSaved(created);
          onOpenChange(false);
        }, 600);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save campaign.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={campaignToEdit ? "Edit Blood Donation Campaign" : "Create New Blood Drive Campaign"}
      description="Organize and publish a community blood drive for volunteer donor mobilization."
      className="max-w-2xl"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {errorMsg && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        {successMsg && (
          <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <AlertDescription className="text-xs font-semibold">{successMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="camp-title" className="font-bold text-slate-800 text-xs">
              Campaign Title *
            </Label>
            <Input
              id="camp-title"
              placeholder="e.g. Citywide Spring Blood Drive 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 text-sm font-semibold"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="camp-desc" className="font-bold text-slate-800 text-xs">
              Campaign Description & Community Purpose
            </Label>
            <textarea
              id="camp-desc"
              rows={2}
              placeholder="Describe the campaign mission, partnering facilities, and community impact..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Venue & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="camp-venue" className="font-bold text-slate-800 text-xs">
                Venue / Facility Name *
              </Label>
              <Input
                id="camp-venue"
                placeholder="e.g. Civic Plaza Community Hall"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="mt-1 text-xs"
                required
              />
            </div>

            <div>
              <Label htmlFor="camp-address" className="font-bold text-slate-800 text-xs">
                Street Address *
              </Label>
              <Input
                id="camp-address"
                placeholder="e.g. 350 5th Avenue, Ground Pavilion"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 text-xs"
                required
              />
            </div>
          </div>

          {/* City & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="camp-city" className="font-bold text-slate-800 text-xs">
                City *
              </Label>
              <Input
                id="camp-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 text-xs"
                required
              />
            </div>

            <div>
              <Label htmlFor="camp-area" className="font-bold text-slate-800 text-xs">
                Neighborhood / Borough (Optional)
              </Label>
              <Input
                id="camp-area"
                placeholder="e.g. Midtown Manhattan"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          {/* Dates & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="camp-start-date" className="font-bold text-slate-800 text-xs">
                Start Date *
              </Label>
              <Input
                id="camp-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 text-xs"
                required
              />
            </div>

            <div>
              <Label htmlFor="camp-end-date" className="font-bold text-slate-800 text-xs">
                End Date *
              </Label>
              <Input
                id="camp-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 text-xs"
                required
              />
            </div>

            <div>
              <Label htmlFor="camp-start-time" className="font-bold text-slate-800 text-xs">
                Start Time
              </Label>
              <Input
                id="camp-start-time"
                placeholder="09:00 AM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="camp-end-time" className="font-bold text-slate-800 text-xs">
                End Time
              </Label>
              <Input
                id="camp-end-time"
                placeholder="05:00 PM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          {/* Targets & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="camp-target-units" className="font-bold text-slate-800 text-xs">
                Target Units *
              </Label>
              <Input
                id="camp-target-units"
                type="number"
                min={1}
                value={targetUnits}
                onChange={(e) => setTargetUnits(parseInt(e.target.value, 10) || 10)}
                className="mt-1 text-xs font-bold"
                required
              />
            </div>

            <div>
              <Label htmlFor="camp-capacity" className="font-bold text-slate-800 text-xs">
                Volunteer Capacity Limit
              </Label>
              <Input
                id="camp-capacity"
                type="number"
                min={1}
                placeholder="Optional max"
                value={capacityLimit || ""}
                onChange={(e) =>
                  setCapacityLimit(e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="camp-status" className="font-bold text-slate-800 text-xs">
                Campaign Status
              </Label>
              <select
                id="camp-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none"
              >
                <option value="DRAFT">Draft (Internal Only)</option>
                <option value="PUBLISHED">Published (Open for RSVPs)</option>
                <option value="ACTIVE">Active (Live Today)</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="camp-phone" className="font-bold text-slate-800 text-xs">
                Coordinator Phone *
              </Label>
              <Input
                id="camp-phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="mt-1 text-xs"
                required
              />
            </div>

            <div>
              <Label htmlFor="camp-email" className="font-bold text-slate-800 text-xs">
                Coordinator Email *
              </Label>
              <Input
                id="camp-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="mt-1 text-xs"
                required
              />
            </div>
          </div>

          {/* Registration Instructions */}
          <div>
            <Label htmlFor="camp-instructions" className="font-bold text-slate-800 text-xs">
              Registration & Donor Preparation Instructions
            </Label>
            <Input
              id="camp-instructions"
              placeholder="e.g. Bring photo ID, eat a healthy meal prior, rest recovery area provided."
              value={registrationInstructions}
              onChange={(e) => setRegistrationInstructions(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-red-700 hover:bg-red-800 text-white font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Flag className="w-3.5 h-3.5 mr-1.5" />
                  {campaignToEdit ? "Update Campaign" : "Publish Campaign"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
