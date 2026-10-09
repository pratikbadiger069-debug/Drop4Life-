/**
 * Drop4Life — Smart Donor Matching Service Layer
 * 
 * Implements deterministic matching and scoring algorithms integrating:
 * 1. Red Blood Cell Transfusion Compatibility (from lib/blood-compatibility.ts)
 * 2. Donor Availability Status (AVAILABLE vs TEMPORARILY_UNAVAILABLE / DO_NOT_CONTACT)
 * 3. Geographic Proximity & Service Area (matching city / borough / district)
 * 4. 56-Day Donation Rest Cycle & Readiness
 * 5. Contact Preferences & Verification Status
 * 
 * SAFETY & PRIVACY RULES:
 * - Red cell compatibility is a preliminary logistical suggestion, not medical clearance.
 * - Private donor street addresses and full birth dates are strictly redacted from match results.
 * - Incompatible blood groups and unavailable/opted-out donors are completely excluded.
 * - Closed (Cancelled / Fulfilled) requests do not process live matching.
 */

import {
  BloodGroup,
  BloodRequest,
  DonorMatchResult,
  DonorProfile,
  RequestDonorInvitation,
  DonorResponseStatus,
} from "@/lib/types";
import { canDonateRedCells } from "@/lib/blood-compatibility";
import { authAdapter } from "@/lib/auth/auth-adapter";
import { requestService } from "@/lib/requests/request-service";

export const MATCHING_CLINICAL_DISCLAIMER =
  "A compatibility match is only a preliminary logistics suggestion. It does not establish medical eligibility, actual blood availability, laboratory suitability, or transfusion safety. Qualified clinical staff must verify all requirements, perform confirmatory blood typing, antibody screening, and crossmatching prior to transfusion.";

/**
 * Seeded pool of verified and volunteer donors across different blood groups and regions
 */
