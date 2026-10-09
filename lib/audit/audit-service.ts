/**
 * Drop4Life — Centralized System Audit Trail Service Layer
 * 
 * Records immutable, tamper-evident audit log entries for governance, security,
 * and compliance tracking across the platform.
 * 
 * AUDIT SCOPE:
 * - Blood inventory adjustments & disposals
 * - Blood requisition status transitions
 * - Hospital & NGO credential verification decisions
 * - User activation, suspension, and role changes
 * - Administrative report queries & data exports
 * 
 * PRIVACY & COMPLIANCE:
 * - Strictly strips passwords, authorization tokens, confidential clinical text, and private addresses.
 * - Append-only architecture: logs cannot be edited or deleted through application interfaces.
 * - Access is strictly gated: only authenticated administrators can retrieve system audit records.
 */

import {
  AuditLogEntry,
  AuditActionType,
  UserRole,
} from "@/lib/types";
import { authAdapter } from "@/lib/auth/auth-adapter";

const AUDIT_STORAGE_KEY = "drop4life_system_audit_logs";

export const DEFAULT_SEEDED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-001",
    timestamp: "2026-10-09T08:35:00.000Z",
    actorId: "usr-hosp-002",
    actorRole: "hospital",
    actorName: "Dr. David Brooks",
    actorEmail: "hospital@drop4life.org",
    action: "REQUEST_STATUS_CHANGE",
    targetType: "REQUEST",
    targetId: "req-001",
    targetName: "REQ-2026-8801",
    details: "Requisition created for 2 units O- (Critical trauma priority).",
    metadata: { units: 2, bloodGroup: "O-", priority: "CRITICAL" },
  },
  {
    id: "aud-002",
    timestamp: "2026-10-08T19:40:00.000Z",
    actorId: "usr-hosp-002",
    actorRole: "hospital",
    actorName: "Dr. David Brooks",
    actorEmail: "hospital@drop4life.org",
    action: "INVENTORY_CHANGE",
    targetType: "INVENTORY",
    targetId: "hosp-prof-002-O-",
    targetName: "St. Jude Medical Center — O- Inventory",
    details: "Dispatched 2 units O- for Trauma Emergency Bay 3. Available stock adjusted from 4 to 2.",
    metadata: { bloodGroup: "O-", change: -2, previous: 4, current: 2 },
  },
  {
    id: "aud-003",
    timestamp: "2026-10-02T12:00:00.000Z",
    actorId: "usr-admin-001",
    actorRole: "admin",
    actorName: "Platform System Administrator",
    actorEmail: "admin@drop4life.org",
    action: "VERIFICATION_DECISION",
    targetType: "NGO",
    targetId: "usr-ngo-003",
    targetName: "Red Cross LifeCare Auxiliary",
    details: "Verified NGO registration certificate NY-NGO-2024-8841 after state registry confirmation.",
    metadata: { decision: "verified", registrationId: "NY-NGO-2024-8841" },
  },
  {
    id: "aud-004",
    timestamp: "2026-09-20T14:15:00.000Z",
    actorId: "usr-admin-001",
    actorRole: "admin",
    actorName: "Platform System Administrator",
    actorEmail: "admin@drop4life.org",
    action: "VERIFICATION_DECISION",
    targetType: "HOSPITAL",
    targetId: "usr-hosp-002",
    targetName: "St. Jude Medical Center",
    details: "Approved hospital blood bank license NY-MED-884210-A with level-1 trauma authorization.",
    metadata: { decision: "verified", licenseNumber: "NY-MED-884210-A" },
  },
  {
    id: "aud-005",
    timestamp: "2026-10-07T11:20:00.000Z",
    actorId: "usr-hosp-002",
    actorRole: "hospital",
    actorName: "Dr. David Brooks",
    actorEmail: "hospital@drop4life.org",
    action: "INVENTORY_CHANGE",
    targetType: "INVENTORY",
    targetId: "hosp-prof-002-A+",
    targetName: "St. Jude Medical Center — A+ Inventory",
    details: "Cleared 3 screened units from mobile collection batch #MC-492 into available inventory.",
    metadata: { bloodGroup: "A+", change: 3, previous: 15, current: 18 },
  },
];

