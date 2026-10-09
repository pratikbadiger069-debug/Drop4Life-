/**
 * Drop4Life — Donor Profile & Availability Service Layer
 * 
 * Manages donor profile data, availability state transitions, profile completion calculations,
 * and donation history logs with role-based security and client/server validation.
 * 
 * SECURITY & ACCESS CONTROL:
 * - Enforces account ownership: donors can only view and update their own records.
 * - Restricts private address and contact details from unauthorized exposure.
 * - Protects medical integrity: profile completion is not medical clearance.
 */

import {
  DonorProfile,
  DonorAvailabilityStatus,
  PreferredContactMethod,
  DonationRecord,
  DonationType,
  DonationRecordStatus,
  BloodGroup,
  DonorBadgeLevel,
  DonorBadge,
  DonorAchievementSummary,
  AppointmentRecord,
} from "@/lib/types";
import { authAdapter } from "@/lib/auth/auth-adapter";
import { isValidBloodGroup } from "@/lib/blood-compatibility";
import { DONOR_REWARD_TIERS } from "@/lib/constants";

const DONOR_PROFILES_STORAGE_KEY = "drop4life_donor_profiles";
const DONATION_HISTORY_STORAGE_KEY = "drop4life_donation_history";
const APPOINTMENTS_STORAGE_KEY = "drop4life_donor_appointments";

/**
 * Calculates profile completion percentage based on completeness of essential fields.
 */
export function calculateProfileCompletion(profile: Partial<DonorProfile>): number {
  let score = 0;
  if (profile.fullName && profile.fullName.trim().length > 0) score += 15;
  if (profile.bloodGroup && isValidBloodGroup(profile.bloodGroup)) score += 20;
  if (profile.phone && profile.phone.trim().length >= 7) score += 15;
  if (profile.email && profile.email.includes("@")) score += 10;
  if (profile.city && profile.city.trim().length > 0) score += 15;
  if (profile.area && profile.area.trim().length > 0) score += 10;
  if (profile.preferredContactMethod) score += 10;
  if (profile.preferredLocation && profile.preferredLocation.trim().length > 0) score += 5;
  return Math.min(100, Math.max(0, score));
}

/**
 * Default seeded donor profile for the primary demo account (Indian Context)
 */
const DEFAULT_DEMO_DONOR_PROFILE: DonorProfile = {
  id: "prof-donor-001",
  userId: "usr-donor-001",
  fullName: "Rahul Kumar",
  email: "donor@drop4life.org",
  bloodGroup: "O-",
  phone: "+91 98765 00001",
  phoneVerified: true,
  emailVerified: true,
  city: "Hyderabad",
  area: "Banjara Hills & Jubilee Hills",
  address: "Plot 42, Road No. 12, Banjara Hills, Hyderabad, Telangana 500034",
  dateOfBirth: "1995-08-15",
  availabilityStatus: "AVAILABLE",
  preferredLocation: "Nizam's Institute of Medical Sciences (NIMS) Blood Bank, Hyderabad",
  preferredContactMethod: "SMS",
  availabilityNotes: "Available weekdays after 5:00 PM and weekends anytime for emergency calls.",
  lastDonatedAt: "2026-08-10",
  profileCompletion: 100,
  isAvailable: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-10-01T00:00:00Z",
};

/**
 * Initial verified and self-reported donation records for demonstration
 */
