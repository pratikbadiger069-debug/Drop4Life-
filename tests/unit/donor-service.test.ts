import { describe, it, expect, beforeEach, vi } from "vitest";
import { donorService, calculateProfileCompletion } from "@/lib/donor/donor-service";
import { authAdapter } from "@/lib/auth/auth-adapter";

describe("Donor Service & Profile Management", () => {
  const donorUserId = "usr-donor-001";
  const otherUserId = "usr-hosp-002";

  beforeEach(() => {
    localStorage.clear();
    // Simulate active donor session
    vi.spyOn(authAdapter, "getSession").mockReturnValue({
      user: {
        id: donorUserId,
        email: "donor@drop4life.org",
        role: "donor",
        fullName: "Rahul Kumar",
        bloodGroup: "O+",
        city: "Hyderabad",
        verificationStatus: "active",
      },
      token: "tok_test_donor",
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });
  });

  describe("calculateProfileCompletion", () => {
    it("calculates 0% for empty profile", () => {
      expect(calculateProfileCompletion({})).toBe(0);
    });

    it("calculates 100% when all key fields are populated", () => {
      const full = {
        fullName: "Rahul Kumar",
        bloodGroup: "O+" as const,
        phone: "+91 98765 00001",
        email: "donor@drop4life.org",
        city: "Hyderabad",
        area: "Jubilee Hills",
        preferredContactMethod: "SMS" as const,
        preferredLocation: "Apollo Hospital Jubilee Hills",
      };
      expect(calculateProfileCompletion(full)).toBe(100);
    });

    it("calculates partial score proportionally", () => {
      const partial = {
        fullName: "Rahul Kumar", // 15
        bloodGroup: "O-" as const, // 20
        email: "test@example.com", // 10
      };
      expect(calculateProfileCompletion(partial)).toBe(45);
    });
  });

  describe("getDonorProfile", () => {
    it("fetches the default profile for authenticated donor", async () => {
      const profile = await donorService.getDonorProfile(donorUserId);
      expect(profile).toBeDefined();
      expect(profile.userId).toBe(donorUserId);
      expect(profile.fullName).toBe("Rahul Kumar");
      expect(profile.bloodGroup).toBe("O-");
      expect(profile.availabilityStatus).toBe("AVAILABLE");
    });

    it("rejects unauthorized access when session user attempts to read another user's profile", async () => {
      await expect(donorService.getDonorProfile(otherUserId)).rejects.toThrow(
        /Unauthorized: You do not have permission/i
      );
    });

    it("rejects unauthenticated requests when no session exists", async () => {
      vi.spyOn(authAdapter, "getSession").mockReturnValue(null);
      await expect(donorService.getDonorProfile(donorUserId)).rejects.toThrow(
        /Authentication required/i
      );
    });
  });

  describe("updateDonorProfile", () => {
    it("updates personal details and recalculates completion", async () => {
      const updated = await donorService.updateDonorProfile(donorUserId, {
        fullName: "Rahul Kumar Updated",
        city: "Secunderabad",
        area: "Paradise Circle",
      });

      expect(updated.fullName).toBe("Rahul Kumar Updated");
      expect(updated.city).toBe("Secunderabad");
      expect(updated.area).toBe("Paradise Circle");

      // Verify persistence in subsequent fetch
      const reFetched = await donorService.getDonorProfile(donorUserId);
      expect(reFetched.fullName).toBe("Rahul Kumar Updated");
    });

    it("rejects invalid blood group values", async () => {
      await expect(
        // @ts-expect-error test invalid blood group
        donorService.updateDonorProfile(donorUserId, { bloodGroup: "INVALID_BG" })
      ).rejects.toThrow(/Invalid blood group/i);
    });

    it("rejects empty full name", async () => {
      await expect(
        donorService.updateDonorProfile(donorUserId, { fullName: "   " })
      ).rejects.toThrow(/Full name cannot be empty/i);
    });

    it("rejects invalid phone numbers", async () => {
      await expect(
        donorService.updateDonorProfile(donorUserId, { phone: "123" })
      ).rejects.toThrow(/Please enter a valid phone number/i);
    });
  });

  describe("updateDonorAvailability", () => {
    it("transitions between AVAILABLE, TEMPORARILY_UNAVAILABLE, and DO_NOT_CONTACT", async () => {
      // Set to Temporarily Unavailable
      const res1 = await donorService.updateDonorAvailability(donorUserId, {
        status: "TEMPORARILY_UNAVAILABLE",
        notes: "Recovering from donation",
      });
      expect(res1.availabilityStatus).toBe("TEMPORARILY_UNAVAILABLE");
      expect(res1.isAvailable).toBe(false);
      expect(res1.availabilityNotes).toBe("Recovering from donation");

      // Set to Do Not Contact
      const res2 = await donorService.updateDonorAvailability(donorUserId, {
        status: "DO_NOT_CONTACT",
      });
      expect(res2.availabilityStatus).toBe("DO_NOT_CONTACT");
      expect(res2.isAvailable).toBe(false);

      // Restore to Available
      const res3 = await donorService.updateDonorAvailability(donorUserId, {
        status: "AVAILABLE",
      });
      expect(res3.availabilityStatus).toBe("AVAILABLE");
      expect(res3.isAvailable).toBe(true);
    });
  });

  describe("Donation History", () => {
    it("retrieves seeded donation history sorted newest to oldest", async () => {
      const records = await donorService.getDonationHistory(donorUserId);
      expect(records.length).toBeGreaterThanOrEqual(3);
      expect(records[0].recordStatus).toBe("VERIFIED");
      expect(records[0].facilityName).toContain("Nizam's Institute");
    });

    it("adds a new self-reported donation record and updates lastDonatedAt", async () => {
      const newEntry = await donorService.addDonationRecord(donorUserId, {
        donationDate: "2026-10-01",
        facilityName: "Apollo Hospital Jubilee Hills",
        facilityCity: "Hyderabad",
        bloodGroup: "O+",
        units: 1,
        donationType: "WHOLE_BLOOD",
        referenceNumber: "APOLLO-2026-001",
        notes: "Successful test donation",
      });

      expect(newEntry.id).toBeDefined();
      expect(newEntry.recordStatus).toBe("SELF_REPORTED");
      expect(newEntry.facilityName).toBe("Apollo Hospital Jubilee Hills");

      // Verify it appears in history
      const history = await donorService.getDonationHistory(donorUserId);
      expect(history[0].id).toBe(newEntry.id);

      // Verify donor's lastDonatedAt updated
      const profile = await donorService.getDonorProfile(donorUserId);
      expect(profile.lastDonatedAt).toBe("2026-10-01");
    });

    it("rejects donation record with missing hospital name", async () => {
      await expect(
        donorService.addDonationRecord(donorUserId, {
          donationDate: "2026-10-01",
          facilityName: "   ",
          facilityCity: "Hyderabad",
          bloodGroup: "O-",
          units: 1,
          donationType: "WHOLE_BLOOD",
        })
      ).rejects.toThrow(/facility or hospital name is required/i);
    });
  });

  describe("Donor Achievements & Rewards", () => {
    it("computes Lifesaver badge level based strictly on verified donations", async () => {
      const achievements = await donorService.getDonorAchievements(donorUserId);
      expect(achievements.verifiedDonationsCount).toBeGreaterThanOrEqual(3);
      expect(achievements.currentLevel).toBe("SILVER");
      expect(achievements.badges.length).toBe(4);
      expect(achievements.badges[0].isUnlocked).toBe(true); // Bronze
      expect(achievements.badges[1].isUnlocked).toBe(true); // Silver
    });
  });

  describe("Donor Appointment Scheduling", () => {
    it("schedules an appointment and lists active appointments", async () => {
      const apt = await donorService.bookAppointment(donorUserId, {
        facilityId: "fac-001",
        facilityName: "Apollo Hospital Jubilee Hills",
        facilityType: "HOSPITAL",
        city: "Hyderabad",
        date: "2026-10-25",
        timeSlot: "10:30 AM",
        notes: "Regular whole blood donation slot",
      });

      expect(apt.id).toBeDefined();
      expect(apt.status).toBe("SCHEDULED");
      expect(apt.donorName).toBe("Rahul Kumar");

      const list = await donorService.getAppointments(donorUserId);
      expect(list.length).toBe(1);
      expect(list[0].facilityName).toBe("Apollo Hospital Jubilee Hills");

      const cancelled = await donorService.cancelAppointment(donorUserId, apt.id);
      expect(cancelled.status).toBe("CANCELLED");
    });
  });
});