export const SEEDED_DONOR_POOL: DonorProfile[] = [
  {
    id: "prof-donor-001",
    userId: "usr-donor-001",
    fullName: "Alex Morgan",
    email: "donor@drop4life.org",
    bloodGroup: "O-",
    phone: "+1 (555) 234-5678",
    phoneVerified: true,
    emailVerified: true,
    city: "New York",
    area: "Manhattan",
    address: "350 5th Avenue, Suite 1200",
    dateOfBirth: "1994-06-15",
    availabilityStatus: "AVAILABLE",
    preferredLocation: "Manhattan Central Hospital Blood Center",
    preferredContactMethod: "SMS",
    availabilityNotes: "Available for urgent calls after 5 PM or weekends.",
    lastDonatedAt: "2026-08-01", // ~70 days ago (fully eligible)
    profileCompletion: 100,
    isAvailable: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
  },
  {
    id: "prof-donor-002",
    userId: "usr-donor-002",
    fullName: "Elena Rostova",
    email: "elena.r@example.org",
    bloodGroup: "O-",
    phone: "+1 (555) 987-6543",
    phoneVerified: true,
    emailVerified: true,
    city: "New York",
    area: "Brooklyn",
    address: "742 Evergreen Terrace",
    dateOfBirth: "1991-03-22",
    availabilityStatus: "AVAILABLE",
    preferredContactMethod: "PHONE",
    availabilityNotes: "Emergency donor standby.",
    lastDonatedAt: "2026-05-14", // >140 days ago
    profileCompletion: 95,
    isAvailable: true,
    createdAt: "2026-02-10T00:00:00Z",
  },
  {
    id: "prof-donor-003",
    userId: "usr-donor-003",
    fullName: "Marcus Vance",
    email: "marcus.v@example.org",
    bloodGroup: "A+",
    phone: "+1 (555) 432-1098",
    phoneVerified: true,
    emailVerified: true,
    city: "New York",
    area: "Manhattan",
    address: "128 East 86th St",
    dateOfBirth: "1988-11-04",
    availabilityStatus: "AVAILABLE",
    preferredContactMethod: "EMAIL",
    lastDonatedAt: "2026-07-20", // ~80 days ago
    profileCompletion: 100,
    isAvailable: true,
    createdAt: "2026-03-15T00:00:00Z",
  },
  {
    id: "prof-donor-004",
    userId: "usr-donor-004",
    fullName: "Samantha Reed",
    email: "samantha.reed@example.org",
    bloodGroup: "A-",
    phone: "+1 (555) 321-7654",
    phoneVerified: true,
    emailVerified: false,
    city: "New York",
    area: "Queens",
    availabilityStatus: "AVAILABLE",
    preferredContactMethod: "SMS",
    lastDonatedAt: "2026-06-10",
    profileCompletion: 90,
    isAvailable: true,
    createdAt: "2026-04-01T00:00:00Z",
  },
  {
    id: "prof-donor-005",
    userId: "usr-donor-005",
    fullName: "David Chen",
    email: "david.c@example.org",
    bloodGroup: "B-",
    phone: "+1 (555) 654-3210",
    phoneVerified: true,
    emailVerified: true,
    city: "Brooklyn",
    area: "Downtown Brooklyn",
    availabilityStatus: "AVAILABLE",
    preferredContactMethod: "WHATSAPP",
    lastDonatedAt: "2026-08-05",
    profileCompletion: 100,
    isAvailable: true,
    createdAt: "2026-02-18T00:00:00Z",
  },
  {
    id: "prof-donor-006",
    userId: "usr-donor-006",
    fullName: "Priya Patel",
    email: "priya.p@example.org",
    bloodGroup: "B+",
    phone: "+1 (555) 876-5432",
    phoneVerified: false,
    emailVerified: true,
    city: "New York",
    area: "Manhattan",
    availabilityStatus: "AVAILABLE",
    preferredContactMethod: "EMAIL",
    lastDonatedAt: "2026-04-12",
    profileCompletion: 85,
    isAvailable: true,
    createdAt: "2026-05-11T00:00:00Z",
  },
  {
    id: "prof-donor-007",
    userId: "usr-donor-007",
    fullName: "Carlos Gomez",
    email: "carlos.g@example.org",
    bloodGroup: "O+",
    phone: "+1 (555) 789-0123",
    phoneVerified: true,
    emailVerified: true,
    city: "New York",
    area: "Bronx",
    availabilityStatus: "AVAILABLE",
    preferredContactMethod: "PHONE",
    lastDonatedAt: "2026-07-01",
    profileCompletion: 95,
    isAvailable: true,
    createdAt: "2026-01-20T00:00:00Z",
  },
  {
    id: "prof-donor-008",
    userId: "usr-donor-008",
    fullName: "Rachel Kim",
    email: "rachel.k@example.org",
    bloodGroup: "AB+",
    phone: "+1 (555) 210-9876",
    phoneVerified: true,
    emailVerified: true,
    city: "Boston",
    area: "Back Bay",
    availabilityStatus: "AVAILABLE",
    preferredContactMethod: "SMS",
    lastDonatedAt: "2026-06-25",
    profileCompletion: 90,
    isAvailable: true,
    createdAt: "2026-03-30T00:00:00Z",
  },
  {
    id: "prof-donor-009",
    userId: "usr-donor-009",
    fullName: "Unavailable Donor Demo",
    email: "busy.donor@example.org",
    bloodGroup: "O-",
    phone: "+1 (555) 000-1111",
    city: "New York",
    availabilityStatus: "TEMPORARILY_UNAVAILABLE",
    preferredContactMethod: "EMAIL",
    availabilityNotes: "Recovering from travel.",
    profileCompletion: 80,
    isAvailable: false,
    createdAt: "2026-04-10T00:00:00Z",
  },
  {
    id: "prof-donor-010",
    userId: "usr-donor-010",
    fullName: "Opt-Out Donor Demo",
    email: "optout.donor@example.org",
    bloodGroup: "O-",
    phone: "+1 (555) 000-2222",
    city: "New York",
    availabilityStatus: "DO_NOT_CONTACT",
    preferredContactMethod: "EMAIL",
    profileCompletion: 80,
    isAvailable: false,
    createdAt: "2026-04-10T00:00:00Z",
  },
];

const DONOR_POOL_STORAGE_KEY = "drop4life_active_donor_pool";
const INVITATIONS_STORAGE_KEY = "drop4life_donor_invitations";

export interface MatchScoreDetails {
  totalScore: number; // 0 - 100
  isExactMatch: boolean;
  compatibilityType: "EXACT" | "COMPATIBLE_RED_CELL";
  compatibilityPoints: number; // Max 35
  locationPoints: number; // Max 30
  restCyclePoints: number; // Max 25
  verificationPoints: number; // Max 10
  daysSinceLastDonation?: number;
  explanation: string;
}

