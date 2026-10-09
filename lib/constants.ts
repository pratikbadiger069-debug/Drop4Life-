import { BloodGroup, RequestPriority } from "./types";

export const APP_CONFIG = {
  name: "Drop4Life",
  tagline: "Every Drop Can Save a Life.",
  description:
    "A mission-critical blood donation and emergency blood coordination platform connecting donors, hospitals, and NGOs.",
  version: "1.0.0",
  contact: {
    email: "support@drop4life.org",
    emergencyHelpline: "1-800-DROP4LIFE",
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
  { title: "How It Works", href: "/how-it-works" },
  { title: "Find Blood", href: "/find-blood" },
  { title: "Compatibility", href: "/blood-compatibility" },
  { title: "Campaigns", href: "/campaigns" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
  { title: "Design System", href: "/design-system" },
];

export const DONOR_NAV_ITEMS = [
  { title: "Overview", href: "/donor/dashboard", icon: "LayoutDashboard", disabled: true },
  { title: "Blood Requests", href: "/donor/requests", icon: "Inbox", disabled: true },
  { title: "Donation History", href: "/donor/donations", icon: "History", disabled: true },
  { title: "Notifications", href: "/donor/notifications", icon: "Bell", disabled: true },
  { title: "My Profile", href: "/donor/profile", icon: "User", disabled: true },
  { title: "Settings", href: "/donor/settings", icon: "Settings", disabled: true },
];

export const HOSPITAL_NAV_ITEMS = [
  { title: "Live Radar", href: "/hospital/dashboard", icon: "Activity", disabled: true },
  { title: "Blood Requests", href: "/hospital/requests", icon: "Send", disabled: true },
  { title: "Blood Inventory", href: "/hospital/inventory", icon: "Layers", disabled: true },
  { title: "Donor Matching", href: "/hospital/donors", icon: "Users", disabled: true },
  { title: "Analytics & Reports", href: "/hospital/reports", icon: "BarChart3", disabled: true },
  { title: "Hospital Profile", href: "/hospital/profile", icon: "Building2", disabled: true },
  { title: "Settings", href: "/hospital/settings", icon: "Settings", disabled: true },
];

export const NGO_NAV_ITEMS = [
  { title: "Campaign Dashboard", href: "/ngo/dashboard", icon: "LayoutDashboard", disabled: true },
  { title: "Campaigns", href: "/ngo/campaigns", icon: "Flag", disabled: true },
  { title: "Blood Drives", href: "/ngo/blood-drives", icon: "Calendar", disabled: true },
  { title: "Donor Volunteers", href: "/ngo/donors", icon: "Users", disabled: true },
  { title: "Partner Hospitals", href: "/ngo/hospitals", icon: "Building", disabled: true },
  { title: "Reports", href: "/ngo/reports", icon: "FileText", disabled: true },
  { title: "Organization Profile", href: "/ngo/profile", icon: "Building2", disabled: true },
];
