/**
 * Drop4Life Domain & UI Type Definitions
 */

export type UserRole = "donor" | "hospital" | "ngo" | "admin";

export type BloodGroup = "O-" | "O+" | "A-" | "A+" | "B-" | "B+" | "AB-" | "AB+";

export type RequestPriority = "CRITICAL" | "EMERGENCY" | "URGENT" | "NORMAL";

export type RequestStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "IN_PROGRESS"
  | "FULFILLED"
  | "CANCELLED"
  | "OPEN" // legacy compatibility alias for SUBMITTED
  | "MATCHING" // legacy compatibility alias for UNDER_REVIEW
  | "RESPONSES_RECEIVED" // legacy alias
  | "DONOR_CONFIRMED"; // legacy alias

export type DonorResponseStatus =
  | "INVITED"
  | "ACCEPTED"
  | "DECLINED"
  | "CONFIRMED"
  | "COMPLETED"
  | "NO_SHOW";

export interface RequestDonorInvitation {
  id: string;
  requestId: string;
  donorId: string;
  donorUserId: string;
  donorName: string;
  donorBloodGroup: BloodGroup;
  donorCity: string;
  donorArea?: string;
  preferredContactMethod: PreferredContactMethod;
  status: DonorResponseStatus;
  invitedAt: string;
  respondedAt?: string;
  notes?: string;
}

export interface RequestTimelineEvent {
  status: RequestStatus;
  timestamp: string;
  updatedBy: string;
  notes?: string;
}

export interface BloodRequest {
  id: string;
  referenceNumber: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  unitsFulfilled: number;
  priority: RequestPriority;
  requiredDate: string;
  city: string;
  area?: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string;
  clinicalNotes?: string;
  status: RequestStatus;
  statusTimeline: RequestTimelineEvent[];
  invitedDonorIds?: string[];
  confirmedDonorIds?: string[];
  invitations?: RequestDonorInvitation[];
  createdAt: string;
  updatedAt: string;
}