class MatchingService {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  /**
   * Loads current pool of registered donors (seeded + dynamic)
   */
  public getDonorPool(): DonorProfile[] {
    if (!this.isClient()) {
      return [...SEEDED_DONOR_POOL];
    }

    try {
      const stored = localStorage.getItem(DONOR_POOL_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(DONOR_POOL_STORAGE_KEY, JSON.stringify(SEEDED_DONOR_POOL));
        return [...SEEDED_DONOR_POOL];
      }
      return JSON.parse(stored);
    } catch {
      return [...SEEDED_DONOR_POOL];
    }
  }

  /**
   * Calculates days elapsed since last recorded donation
   */
  public getDaysSinceLastDonation(lastDonatedAt?: string): number | undefined {
    if (!lastDonatedAt) return undefined;
    const then = new Date(lastDonatedAt).getTime();
    if (isNaN(then)) return undefined;
    const now = new Date().getTime();
    const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Pure scoring function ranking a single donor against a request
   */
  public evaluateDonorMatch(
    donor: DonorProfile,
    targetBloodGroup: BloodGroup,
    requestCity: string,
    requestArea?: string
  ): MatchScoreDetails | null {
    // 1. HARD FILTER: Availability Status
    if (donor.availabilityStatus !== "AVAILABLE") {
      return null;
    }

    // 2. HARD FILTER: Red Cell Compatibility
    const isCompatible = canDonateRedCells(donor.bloodGroup, targetBloodGroup);
    if (!isCompatible) {
      return null;
    }

    const isExactMatch = donor.bloodGroup === targetBloodGroup;
    const compatibilityType = isExactMatch ? "EXACT" : "COMPATIBLE_RED_CELL";

    // 3. Compatibility Points (Max 35)
    let compatibilityPoints = isExactMatch ? 35 : 25;

    // 4. Proximity & Location Points (Max 30)
    let locationPoints = 10;
    const donorCityNorm = donor.city.toLowerCase().trim();
    const reqCityNorm = requestCity.toLowerCase().trim();
    const sameCity = donorCityNorm === reqCityNorm || donorCityNorm.includes(reqCityNorm) || reqCityNorm.includes(donorCityNorm);

    if (sameCity) {
      locationPoints = 25;
      if (requestArea && donor.area) {
        const donorAreaNorm = donor.area.toLowerCase().trim();
        const reqAreaNorm = requestArea.toLowerCase().trim();
        if (donorAreaNorm.includes(reqAreaNorm) || reqAreaNorm.includes(donorAreaNorm)) {
          locationPoints = 30;
        }
      }
    }

    // 5. Rest Cycle & Readiness Points (Max 25)
    // Standard whole blood rest cycle is 56 days
    let restCyclePoints = 25;
    const daysSince = this.getDaysSinceLastDonation(donor.lastDonatedAt);
    if (daysSince !== undefined) {
      if (daysSince >= 56) {
        restCyclePoints = 25;
      } else if (daysSince >= 40) {
        restCyclePoints = 12;
      } else {
        restCyclePoints = 0; // Recent donation, not clinically ideal
      }
    }

    // 6. Verification Points (Max 10)
    let verificationPoints = 0;
    if (donor.phoneVerified) verificationPoints += 5;
    if (donor.emailVerified) verificationPoints += 5;

    const totalScore = Math.min(
      100,
      Math.max(0, compatibilityPoints + locationPoints + restCyclePoints + verificationPoints)
    );

    // Build human-friendly explanation
    const reasons: string[] = [];
    if (isExactMatch) {
      reasons.push(`Exact ABO/Rh match (${donor.bloodGroup})`);
    } else {
      reasons.push(`Compatible red cell group (${donor.bloodGroup} for ${targetBloodGroup})`);
    }

    if (sameCity) {
      reasons.push(`Located in ${donor.city}${donor.area ? ` (${donor.area})` : ""}`);
    } else {
      reasons.push(`Regional location (${donor.city})`);
    }

    if (daysSince !== undefined) {
      if (daysSince >= 56) {
        reasons.push(`Full 56-day rest cycle elapsed (${daysSince}d ago)`);
      } else {
        reasons.push(`Recent donation (${daysSince}d ago)`);
      }
    } else {
      reasons.push("First-time registered volunteer");
    }

    const explanation = reasons.join(" • ");

    return {
      totalScore,
      isExactMatch,
      compatibilityType,
      compatibilityPoints,
      locationPoints,
      restCyclePoints,
      verificationPoints,
      daysSinceLastDonation: daysSince,
      explanation,
    };
  }

  /**
   * Finds and ranks matching donors for an existing blood request.
   * Enforces role authorization and redacts private donor data.
   */
  public async findMatchesForRequest(requestId: string): Promise<DonorMatchResult[]> {
    const session = authAdapter.getSession();
    if (!session || !session.user) {
      throw new Error("Authentication required to access donor matching.");
    }

    if (session.user.role !== "hospital" && session.user.role !== "admin") {
      throw new Error("Access Denied: Only authorized hospital staff can view donor matching results.");
    }

    const request = await requestService.getBloodRequestById(requestId);
    if (!request) {
      throw new Error(`Blood request '${requestId}' not found.`);
    }

    // Closed requests return empty matches
    if (request.status === "CANCELLED" || request.status === "FULFILLED") {
      return [];
    }

    const donors = this.getDonorPool();
    const invitations = request.invitations || [];

    const matches: DonorMatchResult[] = [];

    for (const donor of donors) {
      const matchScore = this.evaluateDonorMatch(
        donor,
        request.bloodGroup,
        request.city,
        request.area
      );

      if (matchScore) {
        const existingInv = invitations.find((inv) => inv.donorId === donor.id || inv.donorUserId === donor.userId);

        // Strip private street address and DOB for privacy
        matches.push({
          donorId: donor.id,
          userId: donor.userId,
          donorName: donor.fullName,
          bloodGroup: donor.bloodGroup,
          city: donor.city,
          area: donor.area,
          preferredContactMethod: donor.preferredContactMethod,
          matchScore: matchScore.totalScore,
          isExactMatch: matchScore.isExactMatch,
          compatibilityType: matchScore.compatibilityType,
          matchExplanation: matchScore.explanation,
          daysSinceLastDonation: matchScore.daysSinceLastDonation,
          invitationStatus: existingInv ? existingInv.status : undefined,
          invitedAt: existingInv ? existingInv.invitedAt : undefined,
        });
      }
    }

    // Sort by match score descending (100% first)
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Dispatches a match invitation to a potential donor from authorized hospital staff
   */
  public async inviteDonor(
    requestId: string,
    donorId: string,
    notes?: string
  ): Promise<RequestDonorInvitation> {
    const session = authAdapter.getSession();
    if (!session || !session.user) {
      throw new Error("Authentication required.");
    }

    if (session.user.role !== "hospital" && session.user.role !== "admin") {
      throw new Error("Access Denied: Only authorized hospital staff can invite donors.");
    }

    const request = await requestService.getBloodRequestById(requestId);
    if (!request) {
      throw new Error("Blood request not found.");
    }

    if (request.status === "CANCELLED" || request.status === "FULFILLED") {
      throw new Error("Cannot issue invitations for a closed blood request.");
    }

    const donorPool = this.getDonorPool();
    const donor = donorPool.find((d) => d.id === donorId || d.userId === donorId);
    if (!donor) {
      throw new Error(`Donor profile '${donorId}' not found.`);
    }

    const now = new Date().toISOString();
    const newInvitation: RequestDonorInvitation = {
      id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestId,
      donorId: donor.id,
      donorUserId: donor.userId,
      donorName: donor.fullName,
      donorBloodGroup: donor.bloodGroup,
      donorCity: donor.city,
      donorArea: donor.area,
      preferredContactMethod: donor.preferredContactMethod,
      status: "INVITED",
      invitedAt: now,
      notes: notes?.trim() || `Automated match invitation via ${donor.preferredContactMethod}`,
    };

    // Update the request with this invitation and status transition if SUBMITTED
    const allRequests = (await requestService.getBloodRequests({ hospitalId: request.hospitalId })) || [];
    const target = allRequests.find((r) => r.id === requestId);
    if (target) {
      const existingInvs = target.invitations || [];
      const updatedInvs = existingInvs.filter((inv) => inv.donorId !== donor.id);
      updatedInvs.push(newInvitation);
      target.invitations = updatedInvs;

      const invitedIds = target.invitedDonorIds || [];
      if (!invitedIds.includes(donor.id)) {
        target.invitedDonorIds = [...invitedIds, donor.id];
      }

      if (target.status === "SUBMITTED") {
        target.status = "IN_PROGRESS";
        target.statusTimeline.push({
          status: "IN_PROGRESS",
          timestamp: now,
          updatedBy: session.user.fullName || "Hospital Coordinator",
          notes: `Matching invitation sent to donor ${donor.fullName} (${donor.bloodGroup}).`,
        });
      }

      // Save updated request list to storage
      if (this.isClient()) {
        try {
          const stored = localStorage.getItem("drop4life_blood_requests");
          if (stored) {
            const list: BloodRequest[] = JSON.parse(stored);
            const idx = list.findIndex((r) => r.id === requestId);
            if (idx !== -1) {
              list[idx] = target;
              localStorage.setItem("drop4life_blood_requests", JSON.stringify(list));
            }
          }
        } catch {
          // ignore
        }
      }
    }

    return newInvitation;
  }

  /**
   * Donor responds to a coordination invitation (ACCEPT or DECLINE)
   */
  public async donorRespondToInvitation(
    requestId: string,
    donorUserId: string,
    response: "ACCEPTED" | "DECLINED",
    notes?: string
  ): Promise<RequestDonorInvitation> {
    const session = authAdapter.getSession();
    if (!session || !session.user) {
      throw new Error("Authentication required.");
    }

    if (session.user.role !== "donor" || session.user.id !== donorUserId) {
      throw new Error("Access Denied: You can only respond to invitations for your own donor account.");
    }

    const request = await requestService.getBloodRequestById(requestId);
    if (!request) {
      throw new Error("Blood request not found.");
    }

    const invitations = request.invitations || [];
    const invIndex = invitations.findIndex((inv) => inv.donorUserId === donorUserId);

    if (invIndex === -1) {
      throw new Error("No active invitation found for this donor on this request.");
    }

    const now = new Date().toISOString();
    invitations[invIndex].status = response;
    invitations[invIndex].respondedAt = now;
    if (notes) invitations[invIndex].notes = notes;

    // Persist to storage
    if (this.isClient()) {
      try {
        const stored = localStorage.getItem("drop4life_blood_requests");
        if (stored) {
          const list: BloodRequest[] = JSON.parse(stored);
          const idx = list.findIndex((r) => r.id === requestId);
          if (idx !== -1) {
            list[idx].invitations = invitations;
            list[idx].statusTimeline.push({
              status: list[idx].status,
              timestamp: now,
              updatedBy: `${session.user.fullName || "Donor"} (Donor)`,
              notes: `Donor responded: ${response}. ${notes || ""}`.trim(),
            });
            localStorage.setItem("drop4life_blood_requests", JSON.stringify(list));
          }
        }
      } catch {
        // ignore
      }
    }

    return invitations[invIndex];
  }

  /**
   * Finds matching active blood requests for a given donor (viewable from /donor/requests)
   */
  public async getMatchingRequestsForDonor(donorUserId: string): Promise<{
    request: BloodRequest;
    matchScore: number;
    explanation: string;
    invitation?: RequestDonorInvitation;
  }[]> {
    const session = authAdapter.getSession();
    if (!session || !session.user || session.user.id !== donorUserId) {
      throw new Error("Unauthorized donor access.");
    }

    const donorPool = this.getDonorPool();
    const donor = donorPool.find((d) => d.userId === donorUserId) || {
      id: `prof-${donorUserId}`,
      userId: donorUserId,
      fullName: session.user.fullName,
      email: session.user.email,
      bloodGroup: session.user.bloodGroup || "O-",
      phone: "+1 (555) 234-5678",
      city: session.user.city || "New York",
      availabilityStatus: "AVAILABLE",
      preferredContactMethod: "SMS" as const,
      profileCompletion: 100,
    };

    const allRequests = await requestService.getBloodRequests();
    const activeRequests = allRequests.filter(
      (r) => r.status !== "CANCELLED" && r.status !== "FULFILLED"
    );

    const matches: Array<{
      request: BloodRequest;
      matchScore: number;
      explanation: string;
      invitation?: RequestDonorInvitation;
    }> = [];

    for (const req of activeRequests) {
      const evaluated = this.evaluateDonorMatch(donor as DonorProfile, req.bloodGroup, req.city, req.area);
      if (evaluated) {
        const inv = req.invitations?.find((i) => i.donorUserId === donorUserId);
        matches.push({
          request: req,
          matchScore: evaluated.totalScore,
          explanation: evaluated.explanation,
          invitation: inv,
        });
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }
}

export const matchingService = new MatchingService();
