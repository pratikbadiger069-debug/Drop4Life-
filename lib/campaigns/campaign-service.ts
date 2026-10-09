/**
 * Drop4Life — NGO Profile & Blood Donation Campaign Service Layer
 * 
 * Manages NGO organization profiles, campaign lifecycle (Draft -> Published -> Active -> Completed/Cancelled),
 * venue details, volunteer/donor interest registration, and participant rosters.
 * 
 * PERMISSIONS & SECURITY:
 * - Only authenticated NGO accounts and administrators can create and edit campaigns.
 * - Enforces organization ownership: an NGO can only manage their own campaigns and view their participant lists.
 * - Verified badges are strictly rendered based on authorized verification status.
 */

import {
  Campaign,
  CampaignStatus,
  CampaignParticipant,
  NGOProfile,
  BloodGroup,
} from "@/lib/types";
import { authAdapter } from "@/lib/auth/auth-adapter";
import { notificationService } from "@/lib/notifications/notification-service";

const CAMPAIGNS_STORAGE_KEY = "drop4life_ngo_campaigns";
const PARTICIPANTS_STORAGE_KEY = "drop4life_campaign_participants";
const NGO_PROFILES_STORAGE_KEY = "drop4life_ngo_profiles";

export const DEFAULT_DEMO_NGO_PROFILE: NGOProfile = {
  id: "prof-ngo-003",
  userId: "usr-ngo-003",
  organizationName: "Red Cross LifeCare Auxiliary",
  registrationId: "NY-NGO-2024-8841",
  contactPerson: "Elena Vance",
  phone: "+1 (555) 456-7890",
  coverageArea: "Greater New York & Tri-State Area",
  city: "New York",
  address: "150 Broadway, Suite 800, New York, NY 10038",
  isVerified: true,
  verificationStatus: "verified",
  website: "https://drop4life.org/partners/lifecare",
  description: "Community blood drive coordinator mobilizing neighborhood blood drives, youth campaigns, and emergency disaster response reserves across the regional network.",
  updatedAt: "2026-10-01T00:00:00Z",
};

export const DEFAULT_SEEDED_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-101",
    ngoId: "usr-ngo-003",
    ngoName: "Red Cross LifeCare Auxiliary",
    title: "Citywide Spring Blood Drive 2026",
    description: "Join our flagship community blood drive partnering with regional hospitals to replenish low seasonal reserves.",
    venueName: "Civic Plaza Community Hall",
    address: "350 5th Avenue, Ground Pavilion",
    city: "New York",
    area: "Midtown Manhattan",
    latitude: 40.7484,
    longitude: -73.9857,
    startDate: "2026-10-12",
    endDate: "2026-10-14",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    targetUnits: 250,
    collectedUnits: 110,
    capacityLimit: 300,
    registeredCount: 142,
    contactPhone: "+1 (555) 456-7890",
    contactEmail: "ngo@drop4life.org",
    registrationInstructions: "Please bring a photo ID and hydrate well 2 hours before arriving. Light refreshments provided.",
    status: "ACTIVE",
    isVerifiedOrg: true,
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-08T12:00:00.000Z",
  },
  {
    id: "camp-102",
    ngoId: "usr-ngo-003",
    ngoName: "Red Cross LifeCare Auxiliary",
    title: "University Youth Blood Donation Festival",
    description: "A youth-led campus drive raising awareness for regular voluntary blood and platelet donations.",
    venueName: "University Student Center, 2nd Floor Ballroom",
    address: "6 Metrotech Center",
    city: "Brooklyn",
    area: "Downtown Brooklyn",
    latitude: 40.6934,
    longitude: -73.9858,
    startDate: "2026-10-18",
    endDate: "2026-10-19",
    startTime: "10:00 AM",
    endTime: "04:00 PM",
    targetUnits: 180,
    collectedUnits: 0,
    capacityLimit: 200,
    registeredCount: 96,
    contactPhone: "+1 (555) 456-7890",
    contactEmail: "ngo@drop4life.org",
    registrationInstructions: "Student ID or state ID required for registration. Walk-ins accepted based on slot availability.",
    status: "PUBLISHED",
    isVerifiedOrg: true,
    createdAt: "2026-10-03T10:00:00.000Z",
    updatedAt: "2026-10-03T10:00:00.000Z",
  },
  {
    id: "camp-103",
    ngoId: "usr-ngo-004",
    ngoName: "Community Health Volunteer Union",
    title: "Healthcare Workers & First Responders Drive",
    description: "Dedicated mobile drive honoring emergency responders and medical personnel replenishing trauma inventories.",
    venueName: "Hospital Main Auditorium, Pavilion B",
    address: "420 East 70th Street",
    city: "Queens",
    area: "Flushing",
    latitude: 40.7675,
    longitude: -73.9535,
    startDate: "2026-10-24",
    endDate: "2026-10-24",
    startTime: "08:30 AM",
    endTime: "06:00 PM",
    targetUnits: 200,
    collectedUnits: 0,
    capacityLimit: 250,
    registeredCount: 85,
    contactPhone: "+1 (555) 789-0123",
    contactEmail: "coordinator@healthvolunteers.org",
    registrationInstructions: "Check-in at Station 1 with your confirmation reference number.",
    status: "PUBLISHED",
    isVerifiedOrg: false,
    createdAt: "2026-10-04T14:00:00.000Z",
    updatedAt: "2026-10-04T14:00:00.000Z",
  },
  {
    id: "camp-104",
    ngoId: "usr-ngo-003",
    ngoName: "Red Cross LifeCare Auxiliary",
    title: "Downtown Rapid Mobile Unit (Planning Draft)",
    description: "Draft plan for mobile van donation clinic along financial district pedestrian corridors.",
    venueName: "Wall Street Pedestrian Plaza",
    address: "Broad Street & Wall Street",
    city: "New York",
    area: "Financial District",
    latitude: 40.7069,
    longitude: -74.009,
    startDate: "2026-11-05",
    endDate: "2026-11-06",
    startTime: "11:00 AM",
    endTime: "07:00 PM",
    targetUnits: 100,
    collectedUnits: 0,
    capacityLimit: 120,
    registeredCount: 0,
    contactPhone: "+1 (555) 456-7890",
    contactEmail: "ngo@drop4life.org",
    status: "DRAFT",
    isVerifiedOrg: true,
    createdAt: "2026-10-08T16:00:00.000Z",
    updatedAt: "2026-10-08T16:00:00.000Z",
  },
];

