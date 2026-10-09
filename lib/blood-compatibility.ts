/**
 * Drop4Life — Blood Group & Component Compatibility Utility
 * 
 * Provides deterministic functions for general Red Blood Cell (RBC) and Plasma transfusion compatibility.
 * 
 * IMPORTANT MEDICAL SAFETY NOTE:
 * This tool provides general compatibility information only. Actual transfusion compatibility must
 * be confirmed by qualified healthcare professionals through appropriate blood grouping,
 * antibody screening, and crossmatching.
 */

import { BloodGroup } from "./types";
import { ALL_BLOOD_GROUPS } from "./constants";

export const COMPATIBILITY_CLINICAL_DISCLAIMER =
  "This tool provides general compatibility information only. Actual transfusion compatibility must be confirmed by qualified healthcare professionals through appropriate blood grouping, antibody screening, and crossmatching.";

export const RED_CELL_COMPATIBILITY_DISCLAIMER = COMPATIBILITY_CLINICAL_DISCLAIMER;

export type SupportedComponent = "rbc" | "plasma";

export interface BloodCompatibilityResult {
  isCompatible: boolean;
  donor: BloodGroup;
  recipient: BloodGroup;
  component: SupportedComponent;
  message: string;
  isUniversalDonor: boolean;
  isUniversalRecipient: boolean;
  antigenSummary: string;
  disclaimer: string;
}

/**
 * Standard Red Blood Cell (RBC) Recipient -> Compatible Donors Mapping
 * Based on ABO and Rh(D) surface antigens.
 * O- is universal RBC donor; AB+ is universal RBC recipient.
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
 * Standard Plasma Recipient -> Compatible Donors Mapping
 * Plasma compatibility is determined by circulating antibodies (Anti-A, Anti-B).
 * AB plasma has no ABO antibodies (universal plasma donor).
 * O plasma contains both anti-A and anti-B antibodies (can only donate to O).
 * O recipients can receive plasma from any blood group (universal plasma recipient).
 */
export const PLASMA_RECIPIENT_TO_DONORS_MAP: Readonly<Record<BloodGroup, readonly BloodGroup[]>> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A-", "A+", "AB-", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B-", "B+", "AB-", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB-", "AB+"],
} as const;

/**
 * Normalized string sanitizer for Blood Group values (handles unicode minuses, spaces, case)
 */
