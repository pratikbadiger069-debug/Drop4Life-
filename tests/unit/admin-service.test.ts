import { describe, it, expect, beforeEach, vi } from "vitest";
import { adminService } from "@/lib/admin/admin-service";
import { authAdapter } from "@/lib/auth/auth-adapter";
import { auditService } from "@/lib/audit/audit-service";
import { requestService } from "@/lib/requests/request-service";
import { campaignService } from "@/lib/campaigns/campaign-service";

describe("Admin Service & Operations Layer", () => {
  beforeEach(async () => {
    localStorage.clear();
    await authAdapter.login("admin@drop4life.org", "AdminPass123!");
  });

  describe("Access Control & Authorization Guards", () => {
    it("rejects unauthenticated callers", async () => {
      authAdapter.logout();
      await expect(adminService.getAdminMetrics()).rejects.toThrow(
        /Authentication required for administrative access/i
      );
      await expect(adminService.getVerificationQueue()).rejects.toThrow(
        /Authentication required/i
      );
      await expect(adminService.exportReportToCsv("REQUESTS")).rejects.toThrow(
        /Authentication required/i
      );
    });

    it("rejects non-admin roles (donor, hospital, ngo)", async () => {
      // Donor
      await authAdapter.login("donor@drop4life.org", "DonorPass123!");
      await expect(adminService.getAdminMetrics()).rejects.toThrow(
        /Administrative privileges required/i
      );

      // Hospital
      await authAdapter.login("hospital@drop4life.org", "HospitalPass123!");
      await expect(adminService.getVerificationQueue()).rejects.toThrow(
        /Administrative privileges required/i
      );

      // NGO
      await authAdapter.login("ngo@drop4life.org", "NgoPass123!");
      await expect(adminService.exportReportToCsv("USERS")).rejects.toThrow(
        /Administrative privileges required/i
      );
    });
  });

  describe("Metrics Calculation from Real Data", () => {
    it("calculates real aggregate counts across users, requests, campaigns, and inventory", async () => {
      const metrics = await adminService.getAdminMetrics();

      expect(metrics.totalUsers).toBeGreaterThanOrEqual(4);
      expect(metrics.totalDonors).toBeGreaterThanOrEqual(1);
      expect(metrics.totalHospitals).toBeGreaterThanOrEqual(1);
      expect(metrics.totalNgos).toBeGreaterThanOrEqual(1);
      expect(metrics.openRequests).toBeGreaterThanOrEqual(1);
      expect(metrics.activeCampaigns).toBeGreaterThanOrEqual(1);
      expect(metrics.totalAvailableUnits).toBeGreaterThanOrEqual(0);
      expect(metrics.lastCalculatedAt).toBeDefined();
    });
  });

  describe("Organization Verification Workflow", () => {
    it("retrieves the organization verification queue", async () => {
      const queue = await adminService.getVerificationQueue();
      expect(queue.length).toBeGreaterThan(0);
      expect(queue.some((item) => item.type === "hospital" || item.type === "ngo")).toBe(true);
    });

    it("approves an organization and records audit trail", async () => {
      const auditSpy = vi.spyOn(auditService, "recordAction");
      await adminService.processVerification("usr-hosp-002", "verified");

      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "VERIFICATION_DECISION",
          targetId: "usr-hosp-002",
        })
      );

      const users = await authAdapter.getAllUsers();
      const hosp = users.find((u) => u.id === "usr-hosp-002");
      expect(hosp?.verificationStatus).toBe("verified");
    });

    it("rejects an organization with a reason and creates audit entry", async () => {
      const auditSpy = vi.spyOn(auditService, "recordAction");
      await adminService.processVerification(
        "usr-ngo-003",
        "rejected",
        "License documentation missing expiry date stamp."
      );

      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "VERIFICATION_DECISION",
          targetId: "usr-ngo-003",
          details: expect.stringContaining("License documentation missing"),
        })
      );
    });
  });

  describe("User & Organization Directory & Governance", () => {
    it("lists users and filters by role and search", async () => {
      const all = await adminService.getUsersAndOrganizations();
      expect(all.length).toBeGreaterThanOrEqual(4);

      const donorsOnly = await adminService.getUsersAndOrganizations({ role: "donor" });
      expect(donorsOnly.every((u) => u.role === "donor")).toBe(true);

      const searched = await adminService.getUsersAndOrganizations({ search: "admin" });
      expect(searched.some((u) => u.email.includes("admin"))).toBe(true);
    });

    it("suspends and reactivates a user account with audit logging", async () => {
      const auditSpy = vi.spyOn(auditService, "recordAction");

      // Suspend
      await adminService.setUserStatus("usr-donor-001", "suspended", "Policy compliance check");
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "USER_STATUS_CHANGE",
          targetId: "usr-donor-001",
          details: expect.stringContaining("SUSPENDED"),
        })
      );

      let users = await authAdapter.getAllUsers();
      let donor = users.find((u) => u.id === "usr-donor-001");
      expect(donor?.status).toBe("suspended");

      // Reactivate
      await adminService.setUserStatus("usr-donor-001", "active", "Check completed");
      users = await authAdapter.getAllUsers();
      donor = users.find((u) => u.id === "usr-donor-001");
      expect(donor?.status).toBe("active");
    });
  });

  describe("Reports & CSV Export", () => {
    it("generates an analytics report with date filtering", async () => {
      const report = await adminService.generateAnalyticsReport({
        startDate: "2026-09-01",
        endDate: "2026-10-31",
      });

      expect(report.generatedAt).toBeDefined();
      expect(report.summary.totalRequests).toBeGreaterThanOrEqual(1);
      expect(report.summary.totalCampaigns).toBeGreaterThanOrEqual(1);
    });

    it("exports sanitized CSV for all report types without leaking secrets or private data", async () => {
      const reqCsv = await adminService.exportReportToCsv("REQUESTS");
      expect(reqCsv).toContain("Reference,Hospital,Blood Group");
      expect(reqCsv).not.toContain("password");

      const userCsv = await adminService.exportReportToCsv("USERS");
      expect(userCsv).toContain("User ID,Full Name,Role");
      expect(userCsv).not.toContain("password");
      expect(userCsv).not.toContain("AdminPass123!");

      const invCsv = await adminService.exportReportToCsv("INVENTORY");
      expect(invCsv).toContain("Blood Group,Available Units");

      const auditCsv = await adminService.exportReportToCsv("AUDIT_LOGS");
      expect(auditCsv).toContain("Log ID,Timestamp,Actor Role,Action");
    });
  });
});