const DEFAULT_DONATION_RECORDS: DonationRecord[] = [
  {
    id: "don-rec-001",
    donorId: "prof-donor-001",
    userId: "usr-donor-001",
    donationDate: "2026-08-10",
    facilityName: "Nizam's Institute of Medical Sciences (NIMS) Blood Bank",
    facilityCity: "Hyderabad",
    bloodGroup: "O-",
    units: 1,
    donationType: "WHOLE_BLOOD",
    recordStatus: "VERIFIED",
    referenceNumber: "NIMS-2026-8831",
    notes: "Post-donation recovery normal. Routine 56-day rest cycle completed.",
    createdAt: "2026-08-10T14:30:00Z",
  },
  {
    id: "don-rec-002",
    donorId: "prof-donor-001",
    userId: "usr-donor-001",
    donationDate: "2026-05-02",
    facilityName: "Apollo Hospital Blood Center, Jubilee Hills",
    facilityCity: "Hyderabad",
    bloodGroup: "O-",
    units: 1,
    donationType: "WHOLE_BLOOD",
    recordStatus: "VERIFIED",
    referenceNumber: "APOLLO-2026-4412",
    notes: "Emergency surgical drive participation.",
    createdAt: "2026-05-02T11:15:00Z",
  },
  {
    id: "don-rec-003",
    donorId: "prof-donor-001",
    userId: "usr-donor-001",
    donationDate: "2026-01-14",
    facilityName: "Red Cross Society Blood Bank",
    facilityCity: "Hyderabad",
    bloodGroup: "O-",
    units: 1,
    donationType: "WHOLE_BLOOD",
    recordStatus: "VERIFIED",
    referenceNumber: "RC-HYD-2026-019",
    notes: "Verified donation from regional mobile camp.",
    createdAt: "2026-01-14T16:45:00Z",
  },
];

class DonorService {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  /**
   * Helper to verify session identity and protect cross-user access.
   */
  private assertAuthorizedUser(targetUserId: string) {
    const session = authAdapter.getSession();
    if (!session || !session.user) {
      throw new Error("Authentication required: Please log in to access this profile.");
    }
    if (session.user.role !== "donor") {
      throw new Error("Access Denied: Only donor accounts have access to donor profile management.");
    }
    if (session.user.id !== targetUserId) {
      throw new Error("Unauthorized: You do not have permission to access or modify another user's profile.");
    }
    return session.user;
  }

