import { describe, it, expect } from "vitest";
import { ALL_BLOOD_GROUPS } from "@/lib/constants";
import { BloodGroup } from "@/lib/types";
import {
  isValidBloodGroup,
  normalizeBloodGroup,
  getCompatibleDonors,
  getCompatibleRecipients,
  canDonateRedCells,
  getBloodGroupCompatibilityDetails,
  RBC_RECIPIENT_TO_DONORS_MAP,
  BLOOD_GROUP_DIRECTORY,
  RED_CELL_COMPATIBILITY_DISCLAIMER,
} from "@/lib/blood-compatibility";

describe("Blood Group Compatibility Utility", () => {
  describe("normalizeBloodGroup", () => {
    it("trims and upper-cases standard blood groups", () => {
      expect(normalizeBloodGroup("  a+  ")).toBe("A+");
      expect(normalizeBloodGroup("ab-")).toBe("AB-");
      expect(normalizeBloodGroup("o+")).toBe("O+");
    });

    it("converts unicode minus symbols (\\u2212, en-dash, em-dash) to standard ASCII hyphen", () => {
      expect(normalizeBloodGroup("O−")).toBe("O-"); // unicode \u2212
      expect(normalizeBloodGroup("A–")).toBe("A-"); // en-dash
      expect(normalizeBloodGroup("AB—")).toBe("AB-"); // em-dash
    });

    it("handles non-string inputs safely", () => {
      expect(normalizeBloodGroup(null)).toBe("");
      expect(normalizeBloodGroup(undefined)).toBe("");
      expect(normalizeBloodGroup(123 as unknown as string)).toBe("");
    });
  });

  describe("isValidBloodGroup", () => {
    it("returns true for all 8 official blood groups", () => {
      const groups: BloodGroup[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
      groups.forEach((bg) => {
        expect(isValidBloodGroup(bg)).toBe(true);
      });
    });

    it("returns true for lowercase and unicode minus variants of valid groups", () => {
      expect(isValidBloodGroup("o-")).toBe(true);
      expect(isValidBloodGroup("O−")).toBe(true);
      expect(isValidBloodGroup("ab+")).toBe(true);
    });

    it("returns false for invalid blood groups and arbitrary strings", () => {
      expect(isValidBloodGroup("C+")).toBe(false);
      expect(isValidBloodGroup("XYZ")).toBe(false);
      expect(isValidBloodGroup("A*")).toBe(false);
      expect(isValidBloodGroup("")).toBe(false);
      expect(isValidBloodGroup(null)).toBe(false);
      expect(isValidBloodGroup(undefined)).toBe(false);
      expect(isValidBloodGroup(42)).toBe(false);
    });
  });

  describe("RBC Recipient Compatibility Table Compliance (All 8 Groups)", () => {
    const expectedRecipientDonors: Record<BloodGroup, BloodGroup[]> = {
      "O-": ["O-"],
      "O+": ["O-", "O+"],
      "A-": ["O-", "A-"],
      "A+": ["O-", "O+", "A-", "A+"],
      "B-": ["O-", "B-"],
      "B+": ["O-", "O+", "B-", "B+"],
      "AB-": ["O-", "A-", "B-", "AB-"],
      "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    };

    it("returns the exact approved compatible donor groups for each recipient", () => {
      ALL_BLOOD_GROUPS.forEach((recipient) => {
        const donors = getCompatibleDonors(recipient);
        expect(donors).toEqual(expectedRecipientDonors[recipient]);
      });
    });

    it("returns empty array for invalid or empty recipient blood groups", () => {
      expect(getCompatibleDonors("")).toEqual([]);
      expect(getCompatibleDonors(null)).toEqual([]);
      expect(getCompatibleDonors(undefined)).toEqual([]);
      expect(getCompatibleDonors("INVALID")).toEqual([]);
    });
  });

  describe("canDonateRedCells (Full 8x8 = 64 Matrix Verification)", () => {
    const expectedRecipientDonors: Record<BloodGroup, BloodGroup[]> = {
      "O-": ["O-"],
      "O+": ["O-", "O+"],
      "A-": ["O-", "A-"],
      "A+": ["O-", "O+", "A-", "A+"],
      "B-": ["O-", "B-"],
      "B+": ["O-", "O+", "B-", "B+"],
      "AB-": ["O-", "A-", "B-", "AB-"],
      "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    };

    it("accurately evaluates all 64 donor-recipient combinations", () => {
      ALL_BLOOD_GROUPS.forEach((donor) => {
        ALL_BLOOD_GROUPS.forEach((recipient) => {
          const expected = expectedRecipientDonors[recipient].includes(donor);
          const actual = canDonateRedCells(donor, recipient);
          expect(
            actual,
            `Expected canDonateRedCells(${donor}, ${recipient}) to be ${expected}`
          ).toBe(expected);
        });
      });
    });

    it("verifies Universal Red Cell Donor (O-) can donate to all 8 groups", () => {
      ALL_BLOOD_GROUPS.forEach((recipient) => {
        expect(canDonateRedCells("O-", recipient)).toBe(true);
      });
    });

    it("verifies Universal Red Cell Recipient (AB+) can receive from all 8 groups", () => {
      ALL_BLOOD_GROUPS.forEach((donor) => {
        expect(canDonateRedCells(donor, "AB+")).toBe(true);
      });
    });

    it("verifies O- recipient can only receive from O-", () => {
      expect(canDonateRedCells("O-", "O-")).toBe(true);
      expect(canDonateRedCells("O+", "O-")).toBe(false);
      expect(canDonateRedCells("A-", "O-")).toBe(false);
      expect(canDonateRedCells("A+", "O-")).toBe(false);
      expect(canDonateRedCells("B-", "O-")).toBe(false);
      expect(canDonateRedCells("B+", "O-")).toBe(false);
      expect(canDonateRedCells("AB-", "O-")).toBe(false);
      expect(canDonateRedCells("AB+", "O-")).toBe(false);
    });

    it("returns false when donor or recipient is invalid, missing, or null", () => {
      expect(canDonateRedCells("O-", null)).toBe(false);
      expect(canDonateRedCells(null, "AB+")).toBe(false);
      expect(canDonateRedCells("", "")).toBe(false);
      expect(canDonateRedCells("INVALID", "O+")).toBe(false);
      expect(canDonateRedCells("O+", "INVALID")).toBe(false);
    });
  });

  describe("getCompatibleRecipients", () => {
    it("returns all 8 recipient groups for universal donor O-", () => {
      const recipients = getCompatibleRecipients("O-");
      expect(recipients).toEqual(ALL_BLOOD_GROUPS);
    });

    it("returns only AB+ for AB+ donor", () => {
      const recipients = getCompatibleRecipients("AB+");
      expect(recipients).toEqual(["AB+"]);
    });

    it("returns correct recipients for A- donor (A-, A+, AB-, AB+)", () => {
      const recipients = getCompatibleRecipients("A-");
      expect(recipients).toEqual(["A-", "A+", "AB-", "AB+"]);
    });

    it("returns correct recipients for B+ donor (B+, AB+)", () => {
      const recipients = getCompatibleRecipients("B+");
      expect(recipients).toEqual(["B+", "AB+"]);
    });

    it("returns empty array for invalid donor inputs", () => {
      expect(getCompatibleRecipients("")).toEqual([]);
      expect(getCompatibleRecipients(null)).toEqual([]);
      expect(getCompatibleRecipients("UNKNOWN")).toEqual([]);
    });

    it("maintains strict mathematical symmetry with canDonateRedCells", () => {
      ALL_BLOOD_GROUPS.forEach((donor) => {
        const recipients = getCompatibleRecipients(donor);
        ALL_BLOOD_GROUPS.forEach((recipient) => {
          const isRecipientInList = recipients.includes(recipient);
          const isCompatible = canDonateRedCells(donor, recipient);
          expect(isRecipientInList).toBe(isCompatible);
        });
      });
    });
  });

  describe("getBloodGroupCompatibilityDetails", () => {
    it("returns detailed compatibility report for compatible pair", () => {
      const result = getBloodGroupCompatibilityDetails("O-", "AB+");
      expect(result).not.toBeNull();
      expect(result?.isCompatible).toBe(true);
      expect(result?.donor).toBe("O-");
      expect(result?.recipient).toBe("AB+");
      expect(result?.message).toBe("Generally compatible for red blood cell transfusion.");
      expect(result?.isUniversalDonor).toBe(true);
      expect(result?.isUniversalRecipient).toBe(true);
      expect(result?.disclaimer).toBe(RED_CELL_COMPATIBILITY_DISCLAIMER);
    });

    it("returns detailed compatibility report for incompatible pair", () => {
      const result = getBloodGroupCompatibilityDetails("AB+", "O-");
      expect(result).not.toBeNull();
      expect(result?.isCompatible).toBe(false);
      expect(result?.donor).toBe("AB+");
      expect(result?.recipient).toBe("O-");
      expect(result?.message).toBe("Not generally compatible for red blood cell transfusion.");
      expect(result?.isUniversalDonor).toBe(false);
      expect(result?.isUniversalRecipient).toBe(false);
      expect(result?.disclaimer).toBe(RED_CELL_COMPATIBILITY_DISCLAIMER);
    });

    it("returns null for missing or invalid parameters", () => {
      expect(getBloodGroupCompatibilityDetails(null, "O+")).toBeNull();
      expect(getBloodGroupCompatibilityDetails("A+", null)).toBeNull();
      expect(getBloodGroupCompatibilityDetails("XYZ", "O+")).toBeNull();
    });
  });

  describe("BLOOD_GROUP_DIRECTORY metadata", () => {
    it("contains comprehensive metadata for all 8 blood groups", () => {
      ALL_BLOOD_GROUPS.forEach((bg) => {
        const meta = BLOOD_GROUP_DIRECTORY[bg];
        expect(meta).toBeDefined();
        expect(meta.group).toBe(bg);
        expect(meta.canDonateTo.length).toBeGreaterThan(0);
        expect(meta.canReceiveFrom.length).toBeGreaterThan(0);
      });
    });
  });
});
