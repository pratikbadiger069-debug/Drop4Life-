/**
 * Drop4Life — Blood Group Compatibility Utility
 * 
 * Provides pure, deterministic functions for general red blood cell (RBC) transfusion compatibility.
 * 
 * IMPORTANT MEDICAL SAFETY NOTE:
 * Educational guidance only. ABO/Rh compatibility alone does not establish transfusion safety.
 * Actual transfusions require appropriate clinical assessment, blood typing, antibody screening,
 * crossmatching when indicated, and approval by qualified healthcare professionals under applicable protocols.
 * 
 * This module concerns RED BLOOD CELL transfusions only. Do not apply these rules to plasma or platelet transfusions.
 */

import { BloodGroup } from "./types";
import { ALL_BLOOD_GROUPS } from "./constants";

export const RED_CELL_COMPATIBILITY_DISCLAIMER =
  "Educational guidance only. ABO/Rh compatibility alone does not establish transfusion safety. Actual transfusions require appropriate clinical assessment, blood typing, antibody screening, crossmatching when indicated, and approval by qualified healthcare professionals under applicable protocols.";

export interface BloodCompatibilityResult {
  isCompatible: boolean;
  donor: BloodGroup;
  recipient: BloodGroup;
  message: string;
  isUniversalDonor: boolean;
  isUniversalRecipient: boolean;
  antigenSummary: string;
  disclaimer: string;
}

/**
 * Standard Red Blood Cell (RBC) Recipient -> Compatible Donors Mapping
 * Based on ABO and Rh(D) antigen compatibility rules.
 */
export const RBC_RECIPIENT_TO_DONORS_MAP: Readonly<Record<BloodGroup, readonly BloodGroup[]>> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
} as const;

/**
 * Normalized string sanitizer for Blood Group values (handles unicode minuses, spaces, case)
 */
export function normalizeBloodGroup(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .toUpperCase()
    .replace(/[\u2212\u2013\u2014]/g, "-"); // Normalize unicode minus signs to standard ASCII hyphen
}

/**
 * Type-guard to validate if a value is a recognized standard BloodGroup
 */
export function isValidBloodGroup(bloodGroup: unknown): bloodGroup is BloodGroup {
  if (typeof bloodGroup !== "string") return false;
  const normalized = normalizeBloodGroup(bloodGroup);
  return (ALL_BLOOD_GROUPS as readonly string[]).includes(normalized);
}

/**
 * Returns the list of blood groups that can safely donate red blood cells to the specified recipient.
 * If the input is invalid or missing, returns an empty array.
 */
export function getCompatibleDonors(
  recipientBloodGroup: BloodGroup | string | null | undefined
): BloodGroup[] {
  if (!recipientBloodGroup) return [];
  const normalized = normalizeBloodGroup(recipientBloodGroup);
  if (!isValidBloodGroup(normalized)) return [];
  return [...RBC_RECIPIENT_TO_DONORS_MAP[normalized]];
}

/**
 * Returns the list of recipient blood groups that can safely receive red blood cells from the specified donor.
 * If the input is invalid or missing, returns an empty array.
 */
export function getCompatibleRecipients(
  donorBloodGroup: BloodGroup | string | null | undefined
): BloodGroup[] {
  if (!donorBloodGroup) return [];
  const normalized = normalizeBloodGroup(donorBloodGroup);
  if (!isValidBloodGroup(normalized)) return [];

  return ALL_BLOOD_GROUPS.filter((recipient) =>
    RBC_RECIPIENT_TO_DONORS_MAP[recipient].includes(normalized)
  );
}

/**
 * Checks whether a donor blood group is generally compatible to give red blood cells to a recipient blood group.
 * Returns false for any invalid, null, or undefined inputs.
 */
export function canDonateRedCells(
  donorBloodGroup: BloodGroup | string | null | undefined,
  recipientBloodGroup: BloodGroup | string | null | undefined
): boolean {
  if (!donorBloodGroup || !recipientBloodGroup) return false;
  const normalizedDonor = normalizeBloodGroup(donorBloodGroup);
  const normalizedRecipient = normalizeBloodGroup(recipientBloodGroup);

  if (!isValidBloodGroup(normalizedDonor) || !isValidBloodGroup(normalizedRecipient)) {
    return false;
  }

  const allowedDonors = RBC_RECIPIENT_TO_DONORS_MAP[normalizedRecipient];
  return allowedDonors.includes(normalizedDonor);
}

/**
 * Comprehensive compatibility calculation with detailed diagnostic output and safety disclaimers.
 */
