import { describe, it, expect, beforeEach } from "vitest";
import { otpVerificationService } from "@/lib/auth/otp-verification-service";

describe("OTP & Identity Verification Service (Demo Sandbox)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("requests phone OTP and receives demo code without actual SMS dispatch", async () => {
    const res = await otpVerificationService.requestOtp("+91 98765 00001", "phone");
    expect(res.success).toBe(true);
    expect(res.isSimulated).toBe(true);
    expect(res.demoCode).toBe("123456");
    expect(res.message).toContain("DEMO SIMULATION");
  });

  it("verifies entered demo OTP code successfully", async () => {
    await otpVerificationService.requestOtp("+91 98765 00001", "phone");
    const verifyResult = await otpVerificationService.verifyOtp("+91 98765 00001", "123456");
    expect(verifyResult.success).toBe(true);
    expect(verifyResult.isSimulated).toBe(true);
  });

  it("rejects incorrect OTP code", async () => {
    await otpVerificationService.requestOtp("+91 98765 00001", "phone");
    const verifyResult = await otpVerificationService.verifyOtp("+91 98765 00001", "000000");
    expect(verifyResult.success).toBe(false);
    expect(verifyResult.error).toContain("Invalid OTP");
  });

  it("performs simulated Aadhaar verification with explicit consent and watermark", async () => {
    const idResult = await otpVerificationService.verifyGovernmentIdSimulated(
      "usr-donor-001",
      "AADHAAR",
      "9988",
      true
    );

    expect(idResult.idType).toBe("AADHAAR");
    expect(idResult.idMaskedNumber).toBe("XXXX-XXXX-9988");
    expect(idResult.isSimulatedDemo).toBe(true);
    expect(idResult.phoneVerified).toBe(true);
  });

  it("rejects simulated identity verification without user consent", async () => {
    await expect(
      otpVerificationService.verifyGovernmentIdSimulated(
        "usr-donor-001",
        "ABHA",
        "1234",
        false
      )
    ).rejects.toThrow(/consent is strictly required/i);
  });
});
