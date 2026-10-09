/**
 * Drop4Life — Hospital Profile & Blood Bank Inventory Service Layer
 * 
 * Manages hospital profile details, 8-group blood inventory tracking,
 * stock status calculations, quarantine/untested unit isolation, and audit logging.
 * 
 * SECURITY & ACCESS CONTROL:
 * - Enforces role-based authorization: only authenticated hospital accounts and administrators can access and update inventory.
 * - Prevents donor or cross-role tampering.
 * - Validates all quantities (rejects negative numbers and non-integers).
 * - Records timestamps and responsible staff identity on every stock update.
 */

import {
  HospitalProfile,
  BloodInventoryItem,
  StockStatus,
  InventoryAdjustmentReason,
  InventoryAuditLog,
  BloodGroup,
} from "@/lib/types";
import { authAdapter } from "@/lib/auth/auth-adapter";
import { ALL_BLOOD_GROUPS } from "@/lib/constants";
import { isValidBloodGroup } from "@/lib/blood-compatibility";

const HOSPITAL_PROFILES_STORAGE_KEY = "drop4life_hospital_profiles";
const HOSPITAL_INVENTORY_STORAGE_KEY = "drop4life_hospital_inventory";
const HOSPITAL_AUDIT_STORAGE_KEY = "drop4life_hospital_audit_logs";

/**
 * Calculates stock status based on available units and configured threshold
 */
export function calculateStockStatus(
  availableUnits: number,
  lowStockThreshold: number
): StockStatus {
  if (availableUnits <= Math.floor(lowStockThreshold / 2)) {
    return "CRITICAL_LOW";
  }
  if (availableUnits < lowStockThreshold) {
    return "LOW_STOCK";
  }
  if (availableUnits >= Math.round(lowStockThreshold * 2.5)) {
    return "SURPLUS";
  }
  return "ADEQUATE";
}

/**
 * Seeded Hospital Profile for Demo Hospital Account
 */
const DEFAULT_DEMO_HOSPITAL_PROFILE: HospitalProfile = {
  id: "hosp-prof-002",
  userId: "usr-hosp-002",
  hospitalName: "St. Jude Medical Center",
  licenseNumber: "NY-MED-884210-A",
  department: "Transfusion Medicine & Critical Care Blood Bank",
  contactPerson: "Dr. David Brooks",
  workEmail: "hospital@drop4life.org",
  phone: "+1 (555) 345-6789",
  emergencyPhone: "+1 (555) 911-7890",
  address: "420 East 70th Street, Transfusion Center Wing B",
  city: "New York",
  isVerified: true,
  verificationStatus: "verified",
  totalBeds: 650,
  bloodBankLicense: "FDA-BB-2024-9982",
  updatedAt: "2026-10-01T00:00:00Z",
};

/**
 * Seeded 8-Group Inventory for Demo Hospital
 */
function createDefaultInventory(hospitalId: string): BloodInventoryItem[] {
  const defaults: Array<{
    bloodGroup: BloodGroup;
    availableUnits: number;
    reservedUnits: number;
    quarantinedUnits: number;
    expiredUnits: number;
    lowStockThreshold: number;
  }> = [
    { bloodGroup: "O-", availableUnits: 2, reservedUnits: 2, quarantinedUnits: 1, expiredUnits: 0, lowStockThreshold: 8 },
    { bloodGroup: "O+", availableUnits: 14, reservedUnits: 4, quarantinedUnits: 2, expiredUnits: 1, lowStockThreshold: 10 },
    { bloodGroup: "A-", availableUnits: 4, reservedUnits: 1, quarantinedUnits: 0, expiredUnits: 0, lowStockThreshold: 6 },
    { bloodGroup: "A+", availableUnits: 18, reservedUnits: 5, quarantinedUnits: 3, expiredUnits: 0, lowStockThreshold: 10 },
    { bloodGroup: "B-", availableUnits: 3, reservedUnits: 1, quarantinedUnits: 1, expiredUnits: 0, lowStockThreshold: 5 },
    { bloodGroup: "B+", availableUnits: 12, reservedUnits: 3, quarantinedUnits: 2, expiredUnits: 0, lowStockThreshold: 8 },
    { bloodGroup: "AB-", availableUnits: 2, reservedUnits: 0, quarantinedUnits: 0, expiredUnits: 0, lowStockThreshold: 4 },
    { bloodGroup: "AB+", availableUnits: 20, reservedUnits: 6, quarantinedUnits: 2, expiredUnits: 1, lowStockThreshold: 8 },
  ];

  return defaults.map((item) => ({
    hospitalId,
    bloodGroup: item.bloodGroup,
    availableUnits: item.availableUnits,
    reservedUnits: item.reservedUnits,
    quarantinedUnits: item.quarantinedUnits,
    expiredUnits: item.expiredUnits,
    lowStockThreshold: item.lowStockThreshold,
    stockStatus: calculateStockStatus(item.availableUnits, item.lowStockThreshold),
    lastUpdatedAt: "2026-10-01T08:00:00Z",
    lastUpdatedByStaffId: "usr-hosp-002",
    lastUpdatedByStaffName: "Dr. David Brooks",
    unitsAvailable: item.availableUnits,
  }));
}

