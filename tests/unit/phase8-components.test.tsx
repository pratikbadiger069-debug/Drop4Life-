import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { NotificationCenterView } from "@/components/notifications/notification-center-view";
import { FacilityFinder } from "@/components/location/facility-finder";
import { InteractiveMapView } from "@/components/location/interactive-map-view";
import { CampaignParticipantList } from "@/components/campaigns/campaign-participant-list";
import { CampaignRegistrationDialog } from "@/components/campaigns/campaign-registration-dialog";
import { authAdapter } from "@/lib/auth/auth-adapter";
import { FacilityLocation, Campaign } from "@/lib/types";

const MOCK_FACILITY: FacilityLocation = {
  id: "fac-test-1",
  name: "General Health Hospital",
  facilityType: "HOSPITAL",
  address: "100 Medical Center Dr",
  city: "New York",
  latitude: 40.7128,
  longitude: -74.006,
  phone: "+1 (555) 123-4567",
  operatingHours: "24/7 Emergency",
  availableBloodGroups: ["O-", "A+"],
  distanceKm: 2.5,
};

const MOCK_CAMPAIGN: Campaign = {
  id: "camp-test-1",
  ngoId: "usr-ngo-003",
  ngoName: "Red Cross LifeCare Auxiliary",
  title: "Spring Blood Drive 2026",
  description: "Community blood drive",
  venueName: "Community Hall",
  address: "100 Main St",
  city: "New York",
  startDate: "2026-11-10",
  endDate: "2026-11-11",
  startTime: "09:00 AM",
  endTime: "05:00 PM",
  targetUnits: 100,
  collectedUnits: 20,
  registeredCount: 15,
  contactPhone: "+1 (555) 456-7890",
  contactEmail: "ngo@drop4life.org",
  status: "ACTIVE",
  isVerifiedOrg: true,
  createdAt: "2026-10-01T00:00:00Z",
  updatedAt: "2026-10-01T00:00:00Z",
};

describe("Phase 8 UI Components", () => {
  beforeEach(async () => {
    localStorage.clear();
    await authAdapter.login("donor@drop4life.org", "DonorPass123!");
  });

  it("renders NotificationCenterView with category tabs and notifications", async () => {
    const handleChanged = vi.fn();
    render(
      <NotificationCenterView
        userId="usr-donor-001"
        notifications={[
          {
            id: "notif-test-1",
            userId: "usr-donor-001",
            role: "donor",
            title: "Urgent O- Requisition Matched",
            message: "Emergency surgery requires 2 units of O- blood.",
            category: "DONOR_MATCH",
            priority: "HIGH",
            isRead: false,
            createdAt: "2026-10-09T08:00:00Z",
          },
        ]}
        onNotificationsChanged={handleChanged}
      />
    );

    // Check header
    expect(screen.getByText("Notification Center")).toBeInTheDocument();
    expect(screen.getByText(/Preferences/i)).toBeInTheDocument();

    // Check category tabs
    expect(screen.getByRole("button", { name: /^All/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Requisitions/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Donor Matches/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Campaigns/i })).toBeInTheDocument();

    // Verify notifications load
    expect(screen.getByText(/Urgent O- Requisition Matched/i)).toBeInTheDocument();
  });

  it("renders InteractiveMapView with facility markers and summary details", () => {
    const handleSelect = vi.fn();
    render(
      <InteractiveMapView
        facilities={[MOCK_FACILITY]}
        selectedFacilityId={MOCK_FACILITY.id}
        onSelectFacility={handleSelect}
        userCoord={{ latitude: 40.7128, longitude: -74.006 }}
      />
    );

    // Verify facility card in popup
    expect(screen.getByText("General Health Hospital")).toBeInTheDocument();
    expect(screen.getByText(/24\/7 Emergency/i)).toBeInTheDocument();
    expect(screen.getByText(/Directions/i)).toBeInTheDocument();
  });

  it("renders FacilityFinder and switches between list and map views", async () => {
    render(<FacilityFinder />);

    // Check view switcher buttons
    const mapBtn = screen.getByLabelText(/switch to map view/i);
    const listBtn = screen.getByLabelText(/switch to list view/i);

    expect(mapBtn).toBeInTheDocument();
    expect(listBtn).toBeInTheDocument();

    // Switch to list view
    fireEvent.click(listBtn);
    await waitFor(() => {
      expect(screen.getByText(/St\. Jude Medical Center/i)).toBeInTheDocument();
    });
  });

  it("renders CampaignParticipantList with role filters and metrics", () => {
    render(
      <CampaignParticipantList
        participants={[
          {
            id: "part-1",
            campaignId: "camp-test-1",
            userId: "usr-donor-001",
            userName: "Alex Morgan",
            userEmail: "donor@drop4life.org",
            bloodGroup: "O-",
            participantRole: "donor",
            registeredAt: "2026-10-05T00:00:00Z",
            status: "REGISTERED",
          },
        ]}
      />
    );

    expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
    expect(screen.getByText("donor@drop4life.org")).toBeInTheDocument();
    expect(screen.getByText(/Total Registrations/i)).toBeInTheDocument();
    expect(screen.getByText(/Pledged Donors/i)).toBeInTheDocument();
  });

  it("renders CampaignRegistrationDialog and allows submitting registration", async () => {
    const handleSuccess = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <CampaignRegistrationDialog
        campaign={MOCK_CAMPAIGN}
        open={true}
        onOpenChange={handleOpenChange}
        onRegisteredSuccess={handleSuccess}
      />
    );

    expect(screen.getByText(/Register: Spring Blood Drive 2026/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /confirm registration/i });
    expect(submitBtn).toBeInTheDocument();
  });
});

