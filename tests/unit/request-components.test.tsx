import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { EmergencyBadge } from "@/components/requests/emergency-badge";
import { RequestStatusTimeline } from "@/components/requests/request-status-timeline";
import { SmartDonorMatchingTable } from "@/components/matching/smart-donor-matching-table";
import { BloodRequest, DonorMatchResult } from "@/lib/types";
import { authAdapter } from "@/lib/auth/auth-adapter";

const mockRequest: BloodRequest = {
  id: "req-test-01",
  referenceNumber: "REQ-2026-9999",
  hospitalId: "usr-hosp-002",
  hospitalName: "St. Jude Medical Center",
  department: "Trauma Surgery",
  bloodGroup: "O-",
  unitsNeeded: 3,
  unitsFulfilled: 1,
  priority: "CRITICAL",
  requiredDate: "2026-10-15",
  city: "New York",
  requesterName: "Dr. David Brooks",
  requesterPhone: "+1 (555) 911-7890",
  requesterEmail: "hospital@drop4life.org",
  status: "IN_PROGRESS",
  statusTimeline: [
    {
      status: "SUBMITTED",
      timestamp: "2026-10-09T08:00:00.000Z",
      updatedBy: "Dr. David Brooks",
      notes: "Initial intake.",
    },
    {
      status: "IN_PROGRESS",
      timestamp: "2026-10-09T09:00:00.000Z",
      updatedBy: "Dr. David Brooks",
      notes: "Donor search started.",
    },
  ],
  createdAt: "2026-10-09T08:00:00.000Z",
  updatedAt: "2026-10-09T09:00:00.000Z",
};

const mockMatches: DonorMatchResult[] = [
  {
    donorId: "prof-donor-001",
    userId: "usr-donor-001",
    donorName: "Alex Morgan",
    bloodGroup: "O-",
    city: "New York",
    area: "Manhattan",
    preferredContactMethod: "SMS",
    matchScore: 95,
    isExactMatch: true,
    compatibilityType: "EXACT",
    matchExplanation: "Exact ABO/Rh match (O-) • Located in New York (Manhattan) • Full 56-day rest cycle elapsed",
    daysSinceLastDonation: 70,
  },
];

describe("Request & Matching UI Components (Phase 7)", () => {
  describe("EmergencyBadge", () => {
    it("renders Critical priority badge with distinct label and accessible role", () => {
      render(<EmergencyBadge priority="CRITICAL" />);
      expect(screen.getByText("Critical")).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveAttribute(
        "aria-label",
        "Priority: Critical. Required within 1 hour."
      );
    });

    it("renders Emergency priority badge", () => {
      render(<EmergencyBadge priority="EMERGENCY" />);
      expect(screen.getByText("Emergency")).toBeInTheDocument();
    });

    it("renders Standard scheduled badge", () => {
      render(<EmergencyBadge priority="NORMAL" />);
      expect(screen.getByText("Standard")).toBeInTheDocument();
    });
  });

  describe("RequestStatusTimeline", () => {
    it("renders progress stepper, current fulfillment count, and timeline events", () => {
      render(
        <RequestStatusTimeline
          request={mockRequest}
          onStatusUpdated={() => {}}
          canEdit={true}
        />
      );

      expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
      expect(screen.getAllByText("Submitted").length).toBeGreaterThan(0);
      expect(screen.getAllByText("In Progress").length).toBeGreaterThan(0);
      expect(screen.getByText(/Initial intake/)).toBeInTheDocument();
    });
  });

  describe("SmartDonorMatchingTable", () => {
    it("renders preliminary match clinical disclaimer and matched donor row", async () => {
      await authAdapter.login("hospital@drop4life.org", "HospitalPass123!");

      render(
        <SmartDonorMatchingTable
          request={mockRequest}
          matches={mockMatches}
          onDonorInvited={() => {}}
          canInvite={true}
        />
      );

      expect(
        screen.getByText(/Preliminary Match Disclaimer & Clinical Safety Note/i)
      ).toBeInTheDocument();
      expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
      expect(screen.getByText("95%")).toBeInTheDocument();
      expect(screen.getByText("Invite Donor")).toBeInTheDocument();
    });
  });
});
