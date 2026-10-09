"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { NGO_NAV_ITEMS } from "@/lib/constants";
import { AppNotification } from "@/lib/types";
import { notificationService } from "@/lib/notifications/notification-service";
import { NotificationCenterView } from "@/components/notifications/notification-center-view";
import { Clock } from "lucide-react";

export default function NgoNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadNotifs = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load NGO notifications", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifs();
  }, [loadNotifs]);

  return (
    <ProtectedRoute allowedRoles={["ngo", "admin"]}>
      <DashboardShell
        role="ngo"
        navItems={NGO_NAV_ITEMS}
        userName={user?.fullName || "NGO Coordinator"}
        userEmail={user?.email || "ngo@drop4life.org"}
      >
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <Clock className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Loading notifications...</p>
            </div>
          ) : (
            <NotificationCenterView
              userId={user?.id || "usr-ngo-003"}
              notifications={notifications}
              onNotificationsChanged={loadNotifs}
            />
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
