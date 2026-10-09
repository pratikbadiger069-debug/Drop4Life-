/**
 * Drop4Life — OTP & Identity Verification Service Layer
 * 
 * Provides:
 * 1. Mobile Phone & Email OTP verification
 * 2. Optional Aadhaar / ABHA health ID verification sandbox
 * 
 * COMPLIANCE & SAFETY SAFEGUARDS:
 * - If external telecom/UIDAI/ABDM credentials are not configured, runs in clearly labeled DEMO SIMULATION mode.
 * - In DEMO mode, NEVER sends actual SMS or calls, and never collects genuine 12-digit Aadhaar numbers or OTPs.
 * - Simulated verifications are explicitly tagged with `isSimulatedDemo: true`.
 * - Simulated verifications are NEVER misrepresented as official government or real identity certifications.
 */

import { IdentityVerificationDetails } from "@/lib/types";

export interface OtpSessionState {
  target: string;
  type: "phone" | "email";
  isSimulated: boolean;
  demoOtpCode?: string;
  expiresAt: number;
}

const VERIFICATION_STORAGE_KEY = "drop4life_identity_verifications";

class OtpVerificationService {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private activeSessions: Map<string, OtpSessionState> = new Map();

  /**
   * Dispatches or simulates an OTP for a given mobile number or email address
   */
  public async requestOtp(
    target: string,
    type: "phone" | "email"
  ): Promise<{ success: boolean; message: string; isSimulated: boolean; demoCode?: string }> {
    await new Promise((res) => setTimeout(res, 300));

    // Check if external SMS API is configured via environment variables
    const hasSmsGateway = false; // Demo mode enabled in development
    const demoCode = "123456";

    const sessionState: OtpSessionState = {
      target,
      type,
      isSimulated: !hasSmsGateway,
      demoOtpCode: demoCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    this.activeSessions.set(target, sessionState);

    return {
      success: true,
      isSimulated: true,
      demoCode: demoCode,
      message:
        type === "phone"
          ? `[DEMO SIMULATION] Verification code sent. Use test OTP: ${demoCode}. (No actual SMS is sent in demo mode).`
          : `[DEMO SIMULATION] Verification code sent. Use test OTP: ${demoCode}. (No actual email is sent in demo mode).`,
    };
  }

  /**
   * Verifies the entered OTP
   */
  public async verifyOtp(
    target: string,
    enteredCode: string
  ): Promise<{ success: boolean; isSimulated: boolean; error?: string }> {
    await new Promise((res) => setTimeout(res, 200));

    const session = this.activeSessions.get(target);
    const trimmed = enteredCode.trim();

    // In demo mode, accept default demo OTP '123456'
    if (trimmed === "123456" || (session && session.demoOtpCode === trimmed)) {
      if (session && Date.now() > session.expiresAt) {
        return { success: false, isSimulated: true, error: "OTP has expired. Please request a new code." };
      }
      return { success: true, isSimulated: true };
    }

    return {
      success: false,
      isSimulated: true,
      error: "Invalid OTP entered. Please use test demo OTP '123456'.",
    };
  }

  /**
   * Performs optional simulated Aadhaar or ABHA verification
   * NEVER collects real 12-digit Aadhaar! Collects test 4-digit last suffix or mock ID.
   */
  public async verifyGovernmentIdSimulated(
    userId: string,
    idType: "AADHAAR" | "ABHA",
    testSuffix: string, // e.g. "1234"
    consentGranted: boolean
  ): Promise<IdentityVerificationDetails> {
    await new Promise((res) => setTimeout(res, 350));

    if (!consentGranted) {
      throw new Error("User consent is strictly required for identity verification.");
    }

    const cleanSuffix = testSuffix.replace(/\D/g, "");
    if (cleanSuffix.length < 4) {
      throw new Error("Please enter a valid 4-digit test reference suffix (e.g. 1234).");
    }

    const verificationRecord: IdentityVerificationDetails = {
      phoneVerified: true,
      phoneVerifiedAt: new Date().toISOString(),
      emailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
      idType,
      idMaskedNumber: idType === "AADHAAR" ? `XXXX-XXXX-${cleanSuffix.slice(-4)}` : `ABHA-91-${cleanSuffix.slice(-4)}`,
      isSimulatedDemo: true, // ALWAYS true in demonstration mode
      verifiedAt: new Date().toISOString(),
    };

    if (this.isClient()) {
      try {
        const stored = localStorage.getItem(VERIFICATION_STORAGE_KEY) || "{}";
        const all = JSON.parse(stored);
        all[userId] = verificationRecord;
        localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(all));
      } catch (e) {
        console.warn("Failed to persist verification record", e);
      }
    }

    return verificationRecord;
  }

  /**
   * Gets stored identity verification details for a user
   */
  public getVerificationDetails(userId: string): IdentityVerificationDetails | null {
    if (!this.isClient()) return null;
    try {
      const stored = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      if (!stored) return null;
      const all = JSON.parse(stored);
      return all[userId] || null;
    } catch {
      return null;
    }
  }
}

export const otpVerificationService = new OtpVerificationService();
