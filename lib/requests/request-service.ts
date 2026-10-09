/**
 * Drop4Life — Blood Request Management Service Layer
 * 
 * Manages hospital blood requisitions, intake validation, status state-machine transitions,
 * audit timelines, and duplicate submission prevention.
 * 
 * SECURITY & PERMISSIONS:
 * - Request creation & status updates require authorized hospital staff or admin privileges.
 * - Validates input bounds: positive integer unit requirements, valid blood groups, valid dates.
 * - Protects patient clinical privacy while logging essential coordination metadata.
 */

import {
  BloodRequest,
  RequestStatus,
  RequestPriority,
  BloodGroup,
  RequestTimelineEvent,
  RequestDonorInvitation,
  DonorResponseStatus,
} from "@/lib/types";
import { authAdapter } from "@/lib/auth/auth-adapter";
import { isValidBloodGroup } from "@/lib/blood-compatibility";

const REQUESTS_STORAGE_KEY = "drop4life_blood_requests";

/**
 * Seeded initial requests for demonstration and testing
 */
export const DEFAULT_MOCK_REQUESTS: BloodRequest[] = [
  {
    id: "req-001",
    referenceNumber: "REQ-2026-8801",
    hospitalId: "usr-hosp-002",
    hospitalName: "St. Jude Medical Center",
    department: "Trauma Surgery & Critical Care",
    bloodGroup: "O-",
    unitsNeeded: 3,
    unitsFulfilled: 0,
    priority: "CRITICAL",
    requiredDate: "2026-10-10",
    city: "New York",
    area: "Manhattan",
    requesterName: "Dr. David Brooks",
    requesterPhone: "+1 (555) 911-7890",
    requesterEmail: "hospital@drop4life.org",
    clinicalNotes: "Emergency trauma transfusion preparation. Universal O- units urgently required for immediate crossmatch.",
    status: "SUBMITTED",
    statusTimeline: [
      {
        status: "SUBMITTED",
        timestamp: "2026-10-09T08:30:00.000Z",
        updatedBy: "Dr. David Brooks (St. Jude Medical Center)",
        notes: "Initial emergency requisition submitted.",
      },
    ],
    invitedDonorIds: [],
    confirmedDonorIds: [],
    invitations: [],
    createdAt: "2026-10-09T08:30:00.000Z",
    updatedAt: "2026-10-09T08:30:00.000Z",
  },
  {
    id: "req-002",
    referenceNumber: "REQ-2026-8802",
    hospitalId: "usr-hosp-002",
    hospitalName: "St. Jude Medical Center",
    department: "Cardiovascular Operating Pavilion",
    bloodGroup: "A+",
    unitsNeeded: 4,
    unitsFulfilled: 1,
    priority: "EMERGENCY",
    requiredDate: "2026-10-11",
    city: "New York",
    area: "Manhattan",
    requesterName: "Dr. David Brooks",
    requesterPhone: "+1 (555) 345-6789",
    requesterEmail: "hospital@drop4life.org",
    clinicalNotes: "Scheduled bypass surgery with high risk of intraoperative blood loss. A+ or compatible red cells required.",
    status: "IN_PROGRESS",
    statusTimeline: [
      {
        status: "SUBMITTED",
        timestamp: "2026-10-08T14:15:00.000Z",
        updatedBy: "Dr. David Brooks (St. Jude Medical Center)",
        notes: "Requisition logged for operating room schedule.",
      },
      {
        status: "UNDER_REVIEW",
        timestamp: "2026-10-08T15:00:00.000Z",
        updatedBy: "Blood Bank Intake Officer",
        notes: "Inventory checked: 1 reserve unit allocated, 3 additional units needed.",
      },
      {
        status: "IN_PROGRESS",
        timestamp: "2026-10-08T16:30:00.000Z",
        updatedBy: "Dr. David Brooks",
        notes: "Smart donor matching activated and candidate invitations issued.",
      },
    ],
    invitedDonorIds: ["prof-donor-001"],
    confirmedDonorIds: [],
    invitations: [
      {
        id: "inv-001",
        requestId: "req-002",
        donorId: "prof-donor-001",
        donorUserId: "usr-donor-001",
        donorName: "Alex Morgan",
        donorBloodGroup: "O-",
        donorCity: "New York",
        donorArea: "Manhattan & Brooklyn",
        preferredContactMethod: "SMS",
        status: "INVITED",
        invitedAt: "2026-10-08T16:30:00.000Z",
        notes: "Automated match suggestion (Compatible O- universal donor)",
      },
    ],
    createdAt: "2026-10-08T14:15:00.000Z",
    updatedAt: "2026-10-08T16:30:00.000Z",
  },
  {
    id: "req-003",
    referenceNumber: "REQ-2026-7731",
    hospitalId: "usr-hosp-003",
    hospitalName: "Metro General Hospital",
    department: "Pediatric Hematology",
    bloodGroup: "B-",
    unitsNeeded: 2,
    unitsFulfilled: 0,
    priority: "URGENT",
    requiredDate: "2026-10-12",
    city: "Brooklyn",
    area: "Downtown Brooklyn",
    requesterName: "Dr. Sarah Jenkins",
    requesterPhone: "+1 (555) 887-1234",
    requesterEmail: "sjenkins@metrogeneral.org",
    clinicalNotes: "Pediatric sickle cell transfusion protocol.",
    status: "SUBMITTED",
    statusTimeline: [
      {
        status: "SUBMITTED",
        timestamp: "2026-10-07T09:00:00.000Z",
        updatedBy: "Dr. Sarah Jenkins (Metro General)",
        notes: "Urgent pediatric requisition created.",
      },
    ],
    invitedDonorIds: [],
    confirmedDonorIds: [],
    invitations: [],
    createdAt: "2026-10-07T09:00:00.000Z",
    updatedAt: "2026-10-07T09:00:00.000Z",
  },
  {
    id: "req-004",
    referenceNumber: "REQ-2026-6510",
    hospitalId: "usr-hosp-002",
    hospitalName: "St. Jude Medical Center",
    department: "Orthopedic Surgery Wing",
    bloodGroup: "O+",
    unitsNeeded: 2,
    unitsFulfilled: 2,
    priority: "NORMAL",
    requiredDate: "2026-10-05",
    city: "New York",
    area: "Manhattan",
    requesterName: "Dr. David Brooks",
    requesterPhone: "+1 (555) 345-6789",
    requesterEmail: "hospital@drop4life.org",
    clinicalNotes: "Elective joint replacement surgery buffer. Successfully fulfilled from blood drive reserves.",
    status: "FULFILLED",
    statusTimeline: [
      {
        status: "SUBMITTED",
        timestamp: "2026-10-03T10:00:00.000Z",
        updatedBy: "Dr. David Brooks",
      },
      {
        status: "IN_PROGRESS",
        timestamp: "2026-10-04T09:00:00.000Z",
        updatedBy: "Blood Bank Staff",
      },
      {
        status: "FULFILLED",
        timestamp: "2026-10-05T12:00:00.000Z",
        updatedBy: "Dr. David Brooks",
        notes: "2 units received and verified for transfusion.",
      },
    ],
    invitedDonorIds: [],
    confirmedDonorIds: [],
    invitations: [],
    createdAt: "2026-10-03T10:00:00.000Z",
    updatedAt: "2026-10-05T12:00:00.000Z",
  },
];