  /**
   * Fetches the donor profile for the given user ID with authorization checks.
   */
  public async getDonorProfile(userId: string): Promise<DonorProfile> {
    this.assertAuthorizedUser(userId);
    await new Promise((resolve) => setTimeout(resolve, 80));

    if (!this.isClient()) {
      return { ...DEFAULT_DEMO_DONOR_PROFILE, userId };
    }

    try {
      const stored = localStorage.getItem(DONOR_PROFILES_STORAGE_KEY);
      const profiles: Record<string, DonorProfile> = stored ? JSON.parse(stored) : {};

      if (profiles[userId]) {
        return profiles[userId];
      }

      // If this is the demo donor, initialize default profile
      if (userId === "usr-donor-001") {
        profiles[userId] = DEFAULT_DEMO_DONOR_PROFILE;
        localStorage.setItem(DONOR_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
        return DEFAULT_DEMO_DONOR_PROFILE;
      }

      // If new registered user, construct initial profile from session
      const session = authAdapter.getSession();
      const initialProfile: DonorProfile = {
        id: `prof-${userId}`,
        userId,
        fullName: session?.user.fullName || "Volunteer Donor",
        email: session?.user.email || "",
        bloodGroup: session?.user.bloodGroup || "O+",
        phone: "+91 98765 00001",
        phoneVerified: false,
        emailVerified: true,
        city: session?.user.city || "Hyderabad",
        area: "",
        availabilityStatus: "AVAILABLE",
        preferredContactMethod: "EMAIL",
        profileCompletion: calculateProfileCompletion({
          fullName: session?.user.fullName,
          bloodGroup: session?.user.bloodGroup,
          email: session?.user.email,
          city: session?.user.city,
          preferredContactMethod: "EMAIL",
        }),
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      profiles[userId] = initialProfile;
      localStorage.setItem(DONOR_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
      return initialProfile;
    } catch {
      return { ...DEFAULT_DEMO_DONOR_PROFILE, userId };
    }
  }

  /**
   * Updates an existing donor profile after strict validation.
   */
  public async updateDonorProfile(
    userId: string,
    updates: Partial<Omit<DonorProfile, "id" | "userId" | "createdAt">>
  ): Promise<DonorProfile> {
    this.assertAuthorizedUser(userId);
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Input validations
    if (updates.fullName !== undefined && updates.fullName.trim().length === 0) {
      throw new Error("Full name cannot be empty.");
    }

    if (updates.bloodGroup !== undefined && !isValidBloodGroup(updates.bloodGroup)) {
      throw new Error(`Invalid blood group '${updates.bloodGroup}'. Must be one of: O-, O+, A-, A+, B-, B+, AB-, AB+`);
    }

    if (updates.phone !== undefined && updates.phone.trim().length > 0 && updates.phone.trim().length < 7) {
      throw new Error("Please enter a valid phone number.");
    }

    const currentProfile = await this.getDonorProfile(userId);
    const merged: DonorProfile = {
      ...currentProfile,
      ...updates,
      fullName: updates.fullName?.trim() ?? currentProfile.fullName,
      city: updates.city?.trim() ?? currentProfile.city,
      area: updates.area?.trim() ?? currentProfile.area,
      address: updates.address?.trim() ?? currentProfile.address,
      preferredLocation: updates.preferredLocation?.trim() ?? currentProfile.preferredLocation,
      availabilityNotes: updates.availabilityNotes?.trim() ?? currentProfile.availabilityNotes,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate profile completion & isAvailable flag
    merged.profileCompletion = calculateProfileCompletion(merged);
    merged.isAvailable = merged.availabilityStatus === "AVAILABLE";

    if (this.isClient()) {
      try {
        const stored = localStorage.getItem(DONOR_PROFILES_STORAGE_KEY);
        const profiles: Record<string, DonorProfile> = stored ? JSON.parse(stored) : {};
        profiles[userId] = merged;
        localStorage.setItem(DONOR_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
      } catch {
        // ignore
      }
    }

    return merged;
  }

  /**
   * Quick update for blood availability state and coordination preferences.
   */
  public async updateDonorAvailability(
    userId: string,
    availability: {
      status: DonorAvailabilityStatus;
      preferredLocation?: string;
      preferredContactMethod?: PreferredContactMethod;
      notes?: string;
    }
  ): Promise<DonorProfile> {
    this.assertAuthorizedUser(userId);

    const validStatuses: DonorAvailabilityStatus[] = [
      "AVAILABLE",
      "TEMPORARILY_UNAVAILABLE",
      "DO_NOT_CONTACT",
    ];

    if (!validStatuses.includes(availability.status)) {
      throw new Error(`Invalid availability status '${availability.status}'`);
    }

    return this.updateDonorProfile(userId, {
      availabilityStatus: availability.status,
      preferredLocation: availability.preferredLocation,
      preferredContactMethod: availability.preferredContactMethod,
      availabilityNotes: availability.notes,
    });
  }

  /**
   * Retrieves donation history for the current authenticated donor only.
   */
  public async getDonationHistory(userId: string): Promise<DonationRecord[]> {
    this.assertAuthorizedUser(userId);
    await new Promise((resolve) => setTimeout(resolve, 80));

    if (!this.isClient()) {
      return DEFAULT_DONATION_RECORDS.filter((r) => r.userId === userId);
    }

    try {
      const stored = localStorage.getItem(DONATION_HISTORY_STORAGE_KEY);
      let allRecords: DonationRecord[] = stored ? JSON.parse(stored) : [];

      if (allRecords.length === 0 && userId === "usr-donor-001") {
        allRecords = [...DEFAULT_DONATION_RECORDS];
        localStorage.setItem(DONATION_HISTORY_STORAGE_KEY, JSON.stringify(allRecords));
      }

      return allRecords
        .filter((r) => r.userId === userId)
        .sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime());
    } catch {
      return DEFAULT_DONATION_RECORDS.filter((r) => r.userId === userId);
    }
  }

  /**
   * Adds a new donation record (self-reported by donor or logged from an event).
   */
  public async addDonationRecord(
    userId: string,
    entry: {
      donationDate: string;
      facilityName: string;
      facilityCity: string;
      bloodGroup: BloodGroup;
      units: number;
      donationType: DonationType;
      referenceNumber?: string;
      notes?: string;
    }
  ): Promise<DonationRecord> {
    this.assertAuthorizedUser(userId);
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (!entry.donationDate) {
      throw new Error("Donation date is required.");
    }
    if (!entry.facilityName || entry.facilityName.trim().length === 0) {
      throw new Error("Donation facility or hospital name is required.");
    }
    if (!isValidBloodGroup(entry.bloodGroup)) {
      throw new Error("Invalid blood group selected.");
    }
    if (!entry.units || entry.units < 1) {
      throw new Error("Units must be at least 1.");
    }

    const currentProfile = await this.getDonorProfile(userId);

    const newRecord: DonationRecord = {
      id: `don-rec-${Date.now()}`,
      donorId: currentProfile.id,
      userId,
      donationDate: entry.donationDate,
      facilityName: entry.facilityName.trim(),
      facilityCity: entry.facilityCity.trim() || currentProfile.city,
      bloodGroup: entry.bloodGroup,
      units: entry.units,
      donationType: entry.donationType || "WHOLE_BLOOD",
      recordStatus: "SELF_REPORTED",
      referenceNumber: entry.referenceNumber?.trim() || `SELF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      notes: entry.notes?.trim(),
      createdAt: new Date().toISOString(),
    };

    if (this.isClient()) {
      try {
        const stored = localStorage.getItem(DONATION_HISTORY_STORAGE_KEY);
        const allRecords: DonationRecord[] = stored ? JSON.parse(stored) : [...DEFAULT_DONATION_RECORDS];
        allRecords.unshift(newRecord);
        localStorage.setItem(DONATION_HISTORY_STORAGE_KEY, JSON.stringify(allRecords));
      } catch {
        // ignore
      }
    }

    // Update donor's lastDonatedAt date if this is newer
    if (
      !currentProfile.lastDonatedAt ||
      new Date(entry.donationDate) > new Date(currentProfile.lastDonatedAt)
    ) {
      await this.updateDonorProfile(userId, {
        lastDonatedAt: entry.donationDate,
      });
    }

    return newRecord;
  }

  /**
   * Retrieves donor reward achievements based strictly on verified donation records.
   * Prevents unverified or self-reported records from claiming badges.
   */
  public async getDonorAchievements(userId: string): Promise<DonorAchievementSummary> {
    const history = await this.getDonationHistory(userId);
    // Filter strictly verified records
    const verifiedHistory = history.filter((h) => h.recordStatus === "VERIFIED");
    const count = verifiedHistory.length;

    const bronzeUnlocked = count >= DONOR_REWARD_TIERS.BRONZE.threshold;
    const silverUnlocked = count >= DONOR_REWARD_TIERS.SILVER.threshold;
    const goldUnlocked = count >= DONOR_REWARD_TIERS.GOLD.threshold;
    const platinumUnlocked = count >= DONOR_REWARD_TIERS.PLATINUM.threshold;

    let currentLevel: DonorBadgeLevel = "NONE";
    let badgeTitle = "Novice Donor";
    let nextThreshold = DONOR_REWARD_TIERS.BRONZE.threshold;

    if (platinumUnlocked) {
      currentLevel = "PLATINUM";
      badgeTitle = DONOR_REWARD_TIERS.PLATINUM.name;
      nextThreshold = 20;
    } else if (goldUnlocked) {
      currentLevel = "GOLD";
      badgeTitle = DONOR_REWARD_TIERS.GOLD.name;
      nextThreshold = DONOR_REWARD_TIERS.PLATINUM.threshold;
    } else if (silverUnlocked) {
      currentLevel = "SILVER";
      badgeTitle = DONOR_REWARD_TIERS.SILVER.name;
      nextThreshold = DONOR_REWARD_TIERS.GOLD.threshold;
    } else if (bronzeUnlocked) {
      currentLevel = "BRONZE";
      badgeTitle = DONOR_REWARD_TIERS.BRONZE.name;
      nextThreshold = DONOR_REWARD_TIERS.SILVER.threshold;
    }

    const progressPercent = Math.min(100, Math.round((count / nextThreshold) * 100));

    const badges: DonorBadge[] = [
      {
        id: "badge-bronze",
        level: "BRONZE",
        name: DONOR_REWARD_TIERS.BRONZE.name,
        description: DONOR_REWARD_TIERS.BRONZE.description,
        icon: "🥉",
        thresholdDonations: DONOR_REWARD_TIERS.BRONZE.threshold,
        isUnlocked: bronzeUnlocked,
      },
      {
        id: "badge-silver",
        level: "SILVER",
        name: DONOR_REWARD_TIERS.SILVER.name,
        description: DONOR_REWARD_TIERS.SILVER.description,
        icon: "🥈",
        thresholdDonations: DONOR_REWARD_TIERS.SILVER.threshold,
        isUnlocked: silverUnlocked,
      },
      {
        id: "badge-gold",
        level: "GOLD",
        name: DONOR_REWARD_TIERS.GOLD.name,
        description: DONOR_REWARD_TIERS.GOLD.description,
        icon: "🥇",
        thresholdDonations: DONOR_REWARD_TIERS.GOLD.threshold,
        isUnlocked: goldUnlocked,
      },
      {
        id: "badge-platinum",
        level: "PLATINUM",
        name: DONOR_REWARD_TIERS.PLATINUM.name,
        description: DONOR_REWARD_TIERS.PLATINUM.description,
        icon: "💎",
        thresholdDonations: DONOR_REWARD_TIERS.PLATINUM.threshold,
        isUnlocked: platinumUnlocked,
      },
    ];

    return {
      currentLevel,
      badgeTitle,
      verifiedDonationsCount: count,
      nextLevelThreshold: nextThreshold,
      progressPercent,
      badges,
    };
  }

  /**
   * Retrieves appointments booked by the donor
   */
  public async getAppointments(userId: string): Promise<AppointmentRecord[]> {
    this.assertAuthorizedUser(userId);
    await new Promise((res) => setTimeout(res, 60));
    if (!this.isClient()) return [];
    try {
      const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      const all: AppointmentRecord[] = stored ? JSON.parse(stored) : [];
      return all.filter((a) => a.donorId === userId);
    } catch {
      return [];
    }
  }

  /**
   * Schedules a blood donation appointment
   */
  public async bookAppointment(
    userId: string,
    input: {
      facilityId: string;
      facilityName: string;
      facilityType: "HOSPITAL" | "BLOOD_BANK" | "CAMPAIGN";
      city: string;
      date: string;
      timeSlot: string;
      notes?: string;
    }
  ): Promise<AppointmentRecord> {
    this.assertAuthorizedUser(userId);
    await new Promise((res) => setTimeout(res, 100));

    const profile = await this.getDonorProfile(userId);
    const newAppointment: AppointmentRecord = {
      id: `apt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      donorId: userId,
      donorName: profile.fullName,
      donorBloodGroup: profile.bloodGroup,
      facilityId: input.facilityId,
      facilityName: input.facilityName,
      facilityType: input.facilityType,
      city: input.city,
      date: input.date,
      timeSlot: input.timeSlot,
      status: "SCHEDULED",
      notes: input.notes?.trim(),
      createdAt: new Date().toISOString(),
    };

    if (this.isClient()) {
      try {
        const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
        const all: AppointmentRecord[] = stored ? JSON.parse(stored) : [];
        all.unshift(newAppointment);
        localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(all));
      } catch (e) {
        console.warn("Failed to persist appointment", e);
      }
    }

    return newAppointment;
  }

  /**
   * Cancels an existing appointment
   */
  public async cancelAppointment(userId: string, appointmentId: string): Promise<AppointmentRecord> {
    this.assertAuthorizedUser(userId);
    await new Promise((res) => setTimeout(res, 100));

    if (!this.isClient()) throw new Error("Client storage unavailable");
    const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    const all: AppointmentRecord[] = stored ? JSON.parse(stored) : [];
    const index = all.findIndex((a) => a.id === appointmentId && a.donorId === userId);
    if (index === -1) throw new Error("Appointment not found.");

    all[index].status = "CANCELLED";
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(all));
    return all[index];
  }
}

export const donorService = new DonorService();
