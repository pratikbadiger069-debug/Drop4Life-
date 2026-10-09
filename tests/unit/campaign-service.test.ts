import { describe, it, expect, beforeEach } from "vitest";
import { campaignService } from "@/lib/campaigns/campaign-service";
import { authAdapter } from "@/lib/auth/auth-adapter";

describe("NGO Campaign Service", () => {
  beforeEach(async () => {
    localStorage.clear();
    await authAdapter.login("ngo@drop4life.org", "NgoPass123!");
  });

  it("loads seeded campaigns and NGO profiles", async () => {
    const campaigns = await campaignService.getCampaigns();
    expect(campaigns.length).toBeGreaterThan(0);

    const profile = await campaignService.getNgoProfile("usr-ngo-003");
    expect(profile.organizationName).toBe("Youth Red Cross Society & Lifeline");
    expect(profile.isVerified).toBe(true);
  });

  it("creates a new campaign with valid fields", async () => {
    const newCamp = await campaignService.createCampaign({
      title: "Annual University Blood Drive 2026",
      description: "Partnering with campus health centers.",
      venueName: "Campus Recreation Center",
      address: "500 Main Street",
      city: "Bengaluru",
      area: "MG Road",
      startDate: "2026-11-15",
      endDate: "2026-11-16",
      startTime: "09:00 AM",
      endTime: "04:00 PM",
      targetUnits: 150,
      capacityLimit: 180,
      contactPhone: "+91 98765 00003",
      contactEmail: "ngo@drop4life.org",
      status: "PUBLISHED",
    });

    expect(newCamp.id).toBeDefined();
    expect(newCamp.title).toBe("Annual University Blood Drive 2026");
    expect(newCamp.ngoId).toBe("usr-ngo-003");
  });

  it("validates campaign date ranges and target units", async () => {
    // End date before start date
    await expect(
      campaignService.createCampaign({
        title: "Invalid Date Campaign",
        description: "Test description",
        venueName: "Cubbon Park",
        address: "Kasturba Road",
        city: "Bengaluru",
        startDate: "2026-11-20",
        endDate: "2026-11-10",
        startTime: "10:00 AM",
        endTime: "04:00 PM",
        targetUnits: 50,
        contactPhone: "+91 98765 00003",
        contactEmail: "ngo@drop4life.org",
      })
    ).rejects.toThrow(/start date cannot be after end date/i);

    // Target units zero or negative
    await expect(
      campaignService.createCampaign({
        title: "Invalid Unit Campaign",
        description: "Test description",
        venueName: "Cubbon Park",
        address: "Kasturba Road",
        city: "Bengaluru",
        startDate: "2026-11-10",
        endDate: "2026-11-12",
        startTime: "10:00 AM",
        endTime: "04:00 PM",
        targetUnits: 0,
        contactPhone: "+91 98765 00003",
        contactEmail: "ngo@drop4life.org",
      })
    ).rejects.toThrow(/target units must be at least 1/i);
  });

  it("enforces organization permissions when updating campaigns", async () => {
    // Update own campaign
    const updated = await campaignService.updateCampaign("camp-101", {
      targetUnits: 300,
    });
    expect(updated.targetUnits).toBe(300);

    // Attempting to update a campaign owned by another NGO (camp-103 belongs to usr-ngo-004)
    await expect(
      campaignService.updateCampaign("camp-103", {
        targetUnits: 999,
      })
    ).rejects.toThrow(/access denied/i);
  });

  it("cancels a campaign successfully", async () => {
    const cancelled = await campaignService.cancelCampaign(
      "camp-101",
      "Inclement weather emergency"
    );
    expect(cancelled.status).toBe("CANCELLED");
  });

  it("registers a participant and prevents duplicate registration", async () => {
    const participant = await campaignService.registerParticipant("camp-102", {
      userName: "Taylor Smith",
      userEmail: "taylor@example.org",
      bloodGroup: "A+",
      participantRole: "donor",
      notes: "Morning 10 AM slot",
    });

    expect(participant.id).toBeDefined();
    expect(participant.userName).toBe("Taylor Smith");

    // Second registration attempt with the same email
    await expect(
      campaignService.registerParticipant("camp-102", {
        userName: "Taylor Smith",
        userEmail: "taylor@example.org",
      })
    ).rejects.toThrow(/already registered/i);
  });

  it("enforces capacity limit for fully booked campaigns", async () => {
    // Create a small capacity campaign
    const camp = await campaignService.createCampaign({
      title: "Micro Drive Test",
      description: "Test capacity limit",
      venueName: "Clinic Room 1",
      address: "100 Medical Way",
      city: "Bengaluru",
      startDate: "2026-11-01",
      endDate: "2026-11-01",
      startTime: "09:00 AM",
      endTime: "11:00 AM",
      targetUnits: 1,
      capacityLimit: 1,
      contactPhone: "+91 98765 00003",
      contactEmail: "ngo@drop4life.org",
    });

    // First registration fills it
    await campaignService.registerParticipant(camp.id, {
      userName: "User 1",
      userEmail: "user1@example.org",
    });

    // Second registration should be rejected
    await expect(
      campaignService.registerParticipant(camp.id, {
        userName: "User 2",
        userEmail: "user2@example.org",
      })
    ).rejects.toThrow(/capacity limit/i);
  });

  it("enforces organization permissions when viewing participant rosters", async () => {
    // Own campaign roster
    const roster = await campaignService.getCampaignParticipants("camp-101");
    expect(roster.length).toBeGreaterThan(0);

    // Other organization campaign roster
    await expect(campaignService.getCampaignParticipants("camp-103")).rejects.toThrow(
      /access denied/i
    );
  });
});
