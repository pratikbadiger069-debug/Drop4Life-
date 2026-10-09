"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AppNotification, NotificationCategory, NotificationPreferences } from "@/lib/types";
import { notificationService } from "@/lib/notifications/notification-service";
import { NotificationPreferencesDialog } from "./notification-preferences-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Send,
  Flag,
  Sparkles,
  Layers,
  Settings,
  Clock,
  ExternalLink,
  CheckCheck,
  Inbox,
  Filter,
} from "lucide-react";

interface NotificationCenterViewProps {
  userId: string;
  notifications: AppNotification[];
  onNotificationsChanged: () => void;
}

export function NotificationCenterView({
  userId,
  notifications = [],
  onNotificationsChanged,
}: NotificationCenterViewProps) {
  const [activeCategory, setActiveCategory] = useState<NotificationCategory | "ALL">("ALL");
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState<boolean>(false);
  const [markingAll, setMarkingAll] = useState<boolean>(false);

  const filtered = useMemo(() => {
    const list = notifications || [];
    return list.filter((n) => {
      if (activeCategory !== "ALL" && n.category !== activeCategory) return false;
      if (filterUnreadOnly && n.isRead) return false;
      return true;
    });
  }, [notifications, activeCategory, filterUnreadOnly]);

  const unreadCount = (notifications || []).filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id, userId);
    onNotificationsChanged();
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead(userId);
      onNotificationsChanged();
    } finally {
      setMarkingAll(false);
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "BLOOD_REQUEST":
        return <Send className="w-4 h-4 text-red-600" />;
      case "DONOR_MATCH":
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
      case "INVENTORY_ALERT":
        return <Layers className="w-4 h-4 text-amber-600" />;
      case "CAMPAIGN":
        return <Flag className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-red-100 text-red-700">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900">Notification Center</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Real-time logistical alerts, match alerts, inventory warnings, and community campaign updates.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="text-xs h-8 gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark All Read
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPrefsOpen(true)}
            className="text-xs h-8 gap-1.5"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            Preferences
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={activeCategory === "ALL" ? "default" : "outline"}
            className={`text-xs h-7.5 ${activeCategory === "ALL" ? "bg-red-700 hover:bg-red-800 text-white" : ""}`}
            onClick={() => setActiveCategory("ALL")}
          >
            All ({notifications.length})
          </Button>
          <Button
            size="sm"
            variant={activeCategory === "DONOR_MATCH" ? "default" : "outline"}
            className={`text-xs h-7.5 ${activeCategory === "DONOR_MATCH" ? "bg-red-700 hover:bg-red-800 text-white" : ""}`}
            onClick={() => setActiveCategory("DONOR_MATCH")}
          >
            Donor Matches
          </Button>
          <Button
            size="sm"
            variant={activeCategory === "BLOOD_REQUEST" ? "default" : "outline"}
            className={`text-xs h-7.5 ${activeCategory === "BLOOD_REQUEST" ? "bg-red-700 hover:bg-red-800 text-white" : ""}`}
            onClick={() => setActiveCategory("BLOOD_REQUEST")}
          >
            Requisitions
          </Button>
          <Button
            size="sm"
            variant={activeCategory === "INVENTORY_ALERT" ? "default" : "outline"}
            className={`text-xs h-7.5 ${activeCategory === "INVENTORY_ALERT" ? "bg-red-700 hover:bg-red-800 text-white" : ""}`}
            onClick={() => setActiveCategory("INVENTORY_ALERT")}
          >
            Inventory Alerts
          </Button>
          <Button
            size="sm"
            variant={activeCategory === "CAMPAIGN" ? "default" : "outline"}
            className={`text-xs h-7.5 ${activeCategory === "CAMPAIGN" ? "bg-red-700 hover:bg-red-800 text-white" : ""}`}
            onClick={() => setActiveCategory("CAMPAIGN")}
          >
            Campaigns
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className={`text-xs h-7.5 ${filterUnreadOnly ? "text-red-700 font-bold" : "text-slate-500"}`}
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
          >
            {filterUnreadOnly ? "Showing Unread Only" : "Filter Unread"}
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">No Notifications</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You are all caught up! There are no {filterUnreadOnly ? "unread" : ""} notifications matching this category.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              className={`border transition-all ${
                !item.isRead
                  ? "border-red-200 bg-red-50/20 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                        !item.isRead
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {getCategoryIcon(item.category)}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                        )}
                        {item.priority === "HIGH" && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Urgent
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono pt-1">
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                        {item.isRead && item.readAt && (
                          <span className="text-emerald-600 font-medium">
                            Read • {new Date(item.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.linkUrl && (
                      <Link href={item.linkUrl}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2 hover:bg-red-50 hover:text-red-700"
                        >
                          View
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    )}

                    {!item.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7 px-2 text-slate-500 hover:text-slate-800"
                        onClick={() => handleMarkAsRead(item.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Preferences Dialog */}
      <NotificationPreferencesDialog
        userId={userId}
        open={isPrefsOpen}
        onOpenChange={setIsPrefsOpen}
      />
    </div>
  );
}