export interface CreateBloodRequestInput {
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  priority: RequestPriority;
  requiredDate: string;
  city: string;
  area?: string;
  department: string;
  requesterName?: string;
  requesterPhone?: string;
  requesterEmail?: string;
  clinicalNotes?: string;
}

export interface RequestFilterOptions {
  hospitalId?: string;
  status?: RequestStatus | "ALL";
  priority?: RequestPriority | "ALL";
  bloodGroup?: BloodGroup | "ALL";
  city?: string;
  searchQuery?: string;
}

class RequestService {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  /**
   * Generates unique readable reference number (e.g. REQ-2026-9284)
   */
  public generateReferenceNumber(): string {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `REQ-${year}-${randomSuffix}`;
  }

  /**
   * Validates state transitions in request workflow
   */
  public isValidStatusTransition(current: RequestStatus, next: RequestStatus): boolean {
    if (current === next) return true;

    // Terminal states cannot be changed
    if (current === "FULFILLED" || current === "CANCELLED") {
      return false;
    }

    // Cancellation is allowed from any active state
    if (next === "CANCELLED") {
      return true;
    }

    // Normal forward progression
    switch (current) {
      case "SUBMITTED":
      case "OPEN":
        return next === "UNDER_REVIEW" || next === "IN_PROGRESS" || next === "FULFILLED";
      case "UNDER_REVIEW":
      case "MATCHING":
        return next === "IN_PROGRESS" || next === "FULFILLED" || next === "SUBMITTED";
      case "IN_PROGRESS":
      case "RESPONSES_RECEIVED":
      case "DONOR_CONFIRMED":
        return next === "FULFILLED" || next === "UNDER_REVIEW";
      default:
        return false;
    }
  }