/**
 * Seeded Audit Logs for Demonstration
 */
const DEFAULT_AUDIT_LOGS: InventoryAuditLog[] = [
  {
    id: "log-aud-001",
    hospitalId: "hosp-prof-002",
    bloodGroup: "O-",
    reason: "TRANSFUSION_DISPATCH",
    previousAvailable: 4,
    newAvailable: 2,
    previousReserved: 2,
    newReserved: 2,
    previousQuarantined: 1,
    newQuarantined: 1,
    previousExpired: 0,
    newExpired: 0,
    staffId: "usr-hosp-002",
    staffName: "Dr. David Brooks",
    notes: "Dispatched 2 units O- for Trauma Emergency Bay 3.",
    timestamp: "2026-10-08T19:40:00Z",
  },
  {
    id: "log-aud-002",
    hospitalId: "hosp-prof-002",
    bloodGroup: "A+",
    reason: "DONATION_RECEIVED",
    previousAvailable: 15,
    newAvailable: 18,
    previousReserved: 5,
    newReserved: 5,
    previousQuarantined: 3,
    newQuarantined: 3,
    previousExpired: 0,
    newExpired: 0,
    staffId: "usr-hosp-002",
    staffName: "Dr. David Brooks",
    notes: "Cleared 3 screened units from mobile collection batch #MC-492.",
    timestamp: "2026-10-07T11:20:00Z",
  },
  {
    id: "log-aud-003",
    hospitalId: "hosp-prof-002",
    bloodGroup: "AB+",
    reason: "EXPIRED_DISPOSAL",
    previousAvailable: 20,
    newAvailable: 20,
    previousReserved: 6,
    newReserved: 6,
    previousQuarantined: 2,
    newQuarantined: 2,
    previousExpired: 0,
    newExpired: 1,
    staffId: "usr-hosp-002",
    staffName: "Dr. David Brooks",
    notes: "Isolated 1 unit AB+ past standard 42-day RBC viability window.",
    timestamp: "2026-10-06T09:15:00Z",
  },
];

class HospitalService {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  /**
   * Helper to verify hospital authorization and reject donor / unauthorized callers.
   */
  private assertHospitalUser(): { id: string; fullName: string; role: string } {
    const session = authAdapter.getSession();
    if (!session || !session.user) {
      throw new Error("Authentication required: Please sign in to access hospital blood inventory.");
    }
    if (session.user.role !== "hospital" && session.user.role !== "admin") {
      throw new Error("Access Denied: Only authorized hospital personnel and administrators can access hospital inventory.");
    }
    return session.user;
  }