export interface DonorMatchResult {
  donorId: string;
  userId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  city: string;
  area?: string;
  preferredContactMethod: PreferredContactMethod;
  matchScore: number; // 0 - 100%
  isExactMatch: boolean;
  compatibilityType: "EXACT" | "COMPATIBLE_RED_CELL";
  matchExplanation: string;
  daysSinceLastDonation?: number;
  invitationStatus?: DonorResponseStatus;
  invitedAt?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type DonorAvailabilityStatus =
  | "AVAILABLE"
  | "TEMPORARILY_UNAVAILABLE"
  | "DO_NOT_CONTACT";

export type PreferredContactMethod = "EMAIL" | "PHONE" | "SMS" | "WHATSAPP";

export type DonationRecordStatus = "VERIFIED" | "PENDING_REVIEW" | "SELF_REPORTED";

export type DonationType = "WHOLE_BLOOD" | "RED_CELLS" | "PLATELETS" | "PLASMA";

export interface DonorProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  bloodGroup: BloodGroup;
  phone: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  city: string;
  area?: string;
  address?: string;
  dateOfBirth?: string;
  availabilityStatus: DonorAvailabilityStatus;
  preferredLocation?: string;
  preferredContactMethod: PreferredContactMethod;
  availabilityNotes?: string;
  isAvailable?: boolean; // legacy alias for availabilityStatus === 'AVAILABLE'
  lastDonatedAt?: string;
  profileCompletion: number;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DonationRecord {
  id: string;
  donorId: string;
  userId: string;
  donationDate: string;
  facilityName: string;
  facilityCity: string;
  bloodGroup: BloodGroup;
  units: number;
  donationType: DonationType;
  recordStatus: DonationRecordStatus;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export type StockStatus = "CRITICAL_LOW" | "LOW_STOCK" | "ADEQUATE" | "SURPLUS";

export type InventoryAdjustmentReason =
  | "ROUTINE_AUDIT"
  | "DONATION_RECEIVED"
  | "TRANSFUSION_DISPATCH"
  | "RESERVED_FOR_SURGERY"
  | "EXPIRED_DISPOSAL"
  | "QUARANTINE_ADJUSTMENT";

export interface HospitalProfile {
  id: string;
  userId: string;
  hospitalName: string;
  licenseNumber: string;
  department: string;
  contactPerson: string;
  workEmail: string;
  phone: string;
  emergencyPhone: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isVerified: boolean;
  verificationStatus?: "verified" | "pending" | "rejected";
  totalBeds?: number;
  bloodBankLicense?: string;
  updatedAt?: string;
}

export interface NGOProfile {
  id: string;
  userId: string;
  organizationName: string;
  registrationId: string;
  contactPerson: string;
  phone: string;
  coverageArea: string;
  city?: string;
  address?: string;
  isVerified: boolean;
  verificationStatus?: "verified" | "pending" | "rejected";
  website?: string;
  description?: string;
  updatedAt?: string;
}

export type NotificationCategory =
  | "BLOOD_REQUEST"
  | "DONOR_MATCH"
  | "INVENTORY_ALERT"
  | "CAMPAIGN"
  | "SYSTEM";

export type NotificationPriority = "HIGH" | "MEDIUM" | "LOW";

export interface AppNotification {
  id: string;
  userId: string;
  role: UserRole;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  linkUrl?: string;
  isRead: boolean;
  metadata?: {
    requestId?: string;
    campaignId?: string;
    bloodGroup?: BloodGroup;
    hospitalId?: string;
    [key: string]: any;
  };
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreferences {
  inAppAlerts: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  urgentRequestsOnly: boolean;
  campaignAnnouncements: boolean;
  inventoryAlerts: boolean;
}

export type CampaignStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export interface CampaignParticipant {
  id: string;
  campaignId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  bloodGroup?: BloodGroup;
  participantRole: "donor" | "volunteer" | "medical_volunteer";
  registeredAt: string;
  status: "REGISTERED" | "ATTENDED" | "CANCELLED";
  notes?: string;
}

export interface Campaign {
  id: string;
  ngoId: string;
  ngoName: string;
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
  collectedUnits?: number;
  capacityLimit?: number;
  registeredCount: number;
  contactPhone: string;
  contactEmail: string;
  registrationInstructions?: string;
  status: CampaignStatus;
  isVerifiedOrg: boolean;
  participants?: CampaignParticipant[];
  createdAt: string;
  updatedAt: string;
}

export type FacilityType = "HOSPITAL" | "BLOOD_BANK" | "CAMPAIGN_VENUE";

export interface FacilityLocation {
  id: string;
  name: string;
  facilityType: FacilityType;
  address: string;
  city: string;
  area?: string;
  latitude: number;
  longitude: number;
  phone: string;
  emergencyPhone?: string;
  email?: string;
  distanceKm?: number;
  operatingHours?: string;
  isOpen24x7?: boolean;
  availableBloodGroups?: BloodGroup[];
  activeCampaignId?: string;
}


export interface BloodInventoryItem {
  hospitalId: string;
  bloodGroup: BloodGroup;
  availableUnits: number;
  reservedUnits: number;
  quarantinedUnits: number;
  expiredUnits: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  lastUpdatedAt: string;
  lastUpdatedByStaffId?: string;
  lastUpdatedByStaffName?: string;
  // legacy compatibility alias
  unitsAvailable?: number;
}

export interface InventoryAuditLog {
  id: string;
  hospitalId: string;
  bloodGroup: BloodGroup;
  reason: InventoryAdjustmentReason;
  previousAvailable: number;
  newAvailable: number;
  previousReserved: number;
  newReserved: number;
  previousQuarantined: number;
  newQuarantined: number;
  previousExpired: number;
  newExpired: number;
  staffId: string;
  staffName: string;
  notes?: string;
  timestamp: string;
}

export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string;
  badge?: string;
}
