import { describe, it, expect, beforeEach } from "vitest";
import { authAdapter } from "@/lib/auth/auth-adapter";
import { hospitalService } from "@/lib/hospital/hospital-service";
import { requestService } from "@/lib/requests/request-service";
import { campaignService } from "@/lib/campaigns/campaign-service";
import { adminService } from "@/lib/admin/admin-service";
import { auditService } from "@/lib/audit/audit-service";

describe("Security Review & Server-Side RBAC Enforcement", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Donor Privilege Isolation", () => {
    beforeEach(async () => {
      await authAdapter.login("donor@drop4life.org", "DonorPass123!");
    });

    it("prevents donors from reading hospital blood inventory", async () => {
      await expect(hospitalService.getBloodInventory("usr-hosp-002")).rejects.toThrow(
        /Access Denied/i
      );
    });

    it("prevents donors from updating hospital inventory", async () => {
      await expect(
        hospitalService.updateBloodInventory("usr-hosp-002", {
          bloodGroup: "O-",
          availableUnits: 99,
          reservedUnits: 0,
          quarantinedUnits: 0,
          expiredUnits: 0,
          reason: "ROUTINE_AUDIT",
        })
      ).rejects.toThrow(/Access Denied/i);
    });

    it("prevents donors from editing hospital profiles", async () => {
      await expect(
        hospitalService.updateHospitalProfile("usr-hosp-002", {
          hospitalName: "Tampered Hospital Name",
        })
      ).rejects.toThrow(/Access Denied/i);
    });

    it("prevents donors from creating NGO campaigns", async () => {
      await expect(
        campaignService.createCampaign({
          title: "Malicious Donor Campaign",
          description: "Fake",
          venueName: "Street",
          address: "123",
          city: "New York",
          area: "Midtown",
          startDate: "2026-10-15",
          endDate: "2026-10-15",
          startTime: "09:00 AM",
          endTime: "05:00 PM",
          targetUnits: 100,
          contactPhone: "+1 (555) 000-0000",
          contactEmail: "donor@drop4life.org",
        })
      ).rejects.toThrow(/Access Denied/i);
    });

    it("prevents donors from reading administrative audit trails", async () => {
      await expect(auditService.getAuditLogs()).rejects.toThrow(/Access Denied/i);
    });
  });

  describe("Cross-Hospital IDOR (Insecure Direct Object Reference) Prevention", () => {
    it("prevents a hospital user from updating another hospital's profile", async () => {
      // Login as St. Jude Hospital
      await authAdapter.login("hospital@drop4life.org", "HospitalPass123!");

      // Try updating another hospital's profile ID
      await expect(
        hospitalService.updateHospitalProfile("other-hosp-999", {
          hospitalName: "Attempted IDOR Name Update",
        })
      ).rejects.toThrow(/Unauthorized: You do not have permission to edit another hospital/i);
    });
  });

  describe("Administrative Role Escalation Prevention", () => {
    it("blocks non-administrators from accessing verification queue", async () => {
      await authAdapter.login("hospital@drop4life.org", "HospitalPass123!");
      await expect(adminService.getVerificationQueue()).rejects.toThrow(
        /Administrative privileges required/i
      );

      await authAdapter.login("ngo@drop4life.org", "NgoPass123!");
      await expect(adminService.getVerificationQueue()).rejects.toThrow(
        /Administrative privileges required/i
      );
    });

    it("blocks non-administrators from toggling account status", async () => {
      await authAdapter.login("hospital@drop4life.org", "HospitalPass123!");
      await expect(
        adminService.setUserStatus("usr-donor-001", "suspended", "Rogue hospital suspension")
      ).rejects.toThrow(/Administrative privileges required/i);
    });

    it("blocks non-administrators from exporting administrative compliance CSVs", async () => {
      await authAdapter.login("ngo@drop4life.org", "NgoPass123!");
      await expect(adminService.exportReportToCsv("AUDIT_LOGS")).rejects.toThrow(
        /Administrative privileges required/i
      );
    });
  });

  describe("Suspended Account Enforcement", () => {
    it("rejects login attempts if account status is suspended", async () => {
      // First, admin suspends donor account
      await authAdapter.login("admin@drop4life.org", "AdminPass123!");
      await adminService.setUserStatus("usr-donor-001", "suspended", "Security audit failure");
      authAdapter.logout();

      // Now donor attempts login
      await expect(
        authAdapter.login("donor@drop4life.org", "DonorPass123!")
      ).rejects.toThrow(/Your account has been suspended/i);
    });
  });
});
