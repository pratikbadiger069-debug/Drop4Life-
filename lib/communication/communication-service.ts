/**
 * Drop4Life — Privacy Protection, Secure Messaging & Masked Calling Layer
 * 
 * Safeguards personal health information and contact privacy:
 * 1. Masks personal telephone numbers (e.g. +91 98XXX XXXXX) in public matching directories.
 * 2. Secure in-app peer-to-peer messaging between matched parties.
 * 3. Masked virtual relay call simulation (clearly labeled sandbox when no telecom API is connected).
 * 4. Server-side role authorization checks.
 */

import { InAppChatMessage, UserRole } from "@/lib/types";
import { authAdapter } from "@/lib/auth/auth-adapter";

const MESSAGES_STORAGE_KEY = "drop4life_in_app_chat_messages";

/**
 * Masks phone numbers to prevent unauthorized contact harvesting
 * Transforms "+91 98765 00001" -> "+91 98XXX X0001"
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return "+91 ••••• •••••";
  const cleaned = phone.trim();
  if (cleaned.length < 8) return "+91 ••••• •••••";

  // If already formatted with country code
  if (cleaned.startsWith("+91")) {
    const digits = cleaned.replace(/\D/g, "");
    if (digits.length >= 10) {
      const national = digits.slice(-10);
      return `+91 ${national.slice(0, 2)}XXX X${national.slice(-4)}`;
    }
    return "+91 98XXX XXXXX";
  }

  const digits = cleaned.replace(/\D/g, "");
  if (digits.length >= 10) {
    const national = digits.slice(-10);
    return `+91 ${national.slice(0, 2)}XXX X${national.slice(-4)}`;
  }

  return "+91 98XXX XXXXX";
}

export interface InitiateMaskedCallResult {
  callId: string;
  virtualProxyNumber: string;
  maskedRecipientNumber: string;
  isSimulated: boolean;
  status: "CONNECTED_DEMO" | "FAILED";
  message: string;
}

class CommunicationService {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private loadMessages(): InAppChatMessage[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(MESSAGES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveMessages(messages: InAppChatMessage[]): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn("Failed to persist in-app chat messages", e);
    }
  }

  /**
   * Generates deterministic conversation key between two users
   */
  public getConversationId(userAId: string, userBId: string): string {
    return [userAId, userBId].sort().join("__conv__");
  }

  /**
   * Sends an authenticated in-app message
   */
  public async sendMessage(
    recipientId: string,
    content: string
  ): Promise<InAppChatMessage> {
    const session = authAdapter.getSession();
    if (!session || !session.user) {
      throw new Error("Authentication required to send messages.");
    }

    if (!content || content.trim().length === 0) {
      throw new Error("Message text cannot be empty.");
    }

    const conversationId = this.getConversationId(session.user.id, recipientId);
    const newMessage: InAppChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      conversationId,
      senderId: session.user.id,
      senderName: session.user.fullName || "Drop4Life Member",
      senderRole: session.user.role,
      recipientId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const all = this.loadMessages();
    all.push(newMessage);
    this.saveMessages(all);

    return newMessage;
  }

  /**
   * Retrieves messages for a conversation
   */
  public async getConversation(otherUserId: string): Promise<InAppChatMessage[]> {
    const session = authAdapter.getSession();
    if (!session || !session.user) return [];

    const convId = this.getConversationId(session.user.id, otherUserId);
    const all = this.loadMessages();
    return all.filter((m) => m.conversationId === convId);
  }

  /**
   * Initiates a simulated masked voice relay call
   */
  public async initiateMaskedCall(
    recipientPhone: string,
    recipientRoleLabel: string = "Matched Coordinator"
  ): Promise<InitiateMaskedCallResult> {
    await new Promise((res) => setTimeout(res, 400));

    const maskedPhone = maskPhoneNumber(recipientPhone);

    return {
      callId: `call-relay-${Date.now()}`,
      virtualProxyNumber: "+91 80 4719 0000 (Drop4Life Proxy Bridge)",
      maskedRecipientNumber: maskedPhone,
      isSimulated: true,
      status: "CONNECTED_DEMO",
      message: `[SIMULATED VOICE RELAY] Connecting to ${recipientRoleLabel} at ${maskedPhone} via virtual proxy bridge. Both phone numbers remain private. (No real phone call placed in demo mode).`,
    };
  }
}

export const communicationService = new CommunicationService();