  /**
   * Fetches the hospital profile for the authenticated hospital user.
   */
  public async getHospitalProfile(userId: string): Promise<HospitalProfile> {
    this.assertHospitalUser();
    await new Promise((resolve) => setTimeout(resolve, 80));

    if (!this.isClient()) {
      return { ...DEFAULT_DEMO_HOSPITAL_PROFILE, userId };
    }

    try {
      const stored = localStorage.getItem(HOSPITAL_PROFILES_STORAGE_KEY);
      const profiles: Record<string, HospitalProfile> = stored ? JSON.parse(stored) : {};

      if (profiles[userId]) {
        return profiles[userId];
      }

      // If demo hospital
      if (userId === "usr-hosp-002") {
        profiles[userId] = DEFAULT_DEMO_HOSPITAL_PROFILE;
        localStorage.setItem(HOSPITAL_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
        return DEFAULT_DEMO_HOSPITAL_PROFILE;
      }

      const session = authAdapter.getSession();
      const newProfile: HospitalProfile = {
        id: `hosp-${userId}`,
        userId,
        hospitalName: session?.user.organizationName || "Healthcare Provider Blood Bank",
        licenseNumber: "NY-MED-PENDING",
        department: "Blood Bank & Transfusion Center",
        contactPerson: session?.user.fullName || "Authorized Contact",
        workEmail: session?.user.email || "",
        phone: "+1 (555) 000-0000",
        emergencyPhone: "+1 (555) 911-0000",
        address: "Hospital Medical Center Wing",
        city: session?.user.city || "New York",
        isVerified: session?.user.verificationStatus === "verified",
        verificationStatus: (session?.user.verificationStatus as "verified" | "pending") || "pending",
        updatedAt: new Date().toISOString(),
      };

      profiles[userId] = newProfile;
      localStorage.setItem(HOSPITAL_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
      return newProfile;
    } catch {
      return { ...DEFAULT_DEMO_HOSPITAL_PROFILE, userId };
    }
  }

  /**
   * Updates hospital profile details.
   */
  public async updateHospitalProfile(
    userId: string,
    updates: Partial<HospitalProfile>
  ): Promise<HospitalProfile> {
    const user = this.assertHospitalUser();
    if (user.id !== userId && user.role !== "admin") {
      throw new Error("Unauthorized: You do not have permission to edit another hospital's profile.");
    }
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (updates.hospitalName !== undefined && updates.hospitalName.trim().length === 0) {
      throw new Error("Hospital organization name cannot be empty.");
    }
    if (updates.contactPerson !== undefined && updates.contactPerson.trim().length === 0) {
      throw new Error("Contact person name cannot be empty.");
    }

    const currentProfile = await this.getHospitalProfile(userId);
    const merged: HospitalProfile = {
      ...currentProfile,
      ...updates,
      hospitalName: updates.hospitalName?.trim() ?? currentProfile.hospitalName,
      department: updates.department?.trim() ?? currentProfile.department,
      contactPerson: updates.contactPerson?.trim() ?? currentProfile.contactPerson,
      phone: updates.phone?.trim() ?? currentProfile.phone,
      emergencyPhone: updates.emergencyPhone?.trim() ?? currentProfile.emergencyPhone,
      address: updates.address?.trim() ?? currentProfile.address,
      city: updates.city?.trim() ?? currentProfile.city,
      updatedAt: new Date().toISOString(),
    };

    if (this.isClient()) {
      try {
        const stored = localStorage.getItem(HOSPITAL_PROFILES_STORAGE_KEY);
        const profiles: Record<string, HospitalProfile> = stored ? JSON.parse(stored) : {};
        profiles[userId] = merged;
        localStorage.setItem(HOSPITAL_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
      } catch {
        // ignore
      }
    }

    return merged;
  }

  /**
   * Fetches the complete 8-group blood inventory for the hospital.
   */
  public async getBloodInventory(hospitalIdOrUserId: string): Promise<BloodInventoryItem[]> {
    this.assertHospitalUser();
    await new Promise((resolve) => setTimeout(resolve, 80));

    const defaultInv = createDefaultInventory("hosp-prof-002");

    if (!this.isClient()) {
      return defaultInv;
    }

    try {
      const stored = localStorage.getItem(HOSPITAL_INVENTORY_STORAGE_KEY);
      let invMap: Record<string, BloodInventoryItem[]> = stored ? JSON.parse(stored) : {};

      if (!invMap[hospitalIdOrUserId] || invMap[hospitalIdOrUserId].length === 0) {
        invMap[hospitalIdOrUserId] = defaultInv;
        localStorage.setItem(HOSPITAL_INVENTORY_STORAGE_KEY, JSON.stringify(invMap));
      }

      return invMap[hospitalIdOrUserId];
    } catch {
      return defaultInv;
    }
  }

  /**
   * Alias for getBloodInventory
   */
  public async getInventory(hospitalIdOrUserId: string): Promise<BloodInventoryItem[]> {
    return this.getBloodInventory(hospitalIdOrUserId);
  }


  /**
   * Updates inventory for a specific blood group, validating quantities and recording audit history.
   */
  public async updateBloodInventory(
    hospitalIdOrUserId: string,
    payload: {
      bloodGroup: BloodGroup;
      availableUnits: number;
      reservedUnits: number;
      quarantinedUnits: number;
      expiredUnits: number;
      lowStockThreshold?: number;
      reason: InventoryAdjustmentReason;
      notes?: string;
    }
  ): Promise<{ updatedItem: BloodInventoryItem; auditLog: InventoryAuditLog }> {
    const staff = this.assertHospitalUser();
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Strict validation
    if (!isValidBloodGroup(payload.bloodGroup)) {
      throw new Error(`Invalid blood group '${payload.bloodGroup}'.`);
    }

    const validateNonNegative = (val: number, name: string) => {
      if (typeof val !== "number" || isNaN(val) || !Number.isInteger(val) || val < 0) {
        throw new Error(`${name} must be a non-negative integer (0 or greater). Received: ${val}`);
      }
    };

    validateNonNegative(payload.availableUnits, "Available units");
    validateNonNegative(payload.reservedUnits, "Reserved units");
    validateNonNegative(payload.quarantinedUnits, "Quarantined units");
    validateNonNegative(payload.expiredUnits, "Expired units");

    if (payload.lowStockThreshold !== undefined) {
      validateNonNegative(payload.lowStockThreshold, "Low stock threshold");
    }

    const currentInventory = await this.getBloodInventory(hospitalIdOrUserId);
    const existingIndex = currentInventory.findIndex((i) => i.bloodGroup === payload.bloodGroup);

    const existingItem = existingIndex >= 0 ? currentInventory[existingIndex] : null;
    const threshold = payload.lowStockThreshold ?? (existingItem?.lowStockThreshold || 8);
    const stockStatus = calculateStockStatus(payload.availableUnits, threshold);

    const updatedItem: BloodInventoryItem = {
      hospitalId: hospitalIdOrUserId,
      bloodGroup: payload.bloodGroup,
      availableUnits: payload.availableUnits,
      reservedUnits: payload.reservedUnits,
      quarantinedUnits: payload.quarantinedUnits,
      expiredUnits: payload.expiredUnits,
      lowStockThreshold: threshold,
      stockStatus,
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedByStaffId: staff.id,
      lastUpdatedByStaffName: staff.fullName,
      unitsAvailable: payload.availableUnits,
    };

    if (existingIndex >= 0) {
      currentInventory[existingIndex] = updatedItem;
    } else {
      currentInventory.push(updatedItem);
    }

    // Create Audit Log entry
    const auditLog: InventoryAuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      hospitalId: hospitalIdOrUserId,
      bloodGroup: payload.bloodGroup,
      reason: payload.reason,
      previousAvailable: existingItem?.availableUnits ?? 0,
      newAvailable: payload.availableUnits,
      previousReserved: existingItem?.reservedUnits ?? 0,
      newReserved: payload.reservedUnits,
      previousQuarantined: existingItem?.quarantinedUnits ?? 0,
      newQuarantined: payload.quarantinedUnits,
      previousExpired: existingItem?.expiredUnits ?? 0,
      newExpired: payload.expiredUnits,
      staffId: staff.id,
      staffName: staff.fullName,
      notes: payload.notes?.trim(),
      timestamp: new Date().toISOString(),
    };

    if (this.isClient()) {
      try {
        // Save inventory
        const storedInv = localStorage.getItem(HOSPITAL_INVENTORY_STORAGE_KEY);
        const invMap: Record<string, BloodInventoryItem[]> = storedInv ? JSON.parse(storedInv) : {};
        invMap[hospitalIdOrUserId] = currentInventory;
        localStorage.setItem(HOSPITAL_INVENTORY_STORAGE_KEY, JSON.stringify(invMap));

        // Save audit logs
        const storedLogs = localStorage.getItem(HOSPITAL_AUDIT_STORAGE_KEY);
        const allLogs: InventoryAuditLog[] = storedLogs ? JSON.parse(storedLogs) : [...DEFAULT_AUDIT_LOGS];
        allLogs.unshift(auditLog);
        localStorage.setItem(HOSPITAL_AUDIT_STORAGE_KEY, JSON.stringify(allLogs));
      } catch {
        // ignore
      }
    }

    return { updatedItem, auditLog };
  }

  /**
   * Retrieves the historical inventory audit log entries.
   */
  public async getInventoryAuditLogs(hospitalIdOrUserId: string): Promise<InventoryAuditLog[]> {
    this.assertHospitalUser();
    await new Promise((resolve) => setTimeout(resolve, 80));

    if (!this.isClient()) {
      return DEFAULT_AUDIT_LOGS;
    }

    try {
      const stored = localStorage.getItem(HOSPITAL_AUDIT_STORAGE_KEY);
      let allLogs: InventoryAuditLog[] = stored ? JSON.parse(stored) : [];

      if (allLogs.length === 0) {
        allLogs = [...DEFAULT_AUDIT_LOGS];
        localStorage.setItem(HOSPITAL_AUDIT_STORAGE_KEY, JSON.stringify(allLogs));
      }

      return allLogs.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch {
      return DEFAULT_AUDIT_LOGS;
    }
  }
}

export const hospitalService = new HospitalService();
