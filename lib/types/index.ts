/**
 * Drop4Life Domain & UI Type Definitions
 */

export type UserRole = "donor" | "hospital" | "ngo" | "admin";

export type BloodGroup = "O-" | "O+" | "A-" | "A+" | "B-" | "B+" | "AB-" | "AB+";

export type RequestPriority = "CRITICAL" | "EMERGENCY" | "URGENT" | "NORMAL";

export type RequestStatus =
  | "OPEN"
  | "MATCHING"
  | "RESPONSES_RECEIVED"
  | "DONOR_CONFIRMED"
  | "IN_PROGRESS"
  | "FULFILLED"
  | "CANCELLED"
  | "EXPIRED";

export type DonorResponseStatus =
  | "INVITED"
  | "ACCEPTED"
  | "DECLINED"
  | "CONFIRMED"
  | "COMPLETED"
  | "NO_SHOW";

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
  isVerified: boolean;
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
