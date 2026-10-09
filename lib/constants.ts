import { BloodGroup, RequestPriority, RequestStatus } from "./types";

export const APP_CONFIG = {
  name: "Drop4Life",
  tagline: "Every Drop Can Save a Life.",
  description:
    "A mission-critical blood donation and emergency blood coordination platform connecting donors, hospitals, and NGOs across India.",
  version: "1.0.0",
  contact: {
    email: "support@drop4life.org",
    emergencyHelpline: "1800-11-4433",
  },
} as const;

export const ALL_BLOOD_GROUPS: BloodGroup[] = [
  "O-",
  "O+",
  "A-",
  "A+",
  "B-",
  "B+",
  "AB-",
  "AB+",
];

export const PRIORITY_CONFIG: Record<
  RequestPriority,
  { label: string; color: string; badgeVariant: "destructive" | "warning" | "default" | "secondary" }
> = {
  CRITICAL: { label: "Critical (< 1 hr)", color: "text-red-700 bg-red-50 border-red-200", badgeVariant: "destructive" },
  EMERGENCY: { label: "Emergency (< 4 hrs)", color: "text-red-600 bg-red-50 border-red-100", badgeVariant: "destructive" },
  URGENT: { label: "Urgent (< 24 hrs)", color: "text-amber-700 bg-amber-50 border-amber-200", badgeVariant: "warning" },
  NORMAL: { label: "Standard / Scheduled", color: "text-slate-700 bg-slate-50 border-slate-200", badgeVariant: "secondary" },
};

