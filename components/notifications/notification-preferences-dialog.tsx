"use client";

import React, { useState, useEffect } from "react";
import { NotificationPreferences } from "@/lib/types";
import { notificationService, DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/notifications/notification-service";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, CheckCircle2, ShieldCheck, Mail, MessageSquare, AlertTriangle, Loader2 } from "lucide-react";

interface NotificationPreferencesDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPreferencesUpdated?: (prefs: NotificationPreferences) => void;
}

export function NotificationPreferencesDialog({
  userId,
  open,
  onOpenChange,
  onPreferencesUpdated,
}: NotificationPreferencesDialogProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!open || !userId) return;
    async function load() {
      setLoading(true);
      try {
        const data = await notificationService.getUserPreferences(userId);
        setPrefs(data);
      } catch (err) {
        console.error("Failed to load preferences", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [open, userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const updated = await notificationService.updateUserPreferences(userId, prefs);
      setSavedSuccess(true);
      if (onPreferencesUpdated) onPreferencesUpdated(updated);
      setTimeout(() => {
        setSavedSuccess(false);
        onOpenChange(false);
      }, 600);
    } catch (err) {
      console.error("Failed to save preferences", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Notification & Contact Preferences"
      description="Customize which alerts you receive and your preferred delivery channels."
      className="max-w-md"
    >
      {loading ? (
        <div className="py-8 text-center text-xs text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
          Loading preferences...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          {savedSuccess && (
            <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200 py-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <AlertDescription className="text-xs font-semibold">
                Preferences saved successfully.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Delivery Channels
            </h4>

            <div className="flex items-start space-x-2.5 p-2.5 rounded-lg border border-slate-100 bg-slate-50">
              <Checkbox
                id="pref-in-app"
                checked={prefs.inAppAlerts}
                onChange={(e) =>
                  setPrefs((prev) => ({ ...prev, inAppAlerts: e.target.checked }))
                }
              />
              <div className="grid gap-0.5 leading-none">
                <Label htmlFor="pref-in-app" className="font-bold text-slate-800 text-xs">
                  In-App Notification Center
                </Label>
                <p className="text-[11px] text-slate-500">
                  Receive alerts in the dashboard bell and notification center.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2.5 rounded-lg border border-slate-100 bg-slate-50">
              <Checkbox
                id="pref-email"
                checked={prefs.emailAlerts}
                onChange={(e) =>
                  setPrefs((prev) => ({ ...prev, emailAlerts: e.target.checked }))
                }
              />
              <div className="grid gap-0.5 leading-none">
                <Label htmlFor="pref-email" className="font-bold text-slate-800 text-xs flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  Email Dispatch
                </Label>
                <p className="text-[11px] text-slate-500">
                  Receive email summaries for major matching and campaign updates.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2.5 rounded-lg border border-slate-100 bg-slate-50">
              <Checkbox
                id="pref-sms"
                checked={prefs.smsAlerts}
                onChange={(e) =>
                  setPrefs((prev) => ({ ...prev, smsAlerts: e.target.checked }))
                }
              />
              <div className="grid gap-0.5 leading-none">
                <Label htmlFor="pref-sms" className="font-bold text-slate-800 text-xs flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-slate-400" />
                  SMS Text Notifications
                </Label>
                <p className="text-[11px] text-slate-500">
                  Receive mobile SMS alerts for critical and emergency blood requisitions.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Category & Urgency Filters
            </h4>

            <div className="flex items-start space-x-2.5 p-2.5 rounded-lg border border-slate-100 bg-slate-50">
              <Checkbox
                id="pref-urgent-only"
                checked={prefs.urgentRequestsOnly}
                onChange={(e) =>
                  setPrefs((prev) => ({ ...prev, urgentRequestsOnly: e.target.checked }))
                }
              />
              <div className="grid gap-0.5 leading-none">
                <Label htmlFor="pref-urgent-only" className="font-bold text-slate-800 text-xs flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  Critical & Emergency Only
                </Label>
                <p className="text-[11px] text-slate-500">
                  Silence routine/standard alerts and only notify for time-critical requests.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2.5 rounded-lg border border-slate-100 bg-slate-50">
              <Checkbox
                id="pref-campaigns"
                checked={prefs.campaignAnnouncements}
                onChange={(e) =>
                  setPrefs((prev) => ({ ...prev, campaignAnnouncements: e.target.checked }))
                }
              />
              <div className="grid gap-0.5 leading-none">
                <Label htmlFor="pref-campaigns" className="font-bold text-slate-800 text-xs">
                  NGO Campaigns & Community Blood Drives
                </Label>
                <p className="text-[11px] text-slate-500">
                  Receive announcements about nearby public donation drives.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-red-700 hover:bg-red-800 text-white font-semibold"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
