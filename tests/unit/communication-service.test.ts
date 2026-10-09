import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  communicationService,
  maskPhoneNumber,
} from "@/lib/communication/communication-service";
import { authAdapter } from "@/lib/auth/auth-adapter";

describe("Privacy Protection, Masked Calling & Messaging", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(authAdapter, "getSession").mockReturnValue({
      user: {
        id: "usr-donor-001",
        email: "donor@drop4life.org",
        role: "donor",
        fullName: "Rahul Kumar",
        city: "Hyderabad",
      },
      token: "tok_test",
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });
  });

  describe("maskPhoneNumber", () => {
    it("masks Indian mobile numbers correctly to protect donor privacy", () => {
      expect(maskPhoneNumber("+91 98765 00001")).toBe("+91 98XXX X0001");
      expect(maskPhoneNumber("9876543210")).toBe("+91 98XXX X3210");
      expect(maskPhoneNumber(null)).toBe("+91 ••••• •••••");
    });
  });

  describe("in-app chat messaging", () => {
    it("sends peer message and reads back conversation", async () => {
      const msg = await communicationService.sendMessage(
        "usr-hosp-002",
        "Hello Dr. Verma, I am on my way for the emergency donation."
      );

      expect(msg.id).toBeDefined();
      expect(msg.content).toContain("on my way");
      expect(msg.senderRole).toBe("donor");

      const conversation = await communicationService.getConversation("usr-hosp-002");
      expect(conversation.length).toBe(1);
      expect(conversation[0].content).toBe(msg.content);
    });
  });

  describe("masked voice relay call simulation", () => {
    it("allocates virtual proxy bridge with demo simulation status", async () => {
      const call = await communicationService.initiateMaskedCall(
        "+91 98765 00002",
        "Apollo Hospital Blood Center"
      );

      expect(call.callId).toBeDefined();
      expect(call.isSimulated).toBe(true);
      expect(call.virtualProxyNumber).toContain("Drop4Life Proxy Bridge");
      expect(call.maskedRecipientNumber).toBe("+91 98XXX X0002");
      expect(call.message).toContain("SIMULATED VOICE RELAY");
    });
  });
});