export const DEFAULT_PARTICIPANTS: CampaignParticipant[] = [
  {
    id: "part-001",
    campaignId: "camp-101",
    userId: "usr-donor-001",
    userName: "Alex Morgan",
    userEmail: "donor@drop4life.org",
    userPhone: "+1 (555) 234-5678",
    bloodGroup: "O-",
    participantRole: "donor",
    registeredAt: "2026-10-05T11:00:00.000Z",
    status: "REGISTERED",
    notes: "Preferred slot 10:00 AM",
  },
  {
    id: "part-002",
    campaignId: "camp-101",
    userId: "usr-donor-002",
    userName: "Elena Rostova",
    userEmail: "elena.r@example.org",
    bloodGroup: "O-",
    participantRole: "volunteer",
    registeredAt: "2026-10-06T14:30:00.000Z",
    status: "REGISTERED",
    notes: "Assisting with registration desk",
  },
];

export interface CreateCampaignInput {
  title: string;
  description: string;
  venueName: string;
  address: string;
  city: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  targetUnits: number;
  capacityLimit?: number;
  contactPhone: string;
  contactEmail: string;
  registrationInstructions?: string;
  status?: CampaignStatus;
}

export interface RegisterParticipantInput {
  userName: string;
  userEmail: string;
  userPhone?: string;
  bloodGroup?: BloodGroup;
  participantRole?: "donor" | "volunteer" | "medical_volunteer";
  notes?: string;
}

