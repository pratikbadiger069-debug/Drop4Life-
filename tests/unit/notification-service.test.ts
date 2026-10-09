import { describe, it, expect, beforeEach } from "vitest";
import { notificationService } from "@/lib/notifications/notification-service";
import { authAdapter } from "@/lib/auth/auth-adapter";

describe("Notification Service & Preferences", () => {
  beforeEach(async () => {
    localStorage.clear();
    await authAdapter.login("donor@drop4life.org", "DonorPass123!");
  });

  it("retrieves seeded notifications for demo donor", async () => {
    const notifications = await notificationService.getNotifications("usr-donor-001");
    expect(notifications.length).toBeGreaterThan(0);
    const unreadCount = await notificationService.getUnreadCount("usr-donor-001");
    expect(unreadCount).toBeGreaterThanOrEqual(1);
  });

  it("marks a single notification as read", async () => {
    const list = await notificationService.getNotifications("usr-donor-001");
    const unread = list.find((n) => !n.isRead);
    expect(unread).toBeDefined();

    if (unread) {
      const updated = await notificationService.markAsRead(unread.id, "usr-donor-001");
      expect(updated?.isRead).toBe(true);
    }
  });

  it("marks all notifications as read for a user", async () => {
    await notificationService.markAllAsRead("usr-donor-001");
    const unreadCount = await notificationService.getUnreadCount("usr-donor-001");
    expect(unreadCount).toBe(0);
  });

  it("creates a new notification and prevents immediate duplicate within 10 minutes", async () => {
    const notif1 = await notificationService.createNotification({
      userId: "usr-donor-001",
      role: "donor",
      title: "Urgent O- Needed at General Hospital",
      message: "Emergency surgery requires 2 units of O- blood.",
      category: "BLOOD_REQUEST",
      priority: "HIGH",
    });
    expect(notif1).toBeDefined();

    // Duplicate notification with same payload should be suppressed
    const notif2 = await notificationService.createNotification({
      userId: "usr-donor-001",
      role: "donor",
      title: "Urgent O- Needed at General Hospital",
      message: "Emergency surgery requires 2 units of O- blood.",
      category: "BLOOD_REQUEST",
      priority: "HIGH",
    });
    expect(notif2).toBeNull();
  });

  it("sanitizes private sensitive patient data from notification previews", async () => {
    const sensitiveNotif = await notificationService.createNotification({
      userId: "usr-donor-001",
      role: "donor",
      title: "Match found for Patient Johnathan Doe at Home Address Apt 4B",
      message: "Direct blood for Patient Jane Smith living at 123 Main Private St.",
      category: "DONOR_MATCH",
      priority: "HIGH",
    });

    expect(sensitiveNotif).not.toBeNull();
    if (sensitiveNotif) {
      expect(sensitiveNotif.title).toContain("[Protected Patient/Location]");
      expect(sensitiveNotif.message).toContain("[Protected Patient/Location]");
      expect(sensitiveNotif.message).not.toContain("123 Main Private St");
    }
  });

  it("manages and persists user notification preferences", async () => {
    const prefs = await notificationService.getUserPreferences("usr-donor-001");
    expect(prefs.inAppAlerts).toBe(true);

    const updated = await notificationService.updateUserPreferences("usr-donor-001", {
      urgentRequestsOnly: true,
      campaignAnnouncements: false,
    });

    expect(updated.urgentRequestsOnly).toBe(true);
    expect(updated.campaignAnnouncements).toBe(false);

    // Filter non-urgent notifications when urgentRequestsOnly is active
    const nonUrgent = await notificationService.createNotification({
      userId: "usr-donor-001",
      role: "donor",
      title: "New Volunteer Campaign",
      message: "Upcoming community rally next weekend.",
      category: "CAMPAIGN",
      priority: "LOW",
    });
    expect(nonUrgent).toBeNull();
  });
});

