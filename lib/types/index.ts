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

export interface DonorProfile {
  id: string;
  userId: string;
  fullName: string;
  bloodGroup: BloodGroup;
  phone: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isAvailable: boolean;
  lastDonatedAt?: string;
}

export interface HospitalProfile {
  id: string;
  userId: string;
  hospitalName: string;
  licenseNumber: string;
  department: string;
  phone: string;
  emergencyPhone: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isVerified: boolean;
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
  bloodGroup: BloodGroup;
  unitsAvailable: number;
  lowStockThreshold: number;
  lastUpdatedAt: string;
}

export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string;
  badge?: string;
}