export function getBloodGroupCompatibilityDetails(
  donorBloodGroup: BloodGroup | string | null | undefined,
  recipientBloodGroup: BloodGroup | string | null | undefined
): BloodCompatibilityResult | null {
  if (!donorBloodGroup || !recipientBloodGroup) return null;

  const normalizedDonor = normalizeBloodGroup(donorBloodGroup);
  const normalizedRecipient = normalizeBloodGroup(recipientBloodGroup);

  if (!isValidBloodGroup(normalizedDonor) || !isValidBloodGroup(normalizedRecipient)) {
    return null;
  }

  const isCompatible = canDonateRedCells(normalizedDonor, normalizedRecipient);
  const isUniversalDonor = normalizedDonor === "O-";
  const isUniversalRecipient = normalizedRecipient === "AB+";

  let antigenSummary = "";
  if (isCompatible) {
    if (isUniversalDonor) {
      antigenSummary = "O− red blood cells lack A, B, and Rh(D) surface antigens, making them generally compatible with all ABO/Rh recipient groups in emergencies.";
    } else if (isUniversalRecipient) {
      antigenSummary = "AB+ recipients have A, B, and Rh(D) antigens and do not naturally produce ABO/Rh antibodies against donor red cells.";
    } else {
      antigenSummary = `Donor ${normalizedDonor} red blood cells do not present conflicting ABO or Rh antigens for a ${normalizedRecipient} recipient.`;
    }
  } else {
    antigenSummary = `Donor ${normalizedDonor} red cells carry antigens that may trigger immune antibody reactions in a ${normalizedRecipient} recipient.`;
  }

  return {
    isCompatible,
    donor: normalizedDonor,
    recipient: normalizedRecipient,
    message: isCompatible
      ? "Generally compatible for red blood cell transfusion."
      : "Not generally compatible for red blood cell transfusion.",
    isUniversalDonor,
    isUniversalRecipient,
    antigenSummary,
    disclaimer: RED_CELL_COMPATIBILITY_DISCLAIMER,
  };
}

/**
 * Quick reference metadata for all 8 blood groups
 */
export interface BloodGroupMeta {
  group: BloodGroup;
  abo: "O" | "A" | "B" | "AB";
  rh: "Positive (+)" | "Negative (-)";
  antigensOnRedCells: string;
  antibodiesInPlasma: string;
  canDonateTo: BloodGroup[];
  canReceiveFrom: BloodGroup[];
  isUniversalDonor: boolean;
  isUniversalRecipient: boolean;
}

export const BLOOD_GROUP_DIRECTORY: Record<BloodGroup, BloodGroupMeta> = {
  "O-": {
    group: "O-",
    abo: "O",
    rh: "Negative (-)",
    antigensOnRedCells: "None (no A, B, or Rh antigens)",
    antibodiesInPlasma: "Anti-A, Anti-B, Anti-Rh",
    canDonateTo: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    canReceiveFrom: ["O-"],
    isUniversalDonor: true,
    isUniversalRecipient: false,
  },
  "O+": {
    group: "O+",
    abo: "O",
    rh: "Positive (+)",
    antigensOnRedCells: "Rh(D) antigen only",
    antibodiesInPlasma: "Anti-A, Anti-B",
    canDonateTo: ["O+", "A+", "B+", "AB+"],
    canReceiveFrom: ["O-", "O+"],
    isUniversalDonor: false,
    isUniversalRecipient: false,
  },
  "A-": {
    group: "A-",
    abo: "A",
    rh: "Negative (-)",
    antigensOnRedCells: "A antigen only",
    antibodiesInPlasma: "Anti-B, Anti-Rh",
    canDonateTo: ["A-", "A+", "AB-", "AB+"],
    canReceiveFrom: ["O-", "A-"],
    isUniversalDonor: false,
    isUniversalRecipient: false,
  },
  "A+": {
    group: "A+",
    abo: "A",
    rh: "Positive (+)",
    antigensOnRedCells: "A and Rh(D) antigens",
    antibodiesInPlasma: "Anti-B",
    canDonateTo: ["A+", "AB+"],
    canReceiveFrom: ["O-", "O+", "A-", "A+"],
    isUniversalDonor: false,
    isUniversalRecipient: false,
  },
  "B-": {
    group: "B-",
    abo: "B",
    rh: "Negative (-)",
    antigensOnRedCells: "B antigen only",
    antibodiesInPlasma: "Anti-A, Anti-Rh",
    canDonateTo: ["B-", "B+", "AB-", "AB+"],
    canReceiveFrom: ["O-", "B-"],
    isUniversalDonor: false,
    isUniversalRecipient: false,
  },
  "B+": {
    group: "B+",
    abo: "B",
    rh: "Positive (+)",
    antigensOnRedCells: "B and Rh(D) antigens",
    antibodiesInPlasma: "Anti-A",
    canDonateTo: ["B+", "AB+"],
    canReceiveFrom: ["O-", "O+", "B-", "B+"],
    isUniversalDonor: false,
    isUniversalRecipient: false,
  },
  "AB-": {
    group: "AB-",
    abo: "AB",
    rh: "Negative (-)",
    antigensOnRedCells: "A and B antigens",
    antibodiesInPlasma: "Anti-Rh",
    canDonateTo: ["AB-", "AB+"],
    canReceiveFrom: ["O-", "A-", "B-", "AB-"],
    isUniversalDonor: false,
    isUniversalRecipient: false,
  },
  "AB+": {
    group: "AB+",
    abo: "AB",
    rh: "Positive (+)",
    antigensOnRedCells: "A, B, and Rh(D) antigens",
    antibodiesInPlasma: "None",
    canDonateTo: ["AB+"],
    canReceiveFrom: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    isUniversalDonor: false,
    isUniversalRecipient: true,
  },
};
