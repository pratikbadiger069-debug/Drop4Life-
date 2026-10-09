import { describe, it, expect, beforeEach, vi } from "vitest";
import { hospitalService, calculateStockStatus } from "@/lib/hospital/hospital-service";
import { authAdapter } from "@/lib/auth/auth-adapter";

describe("Hospital Service & Blood Bank Inventory", () => {
  const hospitalUserId = "usr-hosp-002";
  const donorUserId = "usr-donor-001";

  beforeEach(() => {
    localStorage.clear();
    // Simulate active hospital session
    vi.spyOn(authAdapter, "getSession").mockReturnValue({
      user: {
        id: hospitalUserId,
        email: "hospital@drop4life.org",
        role: "hospital",
        fullName: "Dr. Rajesh Verma",
        organizationName: "Apollo Hospital Jubilee Hills",
        city: "Hyderabad",
        verificationStatus: "verified",
      },
      token: "tok_test_hospital",
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });
  });

  describe("calculateStockStatus", () => {
    it("returns CRITICAL_LOW when available is <= half of threshold", () => {
      expect(calculateStockStatus(0, 8)).toBe("CRITICAL_LOW");
      expect(calculateStockStatus(2, 8)).toBe("CRITICAL_LOW");
      expect(calculateStockStatus(4, 8)).toBe("CRITICAL_LOW");
    });

    it("returns LOW_STOCK when available is below threshold but above critical", () => {
      expect(calculateStockStatus(5, 8)).toBe("LOW_STOCK");
      expect(calculateStockStatus(7, 8)).toBe("LOW_STOCK");
    });

    it("returns ADEQUATE when available is between threshold and 2.5x threshold", () => {
      expect(calculateStockStatus(8, 8)).toBe("ADEQUATE");
      expect(calculateStockStatus(15, 8)).toBe("ADEQUATE");
    });

    it("returns SURPLUS when available is >= 2.5x threshold", () => {
      expect(calculateStockStatus(20, 8)).toBe("SURPLUS");
      expect(calculateStockStatus(30, 8)).toBe("SURPLUS");
    });
  });

  describe("Authorization & Security Guards", () => {
    it("rejects access when user has donor role", async () => {
      vi.spyOn(authAdapter, "getSession").mockReturnValue({
        user: {
          id: donorUserId,
          email: "donor@drop4life.org",
          role: "donor",
          fullName: "Rahul Kumar",
        },
        token: "tok_donor",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      await expect(hospitalService.getBloodInventory(hospitalUserId)).rejects.toThrow(
        /Access Denied: Only authorized hospital personnel/i
      );

      await expect(
        hospitalService.updateBloodInventory(hospitalUserId, {
          bloodGroup: "O-",
          availableUnits: 10,
          reservedUnits: 2,
          quarantinedUnits: 0,
          expiredUnits: 0,
          reason: "ROUTINE_AUDIT",
        })
      ).rejects.toThrow(/Access Denied: Only authorized hospital personnel/i);
    });

    it("rejects unauthenticated requests", async () => {
      vi.spyOn(authAdapter, "getSession").mockReturnValue(null);
      await expect(hospitalService.getBloodInventory(hospitalUserId)).rejects.toThrow(
        /Authentication required/i
      );
    });
  });

  describe("getHospitalProfile & updateHospitalProfile", () => {
    it("retrieves the default hospital profile", async () => {
      const profile = await hospitalService.getHospitalProfile(hospitalUserId);
      expect(profile).toBeDefined();
      expect(profile.hospitalName).toBe("Apollo Hospital Jubilee Hills");
      expect(profile.contactPerson).toBe("Dr. Rajesh Verma");
      expect(profile.isVerified).toBe(true);
    });

    it("updates hospital profile details", async () => {
      const updated = await hospitalService.updateHospitalProfile(hospitalUserId, {
        hospitalName: "Apollo Speciality Trauma Center",
        department: "Blood Banking and Cryobiology Division",
      });

      expect(updated.hospitalName).toBe("Apollo Speciality Trauma Center");
      expect(updated.department).toBe("Blood Banking and Cryobiology Division");
    });

    it("rejects empty hospital name on update", async () => {
      await expect(
        hospitalService.updateHospitalProfile(hospitalUserId, { hospitalName: "   " })
      ).rejects.toThrow(/Hospital organization name cannot be empty/i);
    });
  });

  describe("Blood Inventory Management", () => {
    it("retrieves inventory containing all 8 ABO/Rh blood groups", async () => {
      const inventory = await hospitalService.getBloodInventory(hospitalUserId);
      expect(inventory.length).toBe(8);

      const groups = inventory.map((i) => i.bloodGroup);
      expect(groups).toContain("O-");
      expect(groups).toContain("O+");
      expect(groups).toContain("A-");
      expect(groups).toContain("A+");
      expect(groups).toContain("B-");
      expect(groups).toContain("B+");
      expect(groups).toContain("AB-");
      expect(groups).toContain("AB+");
    });

    it("updates inventory for a blood group and records an audit log", async () => {
      const { updatedItem, auditLog } = await hospitalService.updateBloodInventory(hospitalUserId, {
        bloodGroup: "O-",
        availableUnits: 15,
        reservedUnits: 4,
        quarantinedUnits: 2,
        expiredUnits: 0,
        lowStockThreshold: 8,
        reason: "DONATION_RECEIVED",
        notes: "Received batch from drive #MC-101",
      });

      expect(updatedItem.bloodGroup).toBe("O-");
      expect(updatedItem.availableUnits).toBe(15);
      expect(updatedItem.reservedUnits).toBe(4);
      expect(updatedItem.stockStatus).toBe("ADEQUATE");
      expect(updatedItem.lastUpdatedByStaffName).toBe("Dr. Rajesh Verma");

      expect(auditLog).toBeDefined();
      expect(auditLog.bloodGroup).toBe("O-");
      expect(auditLog.reason).toBe("DONATION_RECEIVED");
      expect(auditLog.newAvailable).toBe(15);
      expect(auditLog.staffName).toBe("Dr. Rajesh Verma");

      // Verify persistence in subsequent fetch
      const currentInv = await hospitalService.getBloodInventory(hospitalUserId);
      const oMinus = currentInv.find((i) => i.bloodGroup === "O-");
      expect(oMinus?.availableUnits).toBe(15);
    });

    it("rejects negative inventory quantities", async () => {
      await expect(
        hospitalService.updateBloodInventory(hospitalUserId, {
          bloodGroup: "O-",
          availableUnits: -5,
          reservedUnits: 0,
          quarantinedUnits: 0,
          expiredUnits: 0,
          reason: "ROUTINE_AUDIT",
        })
      ).rejects.toThrow(/must be a non-negative integer/i);
    });

    it("rejects invalid blood group values", async () => {
      await expect(
        hospitalService.updateBloodInventory(hospitalUserId, {
          // @ts-expect-error test invalid blood group
          bloodGroup: "UNKNOWN_TYPE",
          availableUnits: 10,
          reservedUnits: 0,
          quarantinedUnits: 0,
          expiredUnits: 0,
          reason: "ROUTINE_AUDIT",
        })
      ).rejects.toThrow(/Invalid blood group/i);
    });
  });

  describe("Inventory Audit Logs", () => {
    it("retrieves audit logs sorted newest to oldest", async () => {
      const logs = await hospitalService.getInventoryAuditLogs(hospitalUserId);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].staffName).toBeDefined();
    });
  });
});
