import { describe, it, expect, beforeEach } from "vitest";
import { matchingService } from "@/lib/matching/matching-service";
import { requestService } from "@/lib/requests/request-service";
import { authAdapter } from "@/lib/auth/auth-adapter";
import { DonorProfile } from "@/lib/types";

describe("Smart Donor Matching Service (Phase 7)", () => {
  beforeEach(async () => {
    localStorage.clear();
    await authAdapter.login("hospital@drop4life.org", "HospitalPass123!");
  });

  describe("Donor Matching Evaluation & Filters", () => {
    it("excludes donors with incompatible red blood cell blood groups", () => {
      const aPosDonor: DonorProfile = {
        id: "d-apos",
        userId: "u-apos",
        fullName: "A+ Donor",
        email: "apos@example.org",
        bloodGroup: "A+",
        phone: "+91 98765 00001",
        city: "Hyderabad",
        availabilityStatus: "AVAILABLE",
        preferredContactMethod: "EMAIL",
        profileCompletion: 100,
      };

      // Target recipient: O- (Can only receive O-)
      const result = matchingService.evaluateDonorMatch(
        aPosDonor,
        "O-",
        "Hyderabad"
      );

      expect(result).toBeNull();
    });

    it("excludes donors who are marked TEMPORARILY_UNAVAILABLE or DO_NOT_CONTACT", () => {
      const busyDonor: DonorProfile = {
        id: "d-busy",
        userId: "u-busy",
        fullName: "Busy Donor",
        email: "busy@example.org",
        bloodGroup: "O-",
        phone: "+91 98765 00001",
        city: "Hyderabad",
        availabilityStatus: "TEMPORARILY_UNAVAILABLE",
        preferredContactMethod: "EMAIL",
        profileCompletion: 100,
      };

      const optOutDonor: DonorProfile = {
        id: "d-optout",
        userId: "u-optout",
        fullName: "Optout Donor",
        email: "optout@example.org",
        bloodGroup: "O-",
        phone: "+91 98765 00001",
        city: "Hyderabad",
        availabilityStatus: "DO_NOT_CONTACT",
        preferredContactMethod: "EMAIL",
        profileCompletion: 100,
      };

      expect(matchingService.evaluateDonorMatch(busyDonor, "O-", "Hyderabad")).toBeNull();
      expect(matchingService.evaluateDonorMatch(optOutDonor, "O-", "Hyderabad")).toBeNull();
    });

    it("ranks exact ABO/Rh matches higher than compatible alternative blood groups", () => {
      const exactDonor: DonorProfile = {
        id: "d-exact",
        userId: "u-exact",
        fullName: "Exact A+ Donor",
        email: "exact@example.org",
        bloodGroup: "A+",
        phone: "+91 98765 00001",
        city: "Hyderabad",
        area: "Jubilee Hills",
        availabilityStatus: "AVAILABLE",
        preferredContactMethod: "SMS",
        lastDonatedAt: "2026-06-01",
        profileCompletion: 100,
      };

      const compatibleDonor: DonorProfile = {
        id: "d-compat",
        userId: "u-compat",
        fullName: "Compatible O- Donor",
        email: "compat@example.org",
        bloodGroup: "O-",
        phone: "+91 98765 00001",
        city: "Hyderabad",
        area: "Jubilee Hills",
        availabilityStatus: "AVAILABLE",
        preferredContactMethod: "SMS",
        lastDonatedAt: "2026-06-01",
        profileCompletion: 100,
      };

      const exactEval = matchingService.evaluateDonorMatch(exactDonor, "A+", "Hyderabad", "Jubilee Hills");
      const compatEval = matchingService.evaluateDonorMatch(compatibleDonor, "A+", "Hyderabad", "Jubilee Hills");

      expect(exactEval).not.toBeNull();
      expect(compatEval).not.toBeNull();
      expect(exactEval!.isExactMatch).toBe(true);
      expect(compatEval!.isExactMatch).toBe(false);
      expect(exactEval!.totalScore).toBeGreaterThan(compatEval!.totalScore);
    });

    it("awards proximity bonus to donors in the same city and neighborhood", () => {
      const localDonor: DonorProfile = {
        id: "d-local",
        userId: "u-local",
        fullName: "Local Donor",
        email: "local@example.org",
        bloodGroup: "O-",
        phone: "+91 98765 00001",
        city: "Hyderabad",
        area: "Jubilee Hills",
        availabilityStatus: "AVAILABLE",
        preferredContactMethod: "SMS",
        profileCompletion: 100,
      };

      const distantDonor: DonorProfile = {
        id: "d-distant",
        userId: "u-distant",
        fullName: "Distant Donor",
        email: "distant@example.org",
        bloodGroup: "O-",
        phone: "+91 98765 00001",
        city: "Bengaluru",
        area: "Whitefield",
        availabilityStatus: "AVAILABLE",
        preferredContactMethod: "SMS",
        profileCompletion: 100,
      };

      const localEval = matchingService.evaluateDonorMatch(localDonor, "O-", "Hyderabad", "Jubilee Hills");
      const distantEval = matchingService.evaluateDonorMatch(distantDonor, "O-", "Hyderabad", "Jubilee Hills");

      expect(localEval!.locationPoints).toBeGreaterThan(distantEval!.locationPoints);
      expect(localEval!.totalScore).toBeGreaterThan(distantEval!.totalScore);
    });
  });

  describe("Invitation & Coordination Workflow", () => {
    it("allows authorized hospital to dispatch invitation and donor to accept", async () => {
      // 1. Hospital creates request
      const req = await requestService.createBloodRequest({
        bloodGroup: "O-",
        unitsNeeded: 2,
        priority: "CRITICAL",
        requiredDate: "2026-10-14",
        department: "Trauma Wing",
        city: "Hyderabad",
      });

      // 2. Hospital invites demo donor Rahul Kumar (prof-donor-001)
      const invitation = await matchingService.inviteDonor(req.id, "prof-donor-001");
      expect(invitation.status).toBe("INVITED");
      expect(invitation.donorUserId).toBe("usr-donor-001");

      // 3. Donor logs in and accepts invitation
      await authAdapter.login("donor@drop4life.org", "DonorPass123!");
      const accepted = await matchingService.donorRespondToInvitation(
        req.id,
        "usr-donor-001",
        "ACCEPTED",
        "Available immediately."
      );

      expect(accepted.status).toBe("ACCEPTED");
      expect(accepted.respondedAt).toBeDefined();
    });

    it("redacts private street addresses from matching query results", async () => {
      const matches = await matchingService.findMatchesForRequest("req-001");
      expect(matches.length).toBeGreaterThan(0);
      matches.forEach((m) => {
        expect((m as any).address).toBeUndefined();
        expect((m as any).dateOfBirth).toBeUndefined();
        expect(m.donorName).toBeDefined();
        expect(m.matchScore).toBeGreaterThan(0);
      });
    });
  });
});
