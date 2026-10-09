import { BloodGroup, RequestPriority, RequestStatus } from "./types";

/**
 * Clearly labeled mock & fixture data for Phase 2 public exploration.
 * Demonstrates live filters and UI states without claiming to represent unverified clinical records.
 */

export interface PublicBloodRequest {
  id: string;
  hospitalName: string;
  department: string;
  city: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
  distanceKm?: number;
  isSimulated: boolean;
}

export interface PublicCampaign {
  id: string;
  title: string;
  organizerName: string;
  organizerType: "NGO" | "Hospital" | "Red Cross Chapter";
  city: string;
  locationAddress: string;
  startDate: string;
  endDate: string;
  targetUnits: number;
  registeredDonors: number;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED";
  description: string;
  isSimulated: boolean;
}

export const MOCK_PUBLIC_REQUESTS: PublicBloodRequest[] = [
  {
    id: "req-001",
    hospitalName: "Metro General Hospital",
    department: "Emergency Trauma Wing",
    city: "New York",
    bloodGroup: "O-",
    unitsNeeded: 4,
    priority: "CRITICAL",
    status: "OPEN",
    createdAt: "15 minutes ago",
    distanceKm: 3.2,
    isSimulated: true,
  },
  {
    id: "req-002",
    hospitalName: "St. Jude Medical Center",
    department: "Cardiovascular Surgery",
    city: "New York",
    bloodGroup: "A+",
    unitsNeeded: 3,
    priority: "EMERGENCY",
    status: "MATCHING",
    createdAt: "45 minutes ago",
    distanceKm: 5.8,
    isSimulated: true,
  },
  {
    id: "req-003",
    hospitalName: "City Heart & Lung Institute",
    department: "Surgical Intensive Care",
    city: "Brooklyn",
    bloodGroup: "B-",
    unitsNeeded: 2,
    priority: "URGENT",
    status: "OPEN",
    createdAt: "2 hours ago",
    distanceKm: 8.4,
    isSimulated: true,
  },
  {
    id: "req-004",
    hospitalName: "Mercy Children's Hospital",
    department: "Pediatric Hematology",
    city: "Queens",
    bloodGroup: "O+",
    unitsNeeded: 5,
    priority: "URGENT",
    status: "RESPONSES_RECEIVED",
    createdAt: "3 hours ago",
    distanceKm: 12.1,
    isSimulated: true,
  },
  {
    id: "req-005",
    hospitalName: "Northwestern Memorial Hospital",
    department: "General Surgery",
    city: "Chicago",
    bloodGroup: "AB-",
    unitsNeeded: 2,
    priority: "NORMAL",
    status: "OPEN",
    createdAt: "5 hours ago",
    distanceKm: 18.5,
    isSimulated: true,
  },
  {
    id: "req-006",
    hospitalName: "Memorial Sloan Care Hospital",
    department: "Oncology Care Unit",
    city: "Boston",
    bloodGroup: "A-",
    unitsNeeded: 3,
    priority: "EMERGENCY",
    status: "MATCHING",
    createdAt: "1 hour ago",
    distanceKm: 6.7,
    isSimulated: true,
  },
];

export const MOCK_PUBLIC_CAMPAIGNS: PublicCampaign[] = [
  {
    id: "camp-101",
    title: "Citywide Spring Blood Drive 2026",
    organizerName: "Regional LifeCare NGO",
    organizerType: "NGO",
    city: "New York",
    locationAddress: "Civic Plaza Community Hall, Midtown",
    startDate: "Tomorrow, 09:00 AM",
    endDate: "Tomorrow, 05:00 PM",
    targetUnits: 250,
    registeredDonors: 142,
    status: "ACTIVE",
    description:
      "Join our community blood drive partnering with regional hospitals to replenish low winter reserves.",
    isSimulated: true,
  },
  {
    id: "camp-102",
    title: "University Youth Blood Donation Festival",
    organizerName: "Campus Hope Volunteer Union",
    organizerType: "NGO",
    city: "Brooklyn",
    locationAddress: "University Student Center, 2nd Floor",
    startDate: "Oct 18, 2026, 10:00 AM",
    endDate: "Oct 19, 2026, 04:00 PM",
    targetUnits: 180,
    registeredDonors: 96,
    status: "UPCOMING",
    description:
      "A youth-led campus campaign raising awareness for voluntary regular blood and platelet donations.",
    isSimulated: true,
  },
  {
    id: "camp-103",
    title: "Healthcare Workers & First Responders Drive",
    organizerName: "St. Jude Medical Auxiliary",
    organizerType: "Hospital",
    city: "Queens",
    locationAddress: "Hospital Main Auditorium, Pavilion B",
    startDate: "Oct 24, 2026, 08:30 AM",
    endDate: "Oct 24, 2026, 06:00 PM",
    targetUnits: 300,
    registeredDonors: 215,
    status: "UPCOMING",
    description:
      "Dedicated drive for frontline healthcare staff and citizen volunteers to support trauma preparedness.",
    isSimulated: true,
  },
];

export const MOCK_TRUST_METRICS = {
  activeDonorsLabel: "12,400+",
  activeDonorsSub: "Voluntary Donors Registered (Simulated Demo)",
  hospitalsConnectedLabel: "140+",
  hospitalsConnectedSub: "Participating Hospitals (Simulated Demo)",
  campaignsCompletedLabel: "380+",
  campaignsCompletedSub: "Community Drives Mobilized (Simulated Demo)",
  avgResponseTimeLabel: "< 14 mins",
  avgResponseTimeSub: "Average Match Dispatch (Simulated Target)",
};