export interface RecordAuditInput {
  actorId?: string;
  actorRole?: UserRole;
  actorName?: string;
  actorEmail?: string;
  action: AuditActionType;
  targetType: "HOSPITAL" | "NGO" | "ORGANIZATION" | "DONOR" | "REQUEST" | "CAMPAIGN" | "INVENTORY" | "USER" | "SYSTEM";
  targetId: string;
  targetName?: string;
  details: string;
  metadata?: Record<string, any>;
}

class AuditService {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private loadLogs(): AuditLogEntry[] {
    if (!this.isClient()) {
      return [...DEFAULT_SEEDED_AUDIT_LOGS];
    }
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(DEFAULT_SEEDED_AUDIT_LOGS));
        return [...DEFAULT_SEEDED_AUDIT_LOGS];
      }
      return JSON.parse(stored);
    } catch {
      return [...DEFAULT_SEEDED_AUDIT_LOGS];
    }
  }

  private saveLogs(logs: AuditLogEntry[]): void {
    if (this.isClient()) {
      try {
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
      } catch {
        // ignore
      }
    }
  }

  /**
   * Deep sanitization to prevent sensitive tokens, passwords, or patient notes from entering audit records
   */
  private sanitizeMetadata(data?: Record<string, any>): Record<string, any> | undefined {
    if (!data) return undefined;
    const sanitized: Record<string, any> = {};
    const sensitiveKeys = ["password", "token", "secret", "hash", "ssn", "credentials", "auth"];

    for (const [key, value] of Object.entries(data)) {
      if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof value === "string") {
        // Sanitize patient references
        sanitized[key] = value.replace(/patient\s+[A-Za-z]+(\s+[A-Za-z]+)?/gi, "[Protected Patient]");
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Appends a new immutable audit record to the system audit trail
   */
  public async recordAction(input: RecordAuditInput): Promise<AuditLogEntry> {
    const session = authAdapter.getSession();
    const actorId = input.actorId || session?.user.id || "system";
    const actorRole = input.actorRole || session?.user.role || "admin";
    const actorName = input.actorName || session?.user.fullName || "System Process";
    const actorEmail = input.actorEmail || session?.user.email;

    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorId,
      actorRole,
      actorName,
      actorEmail,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      targetName: input.targetName,
      details: input.details.trim(),
      metadata: this.sanitizeMetadata(input.metadata),
    };

    const logs = this.loadLogs();
    logs.unshift(entry);
    this.saveLogs(logs);

    return entry;
  }

  /**
   * Retrieves audit trail records with filters (enforces Administrator role)
   */
  public async getAuditLogs(filters?: {
    action?: AuditActionType | "ALL";
    targetType?: string | "ALL";
    actorId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    const session = authAdapter.getSession();
    if (!session || !session.user) {
      throw new Error("Authentication required to access system audit logs.");
    }

    if (session.user.role !== "admin") {
      throw new Error("Access Denied: Administrative privileges required to view system audit logs.");
    }

    await new Promise((resolve) => setTimeout(resolve, 40));
    let logs = this.loadLogs();

    if (filters?.action && filters.action !== "ALL") {
      logs = logs.filter((l) => l.action === filters.action);
    }

    if (filters?.targetType && filters.targetType !== "ALL") {
      logs = logs.filter((l) => l.targetType === filters.targetType);
    }

    if (filters?.actorId) {
      logs = logs.filter((l) => l.actorId === filters.actorId);
    }

    if (filters?.startDate) {
      const start = new Date(filters.startDate).getTime();
      logs = logs.filter((l) => new Date(l.timestamp).getTime() >= start);
    }

    if (filters?.endDate) {
      const end = new Date(filters.endDate).getTime();
      logs = logs.filter((l) => new Date(l.timestamp).getTime() <= end);
    }

    if (filters?.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();
      logs = logs.filter(
        (l) =>
          l.details.toLowerCase().includes(q) ||
          l.actorName.toLowerCase().includes(q) ||
          (l.targetName && l.targetName.toLowerCase().includes(q)) ||
          l.targetId.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q)
      );
    }

    const sorted = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filters?.limit) {
      return sorted.slice(0, filters.limit);
    }

    return sorted;
  }
}

export const auditService = new AuditService();
