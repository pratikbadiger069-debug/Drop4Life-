import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AvailabilityToggle } from "@/components/donor/availability-toggle";
import { ProfileCompletionBar } from "@/components/donor/profile-completion-bar";
import { RecentDonationsWidget } from "@/components/donor/recent-donations-widget";
import { LogDonationDialog } from "@/components/donor/log-donation-dialog";
import { authAdapter } from "@/lib/auth/auth-adapter";
import { DonationRecord } from "@/lib/types";

describe("Donor UI Components", () => {
  const donorUserId = "usr-donor-001";

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(authAdapter, "getSession").mockReturnValue({
      user: {
        id: donorUserId,
        email: "donor@drop4life.org",
        role: "donor",
        fullName: "Alex Morgan",
        bloodGroup: "O-",
        city: "New York",
        verificationStatus: "active",
      },
      token: "tok_test_donor",
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });
  });

  describe("AvailabilityToggle", () => {
    it("renders all 3 availability options with descriptions", () => {
      render(
        <AvailabilityToggle
          userId={donorUserId}
          currentStatus="AVAILABLE"
        />
      );

      expect(screen.getByText(/Blood Donation Availability Status/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Available for contact/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Temporarily unavailable/i)).toBeInTheDocument();
      expect(screen.getByText(/Do not contact/i)).toBeInTheDocument();
    });

    it("triggers status update when clicking Temporarily Unavailable", async () => {
      const onStatusUpdated = vi.fn();
      render(
        <AvailabilityToggle
          userId={donorUserId}
          currentStatus="AVAILABLE"
          onStatusUpdated={onStatusUpdated}
        />
      );

      const unavailButton = screen.getByRole("button", { name: /Temporarily unavailable/i });
      fireEvent.click(unavailButton);

      await waitFor(() => {
        expect(screen.getByText(/successfully updated/i)).toBeInTheDocument();
      });
      expect(onStatusUpdated).toHaveBeenCalledWith("TEMPORARILY_UNAVAILABLE");
    });
  });

  describe("ProfileCompletionBar", () => {
    it("renders percentage and checklist items", () => {
      render(
        <ProfileCompletionBar
          profile={{
            fullName: "Alex Morgan",
            bloodGroup: "O-",
            phone: "+15551234567",
            city: "New York",
            profileCompletion: 80,
          }}
          showChecklist={true}
        />
      );

      expect(screen.getByText("80% Complete")).toBeInTheDocument();
      expect(screen.getByText("Full Name")).toBeInTheDocument();
      expect(screen.getByText("Blood Group")).toBeInTheDocument();
      expect(screen.getByText("Contact Phone")).toBeInTheDocument();
    });
  });

  describe("RecentDonationsWidget", () => {
    const mockRecords: DonationRecord[] = [
      {
        id: "rec-1",
        donorId: "prof-1",
        userId: donorUserId,
        donationDate: "2026-08-10",
        facilityName: "Mount Sinai Hospital",
        facilityCity: "New York",
        bloodGroup: "O-",
        units: 1,
        donationType: "WHOLE_BLOOD",
        recordStatus: "VERIFIED",
        referenceNumber: "MSH-100",
        createdAt: "2026-08-10T00:00:00Z",
      },
    ];

    it("renders donation list with verification badges", () => {
      render(
        <RecentDonationsWidget
          records={mockRecords}
        />
      );

      expect(screen.getByText("Mount Sinai Hospital")).toBeInTheDocument();
      expect(screen.getByText("Verified Record")).toBeInTheDocument();
      expect(screen.getByText("2026-08-10")).toBeInTheDocument();
    });

    it("renders empty state when no records are present", () => {
      render(<RecentDonationsWidget records={[]} />);
      expect(screen.getByText("No Donation Records Logged Yet")).toBeInTheDocument();
    });
  });

  describe("LogDonationDialog", () => {
    it("renders form fields and handles submission", async () => {
      const onRecordCreated = vi.fn();
      const onClose = vi.fn();

      render(
        <LogDonationDialog
          isOpen={true}
          onClose={onClose}
          userId={donorUserId}
          defaultBloodGroup="O-"
          defaultCity="New York"
          onRecordCreated={onRecordCreated}
        />
      );

      expect(screen.getByRole("heading", { name: /Log Past Blood Donation Event/i })).toBeInTheDocument();

      // Enter facility name
      const facilityInput = screen.getByPlaceholderText(/Mount Sinai Blood Center/i);
      fireEvent.change(facilityInput, { target: { value: "City General Hospital" } });

      const submitBtn = screen.getByRole("button", { name: /Save Donation Record/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(onRecordCreated).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });
  });
});