export const PUBLIC_NAV_ITEMS = [
  { title: "Home", href: "/" },
  { title: "Request Blood", href: "/request-blood" },
  { title: "Find Blood", href: "/find-blood" },
  { title: "How It Works", href: "/how-it-works" },
  { title: "Compatibility", href: "/blood-compatibility" },
  { title: "Campaigns", href: "/campaigns" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

export const DONOR_AVAILABILITY_CONFIG: Record<
  string,
  { label: string; description: string; color: string; badgeVariant: "success" | "warning" | "destructive" }
> = {
  AVAILABLE: {
    label: "Available for contact",
    description: "You are open to receiving urgent blood donation contact for matching blood groups.",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    badgeVariant: "success",
  },
  TEMPORARILY_UNAVAILABLE: {
    label: "Temporarily unavailable",
    description: "You are currently unable to donate (recent donation recovery, travel, busy schedule).",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    badgeVariant: "warning",
  },
  DO_NOT_CONTACT: {
    label: "Do not contact",
    description: "You do not wish to receive notifications or donation contact at this time.",
    color: "text-slate-700 bg-slate-100 border-slate-300",
    badgeVariant: "destructive",
  },
};

export const REQUEST_STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; description: string; color: string; badgeVariant: "destructive" | "warning" | "default" | "secondary" | "success" }
> = {
  SUBMITTED: {
    label: "Submitted",
    description: "Requisition submitted and logged. Awaiting clinical intake review.",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    badgeVariant: "default",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    description: "Hospital staff evaluating inventory buffer and activating matching engine.",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    badgeVariant: "warning",
  },
  IN_PROGRESS: {
    label: "In Progress",
    description: "Compatible donor search and coordination actively underway.",
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
    badgeVariant: "default",
  },
  FULFILLED: {
    label: "Fulfilled",
    description: "Required blood units successfully fulfilled and verified.",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    badgeVariant: "success",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "Request closed or withdrawn by authorized hospital personnel.",
    color: "text-slate-600 bg-slate-100 border-slate-300",
    badgeVariant: "secondary",
  },
  OPEN: {
    label: "Open",
    description: "Requisition submitted and pending review.",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    badgeVariant: "default",
  },
  MATCHING: {
    label: "Matching",
    description: "Smart donor search active.",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    badgeVariant: "warning",
  },
  RESPONSES_RECEIVED: {
    label: "Responses Received",
    description: "Potential donors responding to requisition.",
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
    badgeVariant: "default",
  },
  DONOR_CONFIRMED: {
    label: "Donor Confirmed",
    description: "Donor confirmed for appointment.",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    badgeVariant: "success",
  },
};

export const DONOR_NAV_ITEMS = [
  { title: "Overview", href: "/donor/dashboard", icon: "LayoutDashboard", disabled: false },
  { title: "My Profile", href: "/donor/profile", icon: "User", disabled: false },
  { title: "Donation History", href: "/donor/donations", icon: "History", disabled: false },
  { title: "Blood Requests", href: "/donor/requests", icon: "Inbox", disabled: false },
  { title: "Notifications", href: "/donor/notifications", icon: "Bell", disabled: false },
  { title: "Settings", href: "/donor/settings", icon: "Settings", disabled: true },
];

export const STOCK_STATUS_CONFIG: Record<
  string,
  { label: string; description: string; color: string; badgeVariant: "destructive" | "warning" | "success" | "secondary" }
> = {
  CRITICAL_LOW: {
    label: "Critical Shortage",
    description: "Available inventory is below 50% of threshold or empty. Immediate donor requisitions required.",
    color: "text-red-700 bg-red-50 border-red-300",
    badgeVariant: "destructive",
  },
  LOW_STOCK: {
    label: "Low Stock",
    description: "Available stock is below safety threshold. Consider issuing donor callouts.",
    color: "text-amber-700 bg-amber-50 border-amber-300",
    badgeVariant: "warning",
  },
  ADEQUATE: {
    label: "Adequate Reserve",
    description: "Blood bank inventory satisfies standard operational buffers.",
    color: "text-emerald-700 bg-emerald-50 border-emerald-300",
    badgeVariant: "success",
  },
  SURPLUS: {
    label: "High Reserve",
    description: "Inventory is well above minimum safety thresholds.",
    color: "text-blue-700 bg-blue-50 border-blue-300",
    badgeVariant: "secondary",
  },
};

export const CAMPAIGN_STATUS_CONFIG: Record<
  string,
  { label: string; description: string; color: string; badgeVariant: "destructive" | "warning" | "success" | "secondary" | "default" }
> = {
  DRAFT: {
    label: "Draft",
    description: "Unpublished campaign draft visible only to your NGO team.",
    color: "text-slate-600 bg-slate-100 border-slate-300",
    badgeVariant: "secondary",
  },
  PUBLISHED: {
    label: "Published (Upcoming)",
    description: "Open for donor volunteer interest registration.",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    badgeVariant: "default",
  },
  ACTIVE: {
    label: "Live / In Progress",
    description: "Blood drive actively collecting donations on site.",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    badgeVariant: "success",
  },
  COMPLETED: {
    label: "Completed",
    description: "Campaign finished and logged into historical archives.",
    color: "text-slate-700 bg-slate-50 border-slate-200",
    badgeVariant: "secondary",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "Campaign cancelled or postponed by organizer.",
    color: "text-red-700 bg-red-50 border-red-200",
    badgeVariant: "destructive",
  },
};

export const HOSPITAL_NAV_ITEMS = [
  { title: "Command Radar", href: "/hospital/dashboard", icon: "Activity", disabled: false },
  { title: "Blood Inventory", href: "/hospital/inventory", icon: "Layers", disabled: false },
  { title: "Hospital Profile", href: "/hospital/profile", icon: "Building2", disabled: false },
  { title: "Blood Requests", href: "/hospital/requests", icon: "Send", disabled: false },
  { title: "Donor Matching", href: "/hospital/donors", icon: "Users", disabled: false },
  { title: "Notifications", href: "/hospital/notifications", icon: "Bell", disabled: false },
  { title: "Analytics & Reports", href: "/hospital/reports", icon: "BarChart3", disabled: true },
  { title: "Settings", href: "/hospital/settings", icon: "Settings", disabled: true },
];

export const NGO_NAV_ITEMS = [
  { title: "Campaign Dashboard", href: "/ngo/dashboard", icon: "LayoutDashboard", disabled: false },
  { title: "My Campaigns", href: "/ngo/campaigns", icon: "Flag", disabled: false },
  { title: "Volunteer Participants", href: "/ngo/participants", icon: "Users", disabled: false },
  { title: "Organization Profile", href: "/ngo/profile", icon: "Building2", disabled: false },
  { title: "Notifications", href: "/ngo/notifications", icon: "Bell", disabled: false },
  { title: "Reports", href: "/ngo/reports", icon: "FileText", disabled: true },
];

export const ADMIN_NAV_ITEMS = [
  { title: "Admin Overview", href: "/admin/dashboard", icon: "LayoutDashboard", disabled: false },
  { title: "Verification Queue", href: "/admin/verifications", icon: "ShieldCheck", disabled: false },
  { title: "User & Org Management", href: "/admin/users", icon: "Users", disabled: false },
  { title: "System Audit Logs", href: "/admin/audit-logs", icon: "ShieldAlert", disabled: false },
  { title: "Reports & Analytics", href: "/admin/reports", icon: "BarChart3", disabled: false },
  { title: "Global Inventory", href: "/admin/inventory", icon: "Layers", disabled: false },
  { title: "Requisitions Oversight", href: "/admin/requests", icon: "Send", disabled: false },
  { title: "Campaign Oversight", href: "/admin/campaigns", icon: "Flag", disabled: false },
];

export const RECIPIENT_NAV_ITEMS = [
  { title: "My Requests", href: "/recipient/dashboard", icon: "Send", disabled: false },
  { title: "Request Blood", href: "/request-blood", icon: "PlusCircle", disabled: false },
  { title: "Find Blood", href: "/find-blood", icon: "Search", disabled: false },
  { title: "Notifications", href: "/donor/notifications", icon: "Bell", disabled: false },
];

export const BLOOD_BANK_NAV_ITEMS = [
  { title: "Inventory Dashboard", href: "/bloodbank/dashboard", icon: "Layers", disabled: false },
  { title: "Emergency Requisitions", href: "/hospital/requests", icon: "Send", disabled: false },
  { title: "Donor Matching", href: "/hospital/donors", icon: "Users", disabled: false },
  { title: "Notifications", href: "/hospital/notifications", icon: "Bell", disabled: false },
];

export const INDIAN_CITIES = [
  "Hyderabad",
  "Bengaluru",
  "Chennai",
  "Mumbai",
  "New Delhi",
  "Vijayawada",
  "Visakhapatnam",
  "Kolkata",
  "Pune",
  "Kochi",
  "Ahmedabad",
  "Jaipur",
] as const;

export const INDIAN_STATES = [
  "Telangana",
  "Andhra Pradesh",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
  "Delhi NCR",
  "West Bengal",
  "Kerala",
  "Gujarat",
  "Rajasthan",
] as const;

export const DONOR_REWARD_TIERS = {
  BRONZE: {
    level: "BRONZE" as const,
    threshold: 1,
    name: "Bronze Lifesaver",
    description: "Completed first verified life-saving blood donation.",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
  },
  SILVER: {
    level: "SILVER" as const,
    threshold: 3,
    name: "Silver Lifesaver",
    description: "Completed 3 verified blood donations — stabilizing community reserves.",
    badgeClass: "bg-slate-200 text-slate-800 border-slate-300",
  },
  GOLD: {
    level: "GOLD" as const,
    threshold: 5,
    name: "Gold Lifesaver",
    description: "Completed 5 verified blood donations — an esteemed emergency hero.",
    badgeClass: "bg-yellow-100 text-yellow-900 border-yellow-300",
  },
  PLATINUM: {
    level: "PLATINUM" as const,
    threshold: 10,
    name: "Platinum Lifesaver",
    description: "Completed 10+ verified blood donations — exceptional civic lifesaver.",
    badgeClass: "bg-indigo-100 text-indigo-900 border-indigo-300",
  },
} as const;

/**
 * Validates Indian standard mobile numbers: 10 digits starting with 6, 7, 8, or 9
 * Supports +91, 0, or clean 10-digit formats.
 */
export function isValidIndianPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, "");
  return /^(\+91|0)?[6-9]\d{9}$/.test(cleaned);
}

/**
 * Formats a valid Indian mobile number to canonical "+91 XXXXX XXXXX"
 */
export function formatIndianPhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[\s\-()]/g, "");
  const match = cleaned.match(/^(\+91|0)?([6-9]\d{9})$/);
  if (match) {
    const num = match[2];
    return `+91 ${num.slice(0, 5)} ${num.slice(5)}`;
  }
  return phone;
}


