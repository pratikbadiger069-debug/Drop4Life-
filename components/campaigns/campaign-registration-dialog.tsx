"use client";

import React, { useState, useEffect } from "react";
import { Campaign, BloodGroup } from "@/lib/types";
import { ALL_BLOOD_GROUPS } from "@/lib/constants";
import { campaignService, RegisterParticipantInput } from "@/lib/campaigns/campaign-service";
import { useAuth } from "@/lib/auth/auth-context";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Loader2, Heart, Calendar, MapPin } from "lucide-react";

interface CampaignRegistrationDialogProps {
  campaign: Campaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisteredSuccess?: () => void;
}

export function CampaignRegistrationDialog({
  campaign,
  open,
  onOpenChange,
  onRegisteredSuccess,
}: CampaignRegistrationDialogProps) {
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPhone, setUserPhone] = useState<string>("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O-");
  const [participantRole, setParticipantRole] = useState<"donor" | "volunteer" | "medical_volunteer">("donor");
  const [notes, setNotes] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUserName(user.fullName || "");
      setUserEmail(user.email || "");
      setBloodGroup(user.bloodGroup || "O-");
    } else {
      setUserName("");
      setUserEmail("");
      setBloodGroup("O-");
    }
    setUserPhone("+91 98765 00001");
    setParticipantRole("donor");
    setNotes("");
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [user, open]);

  if (!campaign) return null;

  const isAtCapacity =
    campaign.capacityLimit !== undefined && campaign.registeredCount >= campaign.capacityLimit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const input: RegisterParticipantInput = {
        userName,
        userEmail,
        userPhone,
        bloodGroup,
        participantRole,
        notes,
      };

      await campaignService.registerParticipant(campaign.id, input);
      setSuccessMsg(
        `Registration confirmed! Thank you for supporting the ${campaign.title}.`
      );

      setTimeout(() => {
        if (onRegisteredSuccess) onRegisteredSuccess();
        onOpenChange(false);
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to complete registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={`Register: ${campaign.title}`}
      description={`Organized by ${campaign.ngoName} • ${campaign.city}`}
      className="max-w-lg"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Campaign Info Card */}
        <div className="p-3 bg-red-50/60 border border-red-100 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-red-600" />
            <span>
              {campaign.startDate} {campaign.startDate !== campaign.endDate ? `– ${campaign.endDate}` : ""} ({campaign.startTime} - {campaign.endTime})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {campaign.venueName}, {campaign.address}, {campaign.city}
            </span>
          </div>
          {campaign.capacityLimit && (
            <div className="text-[11px] text-slate-500 font-mono pt-1">
              Registered: {campaign.registeredCount} / {campaign.capacityLimit} spots filled
            </div>
          )}
        </div>

        {errorMsg && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>Registration Error</AlertTitle>
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        {successMsg && (
          <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <AlertDescription className="text-xs font-semibold">{successMsg}</AlertDescription>
          </Alert>
        )}

        {isAtCapacity ? (
          <div className="py-6 text-center text-slate-600 text-xs">
            <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">Campaign is at Full Capacity</p>
            <p className="mt-1">
              This blood drive has reached its maximum volunteer limit. You can check back later or explore other nearby blood drives.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="reg-name" className="font-bold text-slate-800 text-xs">
                  Full Name *
                </Label>
                <Input
                  id="reg-name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <Label htmlFor="reg-email" className="font-bold text-slate-800 text-xs">
                  Email Address *
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="mt-1 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="reg-phone" className="font-bold text-slate-800 text-xs">
                  Phone Number
                </Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="reg-blood" className="font-bold text-slate-800 text-xs">
                  Blood Group
                </Label>
                <select
                  id="reg-blood"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-bold focus:border-red-500 focus:outline-none"
                >
                  {ALL_BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="reg-role" className="font-bold text-slate-800 text-xs">
                  Role
                </Label>
                <select
                  id="reg-role"
                  value={participantRole}
                  onChange={(e) => setParticipantRole(e.target.value as any)}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium focus:border-red-500 focus:outline-none"
                >
                  <option value="donor">Blood Donor</option>
                  <option value="volunteer">Volunteer Support</option>
                  <option value="medical_volunteer">Medical Staff</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="reg-notes" className="font-bold text-slate-800 text-xs">
                Preferred Time Slot / Notes (Optional)
              </Label>
              <Input
                id="reg-notes"
                placeholder="e.g. Morning 10:00 AM, first-time donor"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            {campaign.registrationInstructions && (
              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded">
                Instructions: {campaign.registrationInstructions}
              </p>
            )}

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
                className="bg-red-700 hover:bg-red-800 text-white font-bold gap-1.5"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5 text-white fill-white" />
                    Confirm Registration
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  );
}
