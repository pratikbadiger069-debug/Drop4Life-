import { describe, it, expect, beforeEach } from "vitest";
import { requestService, CreateBloodRequestInput } from "@/lib/requests/request-service";
import { authAdapter } from "@/lib/auth/auth-adapter";

describe("Request Service (Phase 7)", () => {
  beforeEach(async () => {
    localStorage.clear();
    // Default mock hospital login
    await authAdapter.login("hospital@drop4life.org", "HospitalPass123!");
  });

  describe("Request Creation & Validation", () => {
    it("successfully creates a new blood request with reference number and initial timeline", async () => {
      const input: CreateBloodRequestInput = {
        bloodGroup: "O-",
        unitsNeeded: 3,
        priority: "CRITICAL",
        requiredDate: "2026-10-15",
        department: "Trauma ICU",
        city: "New York",
        area: "Manhattan",
        requesterPhone: "+1 (555) 911-7890",
        clinicalNotes: "Urgent trauma surgery prep.",
      };

      const created = await requestService.createBloodRequest(input);

      expect(created.id).toBeDefined();
      expect(created.referenceNumber).toMatch(/^REQ-2026-\d{4}$/);
      expect(created.bloodGroup).toBe("O-");
      expect(created.unitsNeeded).toBe(3);
      expect(created.unitsFulfilled).toBe(0);
      expect(created.priority).toBe("CRITICAL");
      expect(created.status).toBe("SUBMITTED");
      expect(created.statusTimeline).toHaveLength(1);
      expect(created.statusTimeline[0].status).toBe("SUBMITTED");
    });

    it("rejects request creation with invalid blood group", async () => {
      const input: any = {
        bloodGroup: "INVALID_GROUP",
        unitsNeeded: 2,
        priority: "NORMAL",
        requiredDate: "2026-10-15",
        department: "General",
        city: "New York",
      };

      await expect(requestService.createBloodRequest(input)).rejects.toThrow(
        /Invalid blood group/
      );
    });

    it("rejects request creation with invalid unit quantities (< 1 or > 20)", async () => {
      const inputInvalidLow: any = {
        bloodGroup: "A+",
        unitsNeeded: 0,
        priority: "NORMAL",
        requiredDate: "2026-10-15",
        department: "General",
        city: "New York",
      };

      await expect(requestService.createBloodRequest(inputInvalidLow)).rejects.toThrow(
        /between 1 and 20/
      );

      const inputInvalidHigh: any = {
        bloodGroup: "A+",
        unitsNeeded: 25,
        priority: "NORMAL",
        requiredDate: "2026-10-15",
        department: "General",
        city: "New York",
      };

      await expect(requestService.createBloodRequest(inputInvalidHigh)).rejects.toThrow(
        /between 1 and 20/
      );
    });

    it("rejects request creation if user is not authorized hospital staff or admin", async () => {
      // Log in as donor
      await authAdapter.login("donor@drop4life.org", "DonorPass123!");

      const input: CreateBloodRequestInput = {
        bloodGroup: "O-",
        unitsNeeded: 2,
        priority: "NORMAL",
        requiredDate: "2026-10-15",
        department: "General",
        city: "New York",
      };

      await expect(requestService.createBloodRequest(input)).rejects.toThrow(
        /Access Denied/
      );
    });

    it("prevents duplicate pending requests for same hospital, blood group, and date", async () => {
      const input: CreateBloodRequestInput = {
        bloodGroup: "B+",
        unitsNeeded: 2,
        priority: "URGENT",
        requiredDate: "2026-11-01",
        department: "ICU",
        city: "New York",
      };

      await requestService.createBloodRequest(input);

      // Attempting to submit identical request immediately
      await expect(requestService.createBloodRequest(input)).rejects.toThrow(
        /pending request for B\+ blood/
      );
    });
  });

  describe("Status Transitions & Workflow", () => {
    it("progresses request status through valid state machine transitions", async () => {
      const req = await requestService.createBloodRequest({
        bloodGroup: "AB+",
        unitsNeeded: 2,
        priority: "NORMAL",
        requiredDate: "2026-10-20",
        department: "Surgery",
        city: "New York",
      });

      expect(req.status).toBe("SUBMITTED");

      // Transition to UNDER_REVIEW
      const underReview = await requestService.updateRequestStatus(
        req.id,
        "UNDER_REVIEW",
        "Clinical intake started."
      );
      expect(underReview.status).toBe("UNDER_REVIEW");
      expect(underReview.statusTimeline).toHaveLength(2);

      // Transition to IN_PROGRESS
      const inProgress = await requestService.updateRequestStatus(
        req.id,
        "IN_PROGRESS",
        "Matching active."
      );
      expect(inProgress.status).toBe("IN_PROGRESS");
      expect(inProgress.statusTimeline).toHaveLength(3);

      // Transition to FULFILLED
      const fulfilled = await requestService.updateRequestStatus(
        req.id,
        "FULFILLED",
        "Units received."
      );
      expect(fulfilled.status).toBe("FULFILLED");
      expect(fulfilled.unitsFulfilled).toBe(2);
    });

    it("rejects invalid status transitions (e.g. from FULFILLED back to SUBMITTED)", async () => {
      const req = await requestService.createBloodRequest({
        bloodGroup: "A-",
        unitsNeeded: 1,
        priority: "NORMAL",
        requiredDate: "2026-10-22",
        department: "General",
        city: "New York",
      });

      await requestService.updateRequestStatus(req.id, "FULFILLED");

      await expect(
        requestService.updateRequestStatus(req.id, "SUBMITTED")
      ).rejects.toThrow(/Invalid status transition/);
    });

    it("allows cancellation from any active status", async () => {
      const req = await requestService.createBloodRequest({
        bloodGroup: "O+",
        unitsNeeded: 2,
        priority: "NORMAL",
        requiredDate: "2026-10-25",
        department: "General",
        city: "New York",
      });

      const cancelled = await requestService.cancelBloodRequest(
        req.id,
        "Patient transferred to another hospital."
      );

      expect(cancelled.status).toBe("CANCELLED");
      expect(cancelled.statusTimeline[1].notes).toContain("Patient transferred");
    });
  });

  describe("Query & Filtering", () => {
    it("filters requests by priority, status, and blood group", async () => {
      const all = await requestService.getBloodRequests();
      expect(all.length).toBeGreaterThan(0);

      const criticalOnly = await requestService.getBloodRequests({ priority: "CRITICAL" });
      expect(criticalOnly.every((r) => r.priority === "CRITICAL")).toBe(true);

      const oNegOnly = await requestService.getBloodRequests({ bloodGroup: "O-" });
      expect(oNegOnly.every((r) => r.bloodGroup === "O-")).toBe(true);
    });
  });
});