export function normalizeBloodGroup(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .toUpperCase()
    .replace(/[\u2212\u2013\u2014]/g, "-");
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
 * Returns the list of blood groups that can donate the specified component to the recipient.
 */
export function getCompatibleDonors(
  recipientBloodGroup: BloodGroup | string | null | undefined,
  component: SupportedComponent = "rbc"
): BloodGroup[] {
  if (!recipientBloodGroup) return [];
  const normalized = normalizeBloodGroup(recipientBloodGroup);
  if (!isValidBloodGroup(normalized)) return [];

  const map = component === "plasma" ? PLASMA_RECIPIENT_TO_DONORS_MAP : RBC_RECIPIENT_TO_DONORS_MAP;
  return [...map[normalized]];
}

/**
 * Returns the list of recipient blood groups that can receive the specified component from the donor.
 */
export function getCompatibleRecipients(
  donorBloodGroup: BloodGroup | string | null | undefined,
  component: SupportedComponent = "rbc"
): BloodGroup[] {
  if (!donorBloodGroup) return [];
  const normalized = normalizeBloodGroup(donorBloodGroup);
  if (!isValidBloodGroup(normalized)) return [];

  const map = component === "plasma" ? PLASMA_RECIPIENT_TO_DONORS_MAP : RBC_RECIPIENT_TO_DONORS_MAP;
  return ALL_BLOOD_GROUPS.filter((recipient) => map[recipient].includes(normalized));
}

/**
 * Checks whether a donor blood group is compatible for Red Blood Cell transfusion.
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

  return RBC_RECIPIENT_TO_DONORS_MAP[normalizedRecipient].includes(normalizedDonor);
}

/**
 * Checks whether a donor blood group is compatible for Plasma transfusion.
 */
export function canDonatePlasma(
  donorBloodGroup: BloodGroup | string | null | undefined,
  recipientBloodGroup: BloodGroup | string | null | undefined
): boolean {
  if (!donorBloodGroup || !recipientBloodGroup) return false;
  const normalizedDonor = normalizeBloodGroup(donorBloodGroup);
  const normalizedRecipient = normalizeBloodGroup(recipientBloodGroup);

  if (!isValidBloodGroup(normalizedDonor) || !isValidBloodGroup(normalizedRecipient)) {
    return false;
  }

  return PLASMA_RECIPIENT_TO_DONORS_MAP[normalizedRecipient].includes(normalizedDonor);
}

/**
 * Unified component donation check
 */
export function canDonate(
  donorBloodGroup: BloodGroup | string | null | undefined,
  recipientBloodGroup: BloodGroup | string | null | undefined,
  component: SupportedComponent = "rbc"
): boolean {
  return component === "plasma"
    ? canDonatePlasma(donorBloodGroup, recipientBloodGroup)
    : canDonateRedCells(donorBloodGroup, recipientBloodGroup);
}

/**
 * Returns true if blood group is considered universal donor for the given component
 */
export function isUniversalDonor(
  bloodGroup: BloodGroup | string | null | undefined,
  component: SupportedComponent = "rbc"
): boolean {
  if (!bloodGroup) return false;
  const normalized = normalizeBloodGroup(bloodGroup);
  if (component === "plasma") {
    return normalized === "AB+" || normalized === "AB-";
  }
  return normalized === "O-";
}

/**
 * Returns true if blood group is considered universal recipient for the given component
 */
export function isUniversalRecipient(
  bloodGroup: BloodGroup | string | null | undefined,
  component: SupportedComponent = "rbc"
): boolean {
  if (!bloodGroup) return false;
  const normalized = normalizeBloodGroup(bloodGroup);
  if (component === "plasma") {
    return normalized === "O+" || normalized === "O-";
  }
  return normalized === "AB+";
}

/**
 * Comprehensive compatibility calculation with detailed diagnostic output and clinical safety disclaimers.
 */
export function getBloodGroupCompatibilityDetails(
  donorBloodGroup: BloodGroup | string | null | undefined,
  recipientBloodGroup: BloodGroup | string | null | undefined,
  component: SupportedComponent = "rbc"
): BloodCompatibilityResult | null {
  if (!donorBloodGroup || !recipientBloodGroup) return null;

  const normalizedDonor = normalizeBloodGroup(donorBloodGroup);
  const normalizedRecipient = normalizeBloodGroup(recipientBloodGroup);

  if (!isValidBloodGroup(normalizedDonor) || !isValidBloodGroup(normalizedRecipient)) {
    return null;
  }

  const isCompatible = canDonate(normalizedDonor, normalizedRecipient, component);
  const isUniversalDonor =
    component === "plasma"
      ? normalizedDonor.startsWith("AB")
      : normalizedDonor === "O-";
  const isUniversalRecipient =
    component === "plasma"
      ? normalizedRecipient.startsWith("O")
      : normalizedRecipient === "AB+";

  let antigenSummary = "";
  if (component === "plasma") {
    if (isCompatible) {
      if (normalizedDonor.startsWith("AB")) {
        antigenSummary = "AB plasma lacks anti-A and anti-B antibodies, making AB donors universal plasma donors for all blood groups.";
      } else if (normalizedRecipient.startsWith("O")) {
        antigenSummary = "O recipients' red blood cells lack A and B antigens, meaning they can safely receive plasma containing anti-A or anti-B antibodies from all donor groups.";
      } else {
        antigenSummary = `Donor ${normalizedDonor} plasma does not carry conflicting antibodies against ${normalizedRecipient} red blood cells.`;
      }
    } else {
      antigenSummary = `Donor ${normalizedDonor} plasma contains antibodies that would attack and hemolyze recipient ${normalizedRecipient} red blood cells.`;
    }
  } else {
    // Red Blood Cells
    if (isCompatible) {
      if (normalizedDonor === "O-") {
        antigenSummary = "O− red blood cells lack A, B, and Rh(D) surface antigens, making them generally compatible with all ABO/Rh recipient groups in emergencies.";
      } else if (normalizedRecipient === "AB+") {
        antigenSummary = "AB+ recipients have A, B, and Rh(D) antigens and do not naturally produce ABO/Rh antibodies against donor red cells.";
      } else {
        antigenSummary = `Donor ${normalizedDonor} red blood cells do not present conflicting ABO or Rh antigens for a ${normalizedRecipient} recipient.`;
      }
    } else {
      antigenSummary = `Donor ${normalizedDonor} red cells carry antigens that may trigger immune antibody reactions in a ${normalizedRecipient} recipient.`;
    }
  }

  return {
    isCompatible,
    donor: normalizedDonor,
    recipient: normalizedRecipient,
    component,
    message: isCompatible
      ? `Generally compatible for ${component === "plasma" ? "plasma" : "red blood cell"} transfusion.`
      : `Not generally compatible for ${component === "plasma" ? "plasma" : "red blood cell"} transfusion.`,
    isUniversalDonor,
    isUniversalRecipient,
    antigenSummary,
    disclaimer: COMPATIBILITY_CLINICAL_DISCLAIMER,
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
  canDonateRbcTo: BloodGroup[];
  canReceiveRbcFrom: BloodGroup[];
  canDonatePlasmaTo: BloodGroup[];
  canReceivePlasmaFrom: BloodGroup[];
  isUniversalRbcDonor: boolean;
  isUniversalRbcRecipient: boolean;
  isUniversalPlasmaDonor: boolean;
  isUniversalPlasmaRecipient: boolean;
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
    canDonateRbcTo: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    canReceiveRbcFrom: ["O-"],
    canDonatePlasmaTo: ["O-", "O+"],
    canReceivePlasmaFrom: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    isUniversalRbcDonor: true,
    isUniversalRbcRecipient: false,
    isUniversalPlasmaDonor: false,
    isUniversalPlasmaRecipient: true,
  },
  "O+": {
    group: "O+",
    abo: "O",
    rh: "Positive (+)",
    antigensOnRedCells: "Rh(D) antigen only",
    antibodiesInPlasma: "Anti-A, Anti-B",
    canDonateTo: ["O+", "A+", "B+", "AB+"],
    canReceiveFrom: ["O-", "O+"],
    canDonateRbcTo: ["O+", "A+", "B+", "AB+"],
    canReceiveRbcFrom: ["O-", "O+"],
    canDonatePlasmaTo: ["O-", "O+"],
    canReceivePlasmaFrom: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    isUniversalRbcDonor: false,
    isUniversalRbcRecipient: false,
    isUniversalPlasmaDonor: false,
    isUniversalPlasmaRecipient: true,
  },
  "A-": {
    group: "A-",
    abo: "A",
    rh: "Negative (-)",
    antigensOnRedCells: "A antigen only",
    antibodiesInPlasma: "Anti-B, Anti-Rh",
    canDonateTo: ["A-", "A+", "AB-", "AB+"],
    canReceiveFrom: ["O-", "A-"],
    canDonateRbcTo: ["A-", "A+", "AB-", "AB+"],
    canReceiveRbcFrom: ["O-", "A-"],
    canDonatePlasmaTo: ["A-", "A+", "O-", "O+"],
    canReceivePlasmaFrom: ["A-", "A+", "AB-", "AB+"],
    isUniversalRbcDonor: false,
    isUniversalRbcRecipient: false,
    isUniversalPlasmaDonor: false,
    isUniversalPlasmaRecipient: false,
  },
  "A+": {
    group: "A+",
    abo: "A",
    rh: "Positive (+)",
    antigensOnRedCells: "A and Rh(D) antigens",
    antibodiesInPlasma: "Anti-B",
    canDonateTo: ["A+", "AB+"],
    canReceiveFrom: ["O-", "O+", "A-", "A+"],
    canDonateRbcTo: ["A+", "AB+"],
    canReceiveRbcFrom: ["O-", "O+", "A-", "A+"],
    canDonatePlasmaTo: ["A-", "A+", "O-", "O+"],
    canReceivePlasmaFrom: ["A-", "A+", "AB-", "AB+"],
    isUniversalRbcDonor: false,
    isUniversalRbcRecipient: false,
    isUniversalPlasmaDonor: false,
    isUniversalPlasmaRecipient: false,
  },
  "B-": {
    group: "B-",
    abo: "B",
    rh: "Negative (-)",
    antigensOnRedCells: "B antigen only",
    antibodiesInPlasma: "Anti-A, Anti-Rh",
    canDonateTo: ["B-", "B+", "AB-", "AB+"],
    canReceiveFrom: ["O-", "B-"],
    canDonateRbcTo: ["B-", "B+", "AB-", "AB+"],
    canReceiveRbcFrom: ["O-", "B-"],
    canDonatePlasmaTo: ["B-", "B+", "O-", "O+"],
    canReceivePlasmaFrom: ["B-", "B+", "AB-", "AB+"],
    isUniversalRbcDonor: false,
    isUniversalRbcRecipient: false,
    isUniversalPlasmaDonor: false,
    isUniversalPlasmaRecipient: false,
  },
  "B+": {
    group: "B+",
    abo: "B",
    rh: "Positive (+)",
    antigensOnRedCells: "B and Rh(D) antigens",
    antibodiesInPlasma: "Anti-A",
    canDonateTo: ["B+", "AB+"],
    canReceiveFrom: ["O-", "O+", "B-", "B+"],
    canDonateRbcTo: ["B+", "AB+"],
    canReceiveRbcFrom: ["O-", "O+", "B-", "B+"],
    canDonatePlasmaTo: ["B-", "B+", "O-", "O+"],
    canReceivePlasmaFrom: ["B-", "B+", "AB-", "AB+"],
    isUniversalRbcDonor: false,
    isUniversalRbcRecipient: false,
    isUniversalPlasmaDonor: false,
    isUniversalPlasmaRecipient: false,
  },
  "AB-": {
    group: "AB-",
    abo: "AB",
    rh: "Negative (-)",
    antigensOnRedCells: "A and B antigens",
    antibodiesInPlasma: "Anti-Rh",
    canDonateTo: ["AB-", "AB+"],
    canReceiveFrom: ["O-", "A-", "B-", "AB-"],
    canDonateRbcTo: ["AB-", "AB+"],
    canReceiveRbcFrom: ["O-", "A-", "B-", "AB-"],
    canDonatePlasmaTo: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    canReceivePlasmaFrom: ["AB-", "AB+"],
    isUniversalRbcDonor: false,
    isUniversalRbcRecipient: false,
    isUniversalPlasmaDonor: true,
    isUniversalPlasmaRecipient: false,
  },
  "AB+": {
    group: "AB+",
    abo: "AB",
    rh: "Positive (+)",
    antigensOnRedCells: "A, B, and Rh(D) antigens",
    antibodiesInPlasma: "None",
    canDonateTo: ["AB+"],
    canReceiveFrom: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    canDonateRbcTo: ["AB+"],
    canReceiveRbcFrom: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    canDonatePlasmaTo: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    canReceivePlasmaFrom: ["AB-", "AB+"],
    isUniversalRbcDonor: false,
    isUniversalRbcRecipient: true,
    isUniversalPlasmaDonor: true,
    isUniversalPlasmaRecipient: false,
  },
};
