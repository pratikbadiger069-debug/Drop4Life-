"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AppNotification } from "@/lib/types";
import { notificationService } from "@/lib/notifications/notification-service";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Send,
  Layers,
  Flag,
  ChevronRight,
} from "lucide-react";

interface NotificationBellPopoverProps {
  notificationsPageUrl: string;
}

export function NotificationBellPopover({ notificationsPageUrl }: NotificationBellPopoverProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  const loadNotifs = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      const list = await notificationService.getNotifications(user.id);
      setNotifications(list);
    } catch (err) {
      console.error("Failed to load notifications for bell", err);
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotifs();
  }, [loadNotifs]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const recentList = notifications.slice(0, 4);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    await notificationService.markAsRead(id, user.id);
    await loadNotifs();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "BLOOD_REQUEST":
        return <Send className="w-3.5 h-3.5 text-red-600" />;
      case "DONOR_MATCH":
        return <Sparkles className="w-3.5 h-3.5 text-indigo-600" />;
      case "INVENTORY_ALERT":
        return <Layers className="w-3.5 h-3.5 text-amber-600" />;
      case "CAMPAIGN":
        return <Flag className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label={`Notifications: ${unreadCount} unread`}
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <Link
              href={notificationsPageUrl}
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-red-700 hover:text-red-800"
            >
              View all
            </Link>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {recentList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications right now
              </div>
            ) : (
              recentList.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 transition-colors hover:bg-slate-50 flex items-start justify-between gap-2 ${
                    !n.isRead ? "bg-red-50/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-100 flex-shrink-0 mt-0.5">
                      {getCategoryIcon(n.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
            <Link
              href={notificationsPageUrl}
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-1 text-xs font-bold text-slate-700 hover:text-red-700 w-full py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span>Open Notification Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
