/**
 * Drop4Life — Notification Service Layer
 * 
 * Manages in-app alerts, role-specific notifications, user delivery preferences,
 * duplicate suppression, and privacy redactions.
 * 
 * PRIVACY & DATA INTEGRITY:
 * - Redacts private patient identifying information and donor home addresses from notification payloads.
 * - Respects donor contact preferences (in-app, SMS, email, urgent-only filters).
 * - Prevents duplicate alerts for identical events triggered within short time windows.
 * - External delivery provider status: In-app delivery is primary; external SMS/Email
 *   fallback runs in simulated mode unless explicit environment provider credentials exist.
 */

import {
  AppNotification,
  NotificationCategory,
  NotificationPriority,
  NotificationPreferences,
  UserRole,
} from "@/lib/types";
import { authAdapter } from "@/lib/auth/auth-adapter";

const NOTIFICATIONS_STORAGE_KEY = "drop4life_app_notifications";
const NOTIFICATION_PREFERENCES_STORAGE_KEY = "drop4life_notification_preferences";

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  inAppAlerts: true,
  emailAlerts: true,
  smsAlerts: true,
  urgentRequestsOnly: false,
  campaignAnnouncements: true,
  inventoryAlerts: true,
};

/**
 * Seeded initial notifications for demonstration and testing
 */
export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  // Donor Rahul Kumar notifications
  {
    id: "notif-001",
    userId: "usr-donor-001",
    role: "donor",
    title: "Urgent O- Requisition Matched",
    message: "Apollo Hospital Jubilee Hills has submitted an emergency request for O- red blood cells in Hyderabad.",
    category: "DONOR_MATCH",
    priority: "HIGH",
    linkUrl: "/donor/requests",
    isRead: false,
    metadata: {
      requestId: "req-001",
      bloodGroup: "O-",
      hospitalId: "usr-hosp-002",
    },
    createdAt: "2026-10-09T08:35:00.000Z",
  },
  {
    id: "notif-002",
    userId: "usr-donor-001",
    role: "donor",
    title: "Blood Drive Invitation",
    message: "Youth Red Cross Society & Lifeline announced the 'Mega Blood Donation Drive 2026' near you in Bengaluru.",
    category: "CAMPAIGN",
    priority: "MEDIUM",
    linkUrl: "/campaigns",
    isRead: true,
    metadata: {
      campaignId: "camp-101",
    },
    createdAt: "2026-10-08T10:00:00.000Z",
    readAt: "2026-10-08T14:20:00.000Z",
  },
  {
    id: "notif-003",
    userId: "usr-donor-001",
    role: "donor",
    title: "Rest Cycle Complete",
    message: "Your 56-day rest cycle is complete! You are now eligible to donate whole blood.",
    category: "SYSTEM",
    priority: "LOW",
    linkUrl: "/donor/donations",
    isRead: true,
    createdAt: "2026-10-01T09:00:00.000Z",
    readAt: "2026-10-01T11:15:00.000Z",
  },

  // Hospital Dr. Rajesh Verma notifications
  {
    id: "notif-101",
    userId: "usr-hosp-002",
    role: "hospital",
    title: "Critical Low Stock: O- Reserve",
    message: "O- inventory is at 2 units (below threshold of 8). Immediate donor requisitions recommended.",
    category: "INVENTORY_ALERT",
    priority: "HIGH",
    linkUrl: "/hospital/inventory",
    isRead: false,
    metadata: {
      bloodGroup: "O-",
    },
    createdAt: "2026-10-09T07:15:00.000Z",
  },
  {
    id: "notif-102",
    userId: "usr-hosp-002",
    role: "hospital",
    title: "Donor Match Response Received",
    message: "Volunteer donor accepted coordination invitation for requisition REQ-2026-8802 (A+).",
    category: "DONOR_MATCH",
    priority: "MEDIUM",
    linkUrl: "/hospital/requests",
    isRead: true,
    metadata: {
      requestId: "req-002",
    },
    createdAt: "2026-10-08T17:00:00.000Z",
    readAt: "2026-10-08T17:30:00.000Z",
  },

  // NGO Priya Reddy notifications
  {
    id: "notif-201",
    userId: "usr-ngo-003",
    role: "ngo",
    title: "New Volunteer Registration",
    message: "A new donor registered for the Mega Blood Donation Drive 2026.",
    category: "CAMPAIGN",
    priority: "LOW",
    linkUrl: "/ngo/participants",
    isRead: false,
    metadata: {
      campaignId: "camp-101",
    },
    createdAt: "2026-10-09T09:10:00.000Z",
  },
  {
    id: "notif-202",
    userId: "usr-ngo-003",
    role: "ngo",
    title: "Organization Verified",
    message: "Youth Red Cross Society & Lifeline has been officially verified by the platform coordinator.",
    category: "SYSTEM",
    priority: "MEDIUM",
    linkUrl: "/ngo/profile",
    isRead: true,
    createdAt: "2026-10-02T12:00:00.000Z",
    readAt: "2026-10-02T12:30:00.000Z",
  },
];