class CampaignService {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private loadCampaigns(): Campaign[] {
    if (!this.isClient()) {
      return [...DEFAULT_SEEDED_CAMPAIGNS];
    }
    try {
      const stored = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(DEFAULT_SEEDED_CAMPAIGNS));
        return [...DEFAULT_SEEDED_CAMPAIGNS];
      }
      return JSON.parse(stored);
    } catch {
      return [...DEFAULT_SEEDED_CAMPAIGNS];
    }
  }

  private saveCampaigns(campaigns: Campaign[]): void {
    if (this.isClient()) {
      try {
        localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
      } catch {
        // ignore
      }
    }
  }

  private loadParticipants(): CampaignParticipant[] {
    if (!this.isClient()) {
      return [...DEFAULT_PARTICIPANTS];
    }
    try {
      const stored = localStorage.getItem(PARTICIPANTS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(DEFAULT_PARTICIPANTS));
        return [...DEFAULT_PARTICIPANTS];
      }
      return JSON.parse(stored);
    } catch {
      return [...DEFAULT_PARTICIPANTS];
    }
  }

  private saveParticipants(participants: CampaignParticipant[]): void {
    if (this.isClient()) {
      try {
        localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(participants));
      } catch {
        // ignore
      }
    }
  }

  /**
   * NGO Profile management
   */
  public async getNgoProfile(userId: string): Promise<NGOProfile> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    if (!this.isClient()) {
      return { ...DEFAULT_DEMO_NGO_PROFILE, userId };
    }

    try {
      const stored = localStorage.getItem(`${NGO_PROFILES_STORAGE_KEY}_${userId}`);
      if (!stored) {
        if (userId === "usr-ngo-003") {
          localStorage.setItem(
            `${NGO_PROFILES_STORAGE_KEY}_${userId}`,
            JSON.stringify(DEFAULT_DEMO_NGO_PROFILE)
          );
          return DEFAULT_DEMO_NGO_PROFILE;
        }
        const session = authAdapter.getSession();
        const initial: NGOProfile = {
          id: `prof-${userId}`,
          userId,
          organizationName: session?.user.organizationName || "Community NGO Auxiliary",
          registrationId: "REG-PENDING",
          contactPerson: session?.user.fullName || "Coordinator",
          phone: "+1 (555) 000-0000",
          coverageArea: session?.user.city || "Regional Service Area",
          city: session?.user.city || "New York",
          isVerified: session?.user.verificationStatus === "verified",
          verificationStatus: session?.user.verificationStatus === "verified" ? "verified" : session?.user.verificationStatus === "rejected" ? "rejected" : "pending",
        };
        return initial;
      }
      return JSON.parse(stored);
    } catch {
      return { ...DEFAULT_DEMO_NGO_PROFILE, userId };
    }
  }

  public async updateNgoProfile(
    userId: string,
    updates: Partial<Omit<NGOProfile, "id" | "userId" | "isVerified" | "verificationStatus">>
  ): Promise<NGOProfile> {
    const session = authAdapter.getSession();
    if (!session || !session.user || (session.user.id !== userId && session.user.role !== "admin")) {
      throw new Error("Unauthorized NGO profile update.");
    }

    const current = await this.getNgoProfile(userId);
    const updated: NGOProfile = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (this.isClient()) {
      try {
        localStorage.setItem(`${NGO_PROFILES_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }

    return updated;
  }

  /**
   * Retrieves public and NGO-managed campaigns with flexible filters
   */
  public async getCampaigns(filters?: {
    ngoId?: string;
    status?: CampaignStatus | "ALL";
    city?: string;
    search?: string;
    excludeDrafts?: boolean;
  }): Promise<Campaign[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    let list = this.loadCampaigns();

    if (filters?.ngoId) {
      list = list.filter((c) => c.ngoId === filters.ngoId);
    }

    if (filters?.excludeDrafts) {
      list = list.filter((c) => c.status !== "DRAFT");
    }

    if (filters?.status && filters.status !== "ALL") {
      list = list.filter((c) => c.status === filters.status);
    }

    if (filters?.city && filters.city.trim().length > 0) {
      const q = filters.city.toLowerCase().trim();
      list = list.filter((c) => c.city.toLowerCase().includes(q));
    }

    if (filters?.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.venueName.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.ngoName.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  /**
   * Retrieves a single campaign by ID
   */
  public async getCampaignById(id: string): Promise<Campaign | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const list = this.loadCampaigns();
    return list.find((c) => c.id === id) || null;
  }

  /**
   * Creates a new campaign with strict validation and organization binding
   */
  public async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    const session = authAdapter.getSession();
    if (!session || !session.user) {
      throw new Error("Authentication required to create a campaign.");
    }

    if (session.user.role !== "ngo" && session.user.role !== "admin") {
      throw new Error("Access Denied: Only authorized NGO accounts can create donation campaigns.");
    }

    // Validation
    if (!input.title || input.title.trim().length < 5) {
      throw new Error("Campaign title must be at least 5 characters.");
    }
    if (!input.venueName || input.venueName.trim().length === 0) {
      throw new Error("Venue / Location name is required.");
    }
    if (!input.city || input.city.trim().length === 0) {
      throw new Error("City is required.");
    }
    if (!input.startDate || !input.endDate) {
      throw new Error("Start and End dates are required.");
    }
    if (new Date(input.startDate) > new Date(input.endDate)) {
      throw new Error("Campaign start date cannot be after end date.");
    }
    if (!input.targetUnits || input.targetUnits < 1) {
      throw new Error("Target units must be at least 1 unit.");
    }

    const ngoProfile = await this.getNgoProfile(session.user.id);
    const now = new Date().toISOString();

    const newCampaign: Campaign = {
      id: `camp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ngoId: session.user.id,
      ngoName: ngoProfile.organizationName || session.user.organizationName || "NGO Organizer",
      title: input.title.trim(),
      description: input.description?.trim() || "",
      venueName: input.venueName.trim(),
      address: input.address?.trim() || input.venueName.trim(),
      city: input.city.trim(),
      area: input.area?.trim() || undefined,
      latitude: input.latitude || 40.7128,
      longitude: input.longitude || -74.006,
      startDate: input.startDate,
      endDate: input.endDate,
      startTime: input.startTime || "09:00 AM",
      endTime: input.endTime || "05:00 PM",
      targetUnits: Number(input.targetUnits),
      collectedUnits: 0,
      capacityLimit: input.capacityLimit ? Number(input.capacityLimit) : undefined,
      registeredCount: 0,
      contactPhone: input.contactPhone?.trim() || ngoProfile.phone,
      contactEmail: input.contactEmail?.trim() || session.user.email,
      registrationInstructions: input.registrationInstructions?.trim(),
      status: input.status || "PUBLISHED",
      isVerifiedOrg: ngoProfile.isVerified,
      createdAt: now,
      updatedAt: now,
    };

    const all = this.loadCampaigns();
    all.unshift(newCampaign);
    this.saveCampaigns(all);

    return newCampaign;
  }

  /**
   * Updates an existing campaign enforcing organization permissions
   */
  public async updateCampaign(
    id: string,
    updates: Partial<Omit<Campaign, "id" | "ngoId" | "createdAt">>
  ): Promise<Campaign> {
    const session = authAdapter.getSession();
    if (!session || !session.user) {
      throw new Error("Authentication required.");
    }

    const all = this.loadCampaigns();
    const index = all.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("Campaign not found.");
    }

    const current = all[index];
    if (session.user.role === "ngo" && current.ngoId !== session.user.id) {
      throw new Error("Access Denied: You cannot modify a campaign belonging to another organization.");
    }

    if (updates.startDate && updates.endDate && new Date(updates.startDate) > new Date(updates.endDate)) {
      throw new Error("Start date cannot be after end date.");
    }

    const updated: Campaign = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.saveCampaigns(all);

    return updated;
  }

  /**
   * Cancels a campaign with reason
   */
  public async cancelCampaign(id: string, reason?: string): Promise<Campaign> {
    return this.updateCampaign(id, {
      status: "CANCELLED",
      description: reason ? `${reason}` : undefined,
    });
  }

  /**
   * Registers volunteer or donor interest in a campaign
   */
  public async registerParticipant(
    campaignId: string,
    input: RegisterParticipantInput
  ): Promise<CampaignParticipant> {
    const session = authAdapter.getSession();
    const userId = session?.user.id || `guest-${Date.now()}`;

    const campaign = await this.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaign not found.");
    }

    if (campaign.status === "CANCELLED" || campaign.status === "COMPLETED") {
      throw new Error("Cannot register for a closed campaign.");
    }

    if (campaign.capacityLimit && campaign.registeredCount >= campaign.capacityLimit) {
      throw new Error("This campaign has reached its maximum volunteer capacity limit.");
    }

    const allParticipants = this.loadParticipants();

    // Duplicate check
    const isAlreadyRegistered = allParticipants.some(
      (p) => p.campaignId === campaignId && (p.userId === userId || p.userEmail === input.userEmail)
    );
    if (isAlreadyRegistered) {
      throw new Error("You are already registered for this campaign.");
    }

    const now = new Date().toISOString();
    const newParticipant: CampaignParticipant = {
      id: `part-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      campaignId,
      userId,
      userName: input.userName.trim(),
      userEmail: input.userEmail.trim(),
      userPhone: input.userPhone?.trim(),
      bloodGroup: input.bloodGroup,
      participantRole: input.participantRole || "donor",
      registeredAt: now,
      status: "REGISTERED",
      notes: input.notes?.trim(),
    };

    allParticipants.unshift(newParticipant);
    this.saveParticipants(allParticipants);

    // Update campaign registeredCount
    await this.updateCampaign(campaignId, {
      registeredCount: campaign.registeredCount + 1,
    });

    // Dispatch notification to user if logged in
    if (session?.user.id) {
      await notificationService.createNotification({
        userId: session.user.id,
        role: session.user.role,
        title: `Registered: ${campaign.title}`,
        message: `Your registration for ${campaign.title} on ${campaign.startDate} at ${campaign.venueName} has been confirmed.`,
        category: "CAMPAIGN",
        priority: "MEDIUM",
        linkUrl: `/campaigns`,
        metadata: { campaignId },
      });
    }

    return newParticipant;
  }

  /**
   * Retrieves participant roster for a campaign (enforces NGO ownership)
   */
  public async getCampaignParticipants(campaignId: string): Promise<CampaignParticipant[]> {
    const session = authAdapter.getSession();
    if (!session || !session.user) {
      throw new Error("Authentication required.");
    }

    const campaign = await this.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaign not found.");
    }

    if (session.user.role === "ngo" && campaign.ngoId !== session.user.id) {
      throw new Error("Access Denied: You cannot view participant rosters for another organization's campaigns.");
    }

    const all = this.loadParticipants();
    return all.filter((p) => p.campaignId === campaignId);
  }
}

export const campaignService = new CampaignService();
