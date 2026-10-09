import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  medicalScreeningService,
  MEDICAL_SCREENING_DISCLAIMER,
} from "@/lib/screening/screening-service";
import { authAdapter } from "@/lib/auth/auth-adapter";

describe("Medical Eligibility Pre-Screening Service", () => {
  const donorId = "usr-donor-001";

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(authAdapter, "getSession").mockReturnValue({
      user: {
        id: donorId,
        email: "donor@drop4life.org",
        role: "donor",
        fullName: "Rahul Kumar",
        bloodGroup: "O-",
        city: "Hyderabad",
      },
      token: "tok_test",
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });
  });

  it("evaluates healthy donor answers without clinical flags", () => {
    const evalResult = medicalScreeningService.evaluateScreening({
      weightKg: 68,
      hasRecentTravel: false,
      hasRecentTattooOrPiercing: false,
      hemoglobinKnown: true,
      hemoglobinLevel: 14.2,
      currentMedications: "None",
      takingHighRiskMedications: false,
      disclaimerAcknowledged: true,
    });

    expect(evalResult.requiresProfessionalReview).toBe(false);
    expect(evalResult.reviewFlags.length).toBe(0);
    expect(evalResult.weightEligible).toBe(true);
  });

  it("flags underweight donor (< 45 kg) for blood-bank officer review", () => {
    const evalResult = medicalScreeningService.evaluateScreening({
      weightKg: 42,
      hasRecentTravel: false,
      hasRecentTattooOrPiercing: false,
      hemoglobinKnown: false,
      currentMedications: "None",
      takingHighRiskMedications: false,
      disclaimerAcknowledged: true,
    });

    expect(evalResult.requiresProfessionalReview).toBe(true);
    expect(evalResult.weightEligible).toBe(false);
    expect(evalResult.reviewFlags.some((f) => f.includes("under 45 kg"))).toBe(true);
  });

  it("flags recent travel history and tattoo/piercing within 12 months", () => {
    const evalResult = medicalScreeningService.evaluateScreening({
      weightKg: 65,
      hasRecentTravel: true,
      travelDetails: "Traveled to Southeast Asia 2 months ago",
      hasRecentTattooOrPiercing: true,
      hemoglobinKnown: false,
      currentMedications: "None",
      takingHighRiskMedications: false,
      disclaimerAcknowledged: true,
    });

    expect(evalResult.requiresProfessionalReview).toBe(true);
    expect(evalResult.reviewFlags.length).toBe(2);
  });

  it("flags low hemoglobin (< 12.5 g/dL) and high-risk medications", () => {
    const evalResult = medicalScreeningService.evaluateScreening({
      weightKg: 60,
      hasRecentTravel: false,
      hasRecentTattooOrPiercing: false,
      hemoglobinKnown: true,
      hemoglobinLevel: 11.2,
      currentMedications: "Amoxicillin course",
      takingHighRiskMedications: true,
      disclaimerAcknowledged: true,
    });

    expect(evalResult.requiresProfessionalReview).toBe(true);
    expect(evalResult.reviewFlags.some((f) => f.includes("12.5 g/dL"))).toBe(true);
    expect(evalResult.reviewFlags.some((f) => f.includes("medication regimen"))).toBe(true);
  });

  it("submits and persists pre-screening with mandatory clinical disclaimer acknowledgment", async () => {
    const submission = await medicalScreeningService.submitScreening({
      weightKg: 70,
      hasRecentTravel: false,
      hasRecentTattooOrPiercing: false,
      hemoglobinKnown: true,
      hemoglobinLevel: 13.8,
      currentMedications: "None",
      takingHighRiskMedications: false,
      disclaimerAcknowledged: true,
    });

    expect(submission.id).toBeDefined();
    expect(submission.donorId).toBe(donorId);
    expect(submission.disclaimerAcknowledged).toBe(true);

    const latest = medicalScreeningService.getLatestScreening(donorId);
    expect(latest).toBeDefined();
    expect(latest?.id).toBe(submission.id);
    expect(medicalScreeningService.isScreeningRecent(latest)).toBe(true);
  });

  it("rejects submission when disclaimer is not acknowledged", async () => {
    await expect(
      medicalScreeningService.submitScreening({
        weightKg: 70,
        hasRecentTravel: false,
        hasRecentTattooOrPiercing: false,
        hemoglobinKnown: false,
        currentMedications: "None",
        takingHighRiskMedications: false,
        disclaimerAcknowledged: false,
      })
    ).rejects.toThrow(/acknowledge that final eligibility is assessed by blood bank personnel/i);
  });
});