  /**
   * Loads all requests from storage or fallback defaults
   */
  private loadRequests(): BloodRequest[] {
    if (!this.isClient()) {
      return [...DEFAULT_MOCK_REQUESTS];
    }

    try {
      const stored = localStorage.getItem(REQUESTS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_REQUESTS));
        return [...DEFAULT_MOCK_REQUESTS];
      }
      return JSON.parse(stored);
    } catch {
      return [...DEFAULT_MOCK_REQUESTS];
    }
  }

  /**
   * Persists requests to storage
   */
  private saveRequests(requests: BloodRequest[]): void {
    if (this.isClient()) {
      try {
        localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
      } catch {
        // ignore
      }
    }
  }

  /**
   * Retrieves all blood requests matching optional criteria
   */
  public async getBloodRequests(filters: RequestFilterOptions = {}): Promise<BloodRequest[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    let results = this.loadRequests();

    if (filters.hospitalId) {
      results = results.filter((r) => r.hospitalId === filters.hospitalId);
    }

    if (filters.status && filters.status !== "ALL") {
      results = results.filter((r) => r.status === filters.status);
    }

    if (filters.priority && filters.priority !== "ALL") {
      results = results.filter((r) => r.priority === filters.priority);
    }

    if (filters.bloodGroup && filters.bloodGroup !== "ALL") {
      results = results.filter((r) => r.bloodGroup === filters.bloodGroup);
    }

    if (filters.city && filters.city.trim().length > 0) {
      const term = filters.city.toLowerCase().trim();
      results = results.filter((r) => r.city.toLowerCase().includes(term));
    }

    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      results = results.filter(
        (r) =>
          r.referenceNumber.toLowerCase().includes(q) ||
          r.hospitalName.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.bloodGroup.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q)
      );
    }

    // Sort priority: CRITICAL > EMERGENCY > URGENT > NORMAL, then newest
    const priorityWeight: Record<RequestPriority, number> = {
      CRITICAL: 4,
      EMERGENCY: 3,
      URGENT: 2,
      NORMAL: 1,
    };

    return results.sort((a, b) => {
      const weightDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  /**
   * Retrieves a single blood request by ID
   */
  public async getBloodRequestById(id: string): Promise<BloodRequest | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const all = this.loadRequests();
    return all.find((r) => r.id === id) || null;
  }

  /**
   * Creates a new blood request with strict validation and duplicate checks
   */
  public async createBloodRequest(input: CreateBloodRequestInput): Promise<BloodRequest> {
    const session = authAdapter.getSession();
    if (!session || !session.user) {
      throw new Error("Authentication required: Please log in to create a blood request.");
    }

    if (session.user.role !== "hospital" && session.user.role !== "admin") {
      throw new Error("Access Denied: Only authorized hospital personnel can submit blood requisitions.");
    }

    // Validate blood group
    if (!isValidBloodGroup(input.bloodGroup)) {
      throw new Error(`Invalid blood group '${input.bloodGroup}'. Must be one of the standard 8 ABO/Rh groups.`);
    }

    // Validate units needed
    if (!input.unitsNeeded || !Number.isInteger(input.unitsNeeded) || input.unitsNeeded < 1 || input.unitsNeeded > 20) {
      throw new Error("Required blood units must be an integer between 1 and 20 units.");
    }

    // Validate required date
    if (!input.requiredDate || isNaN(Date.parse(input.requiredDate))) {
      throw new Error("A valid required date is mandatory for blood requisitions.");
    }

    // Validate city / department
    if (!input.city || input.city.trim().length === 0) {
      throw new Error("Location city / service area is required.");
    }

    if (!input.department || input.department.trim().length === 0) {
      throw new Error("Hospital clinical department or wing is required.");
    }

    const allRequests = this.loadRequests();

    // Duplicate submission check: Same hospital, same blood group, same required date, pending status within last 1 hour
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const isDuplicate = allRequests.some((r) => {
      return (
        r.hospitalId === session.user.id &&
        r.bloodGroup === input.bloodGroup &&
        r.requiredDate === input.requiredDate &&
        r.status !== "CANCELLED" &&
        r.status !== "FULFILLED" &&
        new Date(r.createdAt) >= oneHourAgo
      );
    });

    if (isDuplicate) {
      throw new Error(
        `A pending request for ${input.bloodGroup} blood on ${input.requiredDate} already exists for this hospital. Please update the existing requisition instead of submitting a duplicate.`
      );
    }

    const hospitalName = session.user.fullName || "Hospital Facility";
    const requesterName = input.requesterName?.trim() || session.user.fullName || "Clinical Staff";
    const requesterPhone = input.requesterPhone?.trim() || "+1 (555) 000-0000";
    const requesterEmail = input.requesterEmail?.trim() || session.user.email;

    const initialTimeline: RequestTimelineEvent = {
      status: "SUBMITTED",
      timestamp: now.toISOString(),
      updatedBy: `${requesterName} (${hospitalName})`,
      notes: input.clinicalNotes ? `Requisition submitted: ${input.clinicalNotes.substring(0, 100)}` : "Requisition submitted.",
    };

    const newRequest: BloodRequest = {
      id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      referenceNumber: this.generateReferenceNumber(),
      hospitalId: session.user.id,
      hospitalName,
      department: input.department.trim(),
      bloodGroup: input.bloodGroup,
      unitsNeeded: input.unitsNeeded,
      unitsFulfilled: 0,
      priority: input.priority || "NORMAL",
      requiredDate: input.requiredDate,
      city: input.city.trim(),
      area: input.area?.trim() || undefined,
      requesterName,
      requesterPhone,
      requesterEmail,
      clinicalNotes: input.clinicalNotes?.trim() || undefined,
      status: "SUBMITTED",
      statusTimeline: [initialTimeline],
      invitedDonorIds: [],
      confirmedDonorIds: [],
      invitations: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    allRequests.unshift(newRequest);
    this.saveRequests(allRequests);

    return newRequest;
  }

  /**
   * Updates status of an existing request with timeline recording and authorization
   */
  public async updateRequestStatus(
    requestId: string,
    newStatus: RequestStatus,
    notes?: string
  ): Promise<BloodRequest> {
    const session = authAdapter.getSession();
    if (!session || !session.user) {
      throw new Error("Authentication required to update request status.");
    }

    if (session.user.role !== "hospital" && session.user.role !== "admin") {
      throw new Error("Access Denied: Only authorized hospital personnel can update blood request status.");
    }

    const allRequests = this.loadRequests();
    const index = allRequests.findIndex((r) => r.id === requestId);
    if (index === -1) {
      throw new Error(`Blood request with ID '${requestId}' not found.`);
    }

    const currentRequest = allRequests[index];

    // Check hospital ownership (hospital can only modify their own requests unless admin)
    if (session.user.role === "hospital" && currentRequest.hospitalId !== session.user.id) {
      throw new Error("Access Denied: You cannot modify requests belonging to another hospital.");
    }

    if (!this.isValidStatusTransition(currentRequest.status, newStatus)) {
      throw new Error(
        `Invalid status transition from '${currentRequest.status}' to '${newStatus}'.`
      );
    }

    const timelineEvent: RequestTimelineEvent = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      updatedBy: `${session.user.fullName || "Hospital Staff"} (${session.user.role})`,
      notes: notes?.trim() || `Status updated to ${newStatus}`,
    };

    const updatedRequest: BloodRequest = {
      ...currentRequest,
      status: newStatus,
      statusTimeline: [...(currentRequest.statusTimeline || []), timelineEvent],
      updatedAt: new Date().toISOString(),
    };

    // If marked fulfilled, set unitsFulfilled to unitsNeeded if not already set
    if (newStatus === "FULFILLED" && updatedRequest.unitsFulfilled < updatedRequest.unitsNeeded) {
      updatedRequest.unitsFulfilled = updatedRequest.unitsNeeded;
    }

    allRequests[index] = updatedRequest;
    this.saveRequests(allRequests);

    return updatedRequest;
  }

  /**
   * Updates fulfillment units count on a request
   */
  public async updateUnitsFulfilled(
    requestId: string,
    unitsFulfilled: number,
    notes?: string
  ): Promise<BloodRequest> {
    const session = authAdapter.getSession();
    if (!session || !session.user) {
      throw new Error("Authentication required.");
    }

    const allRequests = this.loadRequests();
    const index = allRequests.findIndex((r) => r.id === requestId);
    if (index === -1) {
      throw new Error("Request not found.");
    }

    const current = allRequests[index];
    if (session.user.role === "hospital" && current.hospitalId !== session.user.id) {
      throw new Error("Access Denied: Unauthorized request modification.");
    }

    if (unitsFulfilled < 0 || unitsFulfilled > current.unitsNeeded * 2) {
      throw new Error(`Fulfilled units must be between 0 and ${current.unitsNeeded * 2}`);
    }

    const isNowFulfilled = unitsFulfilled >= current.unitsNeeded;
    const nextStatus = isNowFulfilled ? "FULFILLED" : current.status === "SUBMITTED" ? "IN_PROGRESS" : current.status;

    const timelineEvent: RequestTimelineEvent = {
      status: nextStatus,
      timestamp: new Date().toISOString(),
      updatedBy: session.user.fullName || "Hospital Staff",
      notes: notes || `Updated units fulfilled: ${unitsFulfilled}/${current.unitsNeeded}`,
    };

    const updated: BloodRequest = {
      ...current,
      unitsFulfilled,
      status: nextStatus,
      statusTimeline: [...(current.statusTimeline || []), timelineEvent],
      updatedAt: new Date().toISOString(),
    };

    allRequests[index] = updated;
    this.saveRequests(allRequests);

    return updated;
  }

  /**
   * Cancels a blood request with reason
   */
  public async cancelBloodRequest(requestId: string, reason: string): Promise<BloodRequest> {
    return this.updateRequestStatus(requestId, "CANCELLED", reason || "Request cancelled by hospital.");
  }
}

export const requestService = new RequestService();