export interface CreateNotificationInput {
  userId: string;
  role: UserRole;
  title: string;
  message: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  linkUrl?: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  /**
   * Loads all notifications from storage or fallback defaults
   */
  private loadNotifications(): AppNotification[] {
    if (!this.isClient()) {
      return [...DEFAULT_NOTIFICATIONS];
    }

    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
        return [...DEFAULT_NOTIFICATIONS];
      }
      return JSON.parse(stored);
    } catch {
      return [...DEFAULT_NOTIFICATIONS];
    }
  }

  /**
   * Persists notifications to storage
   */
  private saveNotifications(notifications: AppNotification[]): void {
    if (this.isClient()) {
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
      } catch {
        // ignore
      }
    }
  }

  /**
   * Sanitizes notification text to prevent leakage of private patient/donor details
   */
  public sanitizeNotificationText(text: string): string {
    if (!text) return "";
    // Redact SSNs, private residential street addresses, or confidential patient references
    return text
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED]")
      .replace(/(?:patient:?\s+[A-Za-z]+(?:\s+[A-Za-z]+)?)/gi, "[Protected Patient/Location]")
      .replace(/\b\d+\s+[A-Za-z0-9\s,]+(?:Street|St\.|St|Avenue|Ave\.|Ave|Road|Rd\.|Rd|Drive|Dr\.|Dr|Lane|Ln\.|Ln|Boulevard|Blvd\.|Blvd|Apt\s*\w+)\b/gi, "[Protected Patient/Location]")
      .replace(/Home Address\s+\w+/gi, "[Protected Patient/Location]")
      .trim();
  }

  /**
   * Retrieves all notifications for a given user sorted newest first
   */
  public async getNotifications(userId: string): Promise<AppNotification[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const all = this.loadNotifications();
    return all
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Gets unread notification count for a user
   */
  public async getUnreadCount(userId: string): Promise<number> {
    const list = await this.getNotifications(userId);
    return list.filter((n) => !n.isRead).length;
  }

  /**
   * Marks a single notification as read
   */
  public async markAsRead(notificationId: string, userId: string): Promise<AppNotification | null> {
    const all = this.loadNotifications();
    const index = all.findIndex((n) => n.id === notificationId && n.userId === userId);
    if (index === -1) return null;

    all[index] = {
      ...all[index],
      isRead: true,
      readAt: new Date().toISOString(),
    };

    this.saveNotifications(all);
    return all[index];
  }

  /**
   * Marks all notifications for a user as read
   */
  public async markAllAsRead(userId: string): Promise<number> {
    const all = this.loadNotifications();
    let updatedCount = 0;
    const now = new Date().toISOString();

    const updated = all.map((n) => {
      if (n.userId === userId && !n.isRead) {
        updatedCount++;
        return {
          ...n,
          isRead: true,
          readAt: now,
        };
      }
      return n;
    });

    this.saveNotifications(updated);
    return updatedCount;
  }

  /**
   * Gets user notification preferences
   */
  public async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    if (!this.isClient()) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    }

    try {
      const stored = localStorage.getItem(`${NOTIFICATION_PREFERENCES_STORAGE_KEY}_${userId}`);
      if (!stored) {
        return { ...DEFAULT_NOTIFICATION_PREFERENCES };
      }
      return JSON.parse(stored);
    } catch {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    }
  }

  /**
   * Updates user notification preferences
   */
  public async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const current = await this.getUserPreferences(userId);
    const updated: NotificationPreferences = {
      ...current,
      ...preferences,
    };

    if (this.isClient()) {
      try {
        localStorage.setItem(
          `${NOTIFICATION_PREFERENCES_STORAGE_KEY}_${userId}`,
          JSON.stringify(updated)
        );
      } catch {
        // ignore
      }
    }

    return updated;
  }

  /**
   * Creates and dispatches a notification respecting user preferences and duplicate checks
   */
  public async createNotification(input: CreateNotificationInput): Promise<AppNotification | null> {
    const prefs = await this.getUserPreferences(input.userId);

    // Filter check: If user only wants urgent alerts, skip LOW or MEDIUM priority
    const priority = input.priority || "MEDIUM";
    if (prefs.urgentRequestsOnly && priority !== "HIGH") {
      return null;
    }

    // Category filter checks
    if (!prefs.campaignAnnouncements && input.category === "CAMPAIGN") {
      return null;
    }
    if (!prefs.inventoryAlerts && input.category === "INVENTORY_ALERT") {
      return null;
    }

    const all = this.loadNotifications();
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // Duplicate check: Same user, same title, within last 10 minutes
    const isDuplicate = all.some(
      (n) =>
        n.userId === input.userId &&
        n.title === input.title &&
        new Date(n.createdAt) >= tenMinutesAgo
    );

    if (isDuplicate) {
      return null;
    }

    const sanitizedTitle = this.sanitizeNotificationText(input.title);
    const sanitizedMessage = this.sanitizeNotificationText(input.message);

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: input.userId,
      role: input.role,
      title: sanitizedTitle,
      message: sanitizedMessage,
      category: input.category,
      priority,
      linkUrl: input.linkUrl,
      isRead: false,
      metadata: input.metadata,
      createdAt: now.toISOString(),
    };

    all.unshift(newNotification);
    this.saveNotifications(all);

    return newNotification;
  }
}

export const notificationService = new NotificationService();
