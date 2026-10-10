import { describe, it, expect } from "vitest";
import {
  isValidIndianPhoneNumber,
  formatIndianPhoneNumber,
  INDIAN_CITIES,
  INDIAN_STATES,
} from "@/lib/constants";
import { DEMO_ACCOUNTS } from "@/lib/auth/auth-adapter";
import { VERIFIED_FACILITIES } from "@/lib/location/location-service";
import { maskPhoneNumber } from "@/lib/communication/communication-service";

describe("Indian Localization & Test Data Verification (Section 9)", () => {
  describe("Indian Phone Number Validation & Formatting", () => {
    it("accepts valid 10-digit Indian phone numbers starting with 6, 7, 8, or 9", () => {
      expect(isValidIndianPhoneNumber("9876543210")).toBe(true);
      expect(isValidIndianPhoneNumber("8765432109")).toBe(true);
      expect(isValidIndianPhoneNumber("7654321098")).toBe(true);
      expect(isValidIndianPhoneNumber("6543210987")).toBe(true);
    });

    it("accepts Indian phone numbers with +91 country code and spaces/hyphens", () => {
      expect(isValidIndianPhoneNumber("+91 98765 00001")).toBe(true);
      expect(isValidIndianPhoneNumber("+91-98765-43210")).toBe(true);
      expect(isValidIndianPhoneNumber("09876543210")).toBe(true);
    });

    it("rejects invalid phone numbers (US format, invalid length, invalid start digit)", () => {
      expect(isValidIndianPhoneNumber("+1 555 123 4567")).toBe(false);
      expect(isValidIndianPhoneNumber("1234567890")).toBe(false); // starts with 1
      expect(isValidIndianPhoneNumber("5554321098")).toBe(false); // starts with 5
      expect(isValidIndianPhoneNumber("98765")).toBe(false); // too short
      expect(isValidIndianPhoneNumber("")).toBe(false);
      expect(isValidIndianPhoneNumber("abc123456789")).toBe(false);
    });

    it("formats Indian phone numbers canonically to +91 XXXXX XXXXX", () => {
      expect(formatIndianPhoneNumber("9876500001")).toBe("+91 98765 00001");
      expect(formatIndianPhoneNumber("+919876500001")).toBe("+91 98765 00001");
    });

    it("masks phone numbers correctly to protect donor and recipient privacy", () => {
      const masked = maskPhoneNumber("+91 98765 00001");
      expect(masked).toBe("+91 98XXX X0001");
      expect(masked).not.toContain("98765");
    });
  });

  describe("Indian Demo Users Across All Supported Roles", () => {
    it("provides realistic Indian demo accounts for Donor, Hospital, NGO, Recipient, Blood Bank, and Admin", () => {
      const roles = DEMO_ACCOUNTS.map((a) => a.user.role);
      expect(roles).toContain("donor");
      expect(roles).toContain("hospital");
      expect(roles).toContain("ngo");
      expect(roles).toContain("recipient");
      expect(roles).toContain("bloodbank");
      expect(roles).toContain("admin");
    });

    it("ensures all demo users have authentic Indian names and Indian cities", () => {
      const indianNameKeywords = [
        "Kumar",
        "Verma",
        "Reddy",
        "Sharma",
        "Patel",
        "Nair",
        "Singh",
        "Aarav",
        "Rahul",
        "Priya",
        "Ananya",
        "Sneha",
      ];

      for (const account of DEMO_ACCOUNTS) {
        const hasIndianName = indianNameKeywords.some((keyword) =>
          account.user.fullName.includes(keyword)
        );
        expect(hasIndianName).toBe(true);

        // Verify city is in the Indian cities or states catalog
        if (account.user.city) {
          const isIndianCity = (INDIAN_CITIES as readonly string[]).includes(account.user.city);
          expect(isIndianCity).toBe(true);
        }
      }
    });
  });

  describe("Verified Healthcare Facilities & Locations", () => {
    it("lists only Indian healthcare institutions and cities in the verified directory", () => {
      expect(VERIFIED_FACILITIES.length).toBeGreaterThanOrEqual(5);

      for (const fac of VERIFIED_FACILITIES) {
        expect(INDIAN_CITIES).toContain(fac.city);
        expect(isValidIndianPhoneNumber(fac.phone)).toBe(true);
        expect(fac.phone).toContain("+91");
      }
    });

    it("includes key Indian metropolitan regions in the location directory", () => {
      expect(INDIAN_CITIES).toContain("Hyderabad");
      expect(INDIAN_CITIES).toContain("Bengaluru");
      expect(INDIAN_CITIES).toContain("Chennai");
      expect(INDIAN_CITIES).toContain("Mumbai");
      expect(INDIAN_CITIES).toContain("New Delhi");
      expect(INDIAN_CITIES).toContain("Vijayawada");
      expect(INDIAN_CITIES).toContain("Visakhapatnam");
    });
  });
});
