/**
 * Drop4Life — Medical Eligibility Pre-Screening Service Layer
 * 
 * Conducts a 5-point preliminary screening before donors accept SOS requests or book donation slots:
 * 1. Recent weight (India standard >= 45 kg)
 * 2. Recent travel history (malaria/endemic exposure in past 6 months)
 * 3. Recent tattoos or piercings (within past 6-12 months)
 * 4. Hemoglobin level, if known (standard >= 12.5 g/dL)
 * 5. Current medications (antibiotics, blood thinners, etc.)
 * 
 * CLINICAL INTEGRITY & LEGAL SAFEGUARDS:
 * - This preliminary questionnaire does NOT automatically certify, reject, or guarantee a person's medical eligibility.
 * - Final eligibility must be assessed by qualified blood-bank personnel according to applicable national guidelines.
 * - Stored responses flag issues that require professional review.
 */

import { MedicalPreScreeningResponse } from "@/lib/types";
import { authAdapter } from "@/lib/auth/auth-adapter";

const SCREENING_STORAGE_KEY = "drop4life_donor_prescreenings";

export const MEDICAL_SCREENING_DISCLAIMER =
  "Drop4Life preliminary pre-screening is an informational tool and does NOT certify, guarantee, or finalize medical donor eligibility. Final medical fitness must be determined in-person by qualified blood bank medical officers following Ministry of Health & Family Welfare / NBTC guidelines, including on-site hemoglobin testing, blood pressure, and physical examination.";

export interface SubmitScreeningInput {
  weightKg: number;
  hasRecentTravel: boolean;
  travelDetails?: string;
  hasRecentTattooOrPiercing: boolean;
  hemoglobinKnown: boolean;
  hemoglobinLevel?: number;
  currentMedications: string;
  takingHighRiskMedications: boolean;
  disclaimerAcknowledged: boolean;
}

class MedicalScreeningService {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private loadScreenings(): MedicalPreScreeningResponse[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(SCREENING_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Failed to read medical pre-screening records", e);
      return [];
    }
  }

  private saveScreenings(data: MedicalPreScreeningResponse[]): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(SCREENING_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to persist medical pre-screening response", e);
    }
  }

  /**
   * Evaluates the 5 screening questions and identifies clinical review flags
   */
  public evaluateScreening(input: SubmitScreeningInput): {
    requiresProfessionalReview: boolean;
    reviewFlags: string[];
    weightEligible: boolean;
  } {
    const flags: string[] = [];

    // 1. Weight Evaluation (Standard >= 45 kg)
    const weightEligible = input.weightKg >= 45;
    if (!weightEligible) {
      flags.push("Weight under 45 kg requires clinical evaluation by blood-bank staff.");
    }

    // 2. Recent Travel History (Past 6 months)
    if (input.hasRecentTravel) {
      flags.push(
        input.travelDetails && input.travelDetails.trim().length > 0
          ? `Recent travel flagged: "${input.travelDetails}". Deferral or malaria antibody assessment required.`
          : "Recent international or endemic travel reported within 6 months. Blood bank officer must review deferral period."
      );
    }

    // 3. Tattoos or Piercings (Past 6-12 months)
    if (input.hasRecentTattooOrPiercing) {
      flags.push("Tattoo or body piercing within last 12 months requires blood bank safety clearance.");
    }

    // 4. Hemoglobin Level (if known, standard >= 12.5 g/dL)
    if (input.hemoglobinKnown && input.hemoglobinLevel !== undefined) {
      if (input.hemoglobinLevel < 12.5) {
        flags.push(
          `Self-reported hemoglobin (${input.hemoglobinLevel} g/dL) is below the minimum reference threshold of 12.5 g/dL.`
        );
      }
    }

    // 5. Current Medications
    if (input.takingHighRiskMedications) {
      flags.push(
        "Current medication regimen (e.g. antibiotics, anticoagulants, immunosuppressants) requires medical officer assessment."
      );
    } else if (
      input.currentMedications &&
      input.currentMedications.trim().length > 0 &&
      input.currentMedications.toLowerCase() !== "none" &&
      input.currentMedications.toLowerCase() !== "nil"
    ) {
      flags.push(`Active medications reported: "${input.currentMedications}". Medical officer review advised.`);
    }

    return {
      requiresProfessionalReview: flags.length > 0,
      reviewFlags: flags,
      weightEligible,
    };
  }

  /**
   * Submits and saves a donor's pre-screening questionnaire
   */
  public async submitScreening(
    input: SubmitScreeningInput,
    donorIdOverride?: string
  ): Promise<MedicalPreScreeningResponse> {
    await new Promise((res) => setTimeout(res, 80));

    const session = authAdapter.getSession();
    const donorId = donorIdOverride || session?.user?.id;
    if (!donorId) {
      throw new Error("Donor identification required to submit medical screening.");
    }

    if (!input.disclaimerAcknowledged) {
      throw new Error("You must acknowledge that final eligibility is assessed by blood bank personnel.");
    }

    if (!input.weightKg || input.weightKg < 30 || input.weightKg > 250) {
      throw new Error("Please enter a valid weight in kilograms.");
    }

    const evaluation = this.evaluateScreening(input);

    const record: MedicalPreScreeningResponse = {
      id: `screen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      donorId,
      weightKg: Number(input.weightKg),
      weightEligible: evaluation.weightEligible,
      hasRecentTravel: Boolean(input.hasRecentTravel),
      travelDetails: input.travelDetails?.trim() || undefined,
      hasRecentTattooOrPiercing: Boolean(input.hasRecentTattooOrPiercing),
      hemoglobinKnown: Boolean(input.hemoglobinKnown),
      hemoglobinLevel: input.hemoglobinLevel !== undefined ? Number(input.hemoglobinLevel) : undefined,
      currentMedications: input.currentMedications.trim() || "None",
      takingHighRiskMedications: Boolean(input.takingHighRiskMedications),
      requiresProfessionalReview: evaluation.requiresProfessionalReview,
      reviewFlags: evaluation.reviewFlags,
      completedAt: new Date().toISOString(),
      disclaimerAcknowledged: true,
    };

    const all = this.loadScreenings().filter((s) => s.donorId !== donorId); // Keep latest
    all.unshift(record);
    this.saveScreenings(all);

    return record;
  }

  /**
   * Retrieves the most recent screening for a donor
   */
  public getLatestScreening(donorId: string): MedicalPreScreeningResponse | null {
    const all = this.loadScreenings();
    return all.find((s) => s.donorId === donorId) || null;
  }

  /**
   * Checks if donor has a pre-screening on file within the past 30 days
   */
  public isScreeningRecent(screening: MedicalPreScreeningResponse | null): boolean {
    if (!screening) return false;
    const completed = new Date(screening.completedAt).getTime();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return completed >= thirtyDaysAgo;
  }
}

export const medicalScreeningService = new MedicalScreeningService();
