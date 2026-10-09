import { describe, it, expect, beforeEach } from "vitest";
import { auditService } from "@/lib/audit/audit-service";
import { authAdapter } from "@/lib/auth/auth-adapter";

describe("System Audit Trail Service", () => {
  beforeEach(async () => {
    localStorage.clear();
    await authAdapter.login("admin@drop4life.org", "AdminPass123!");
  });

  it("records an action and preserves audit details", async () => {
    const entry = await auditService.recordAction({
      actorId: "usr-admin-001",
      actorRole: "admin",
      actorName: "System Admin",
      action: "INVENTORY_CHANGE",
      targetType: "INVENTORY",
      targetId: "inv-O-neg",
      details: "Adjusted O- units from 4 to 6 units.",
    });

    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeDefined();
    expect(entry.action).toBe("INVENTORY_CHANGE");

    const logs = await auditService.getAuditLogs();
    const found = logs.find((l) => l.id === entry.id);
    expect(found).toBeDefined();
    expect(found?.details).toBe("Adjusted O- units from 4 to 6 units.");
  });

  it("redacts sensitive fields (passwords, tokens, secrets) from metadata", async () => {
    const entry = await auditService.recordAction({
      actorId: "usr-admin-001",
      actorRole: "admin",
      actorName: "System Admin",
      action: "USER_STATUS_CHANGE",
      targetType: "USER",
      targetId: "usr-donor-001",
      details: "Profile verified with credentials payload.",
      metadata: {
        password: "SecretPassword123!",
        authToken: "bearer_xyz_super_secret_token",
        secretKey: "k_sec_999",
        safeNote: "All verified",
      },
    });

    expect(entry.metadata).toBeDefined();
    expect(entry.metadata?.safeNote).toBe("All verified");
    expect(entry.metadata?.password).toBe("[REDACTED]");
    expect(entry.metadata?.authToken).toBe("[REDACTED]");
    expect(entry.metadata?.secretKey).toBe("[REDACTED]");
  });

  it("restricts viewing audit logs to administrator role", async () => {
    // Donor
    await authAdapter.login("donor@drop4life.org", "DonorPass123!");
    await expect(auditService.getAuditLogs()).rejects.toThrow(
      /Access Denied: Administrative privileges required/i
    );

    // Hospital
    await authAdapter.login("hospital@drop4life.org", "HospitalPass123!");
    await expect(auditService.getAuditLogs()).rejects.toThrow(
      /Access Denied: Administrative privileges required/i
    );

    // Unauthenticated
    authAdapter.logout();
    await expect(auditService.getAuditLogs()).rejects.toThrow(
      /Authentication required/i
    );
  });

  it("supports filtering audit logs by action type and query", async () => {
    await auditService.recordAction({
      actorId: "usr-admin-001",
      actorRole: "admin",
      actorName: "System Admin",
      action: "REPORT_EXPORTED",
      targetType: "SYSTEM",
      targetId: "exp-001",
      details: "CSV export for compliance.",
    });

    const exportLogs = await auditService.getAuditLogs({ action: "REPORT_EXPORTED" });
    expect(exportLogs.every((l) => l.action === "REPORT_EXPORTED")).toBe(true);

    const searchedLogs = await auditService.getAuditLogs({ search: "compliance" });
    expect(searchedLogs.some((l) => l.details.includes("compliance"))).toBe(true);
  });
});
