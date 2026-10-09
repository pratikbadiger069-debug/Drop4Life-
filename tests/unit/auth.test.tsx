import { describe, it, expect, beforeEach } from "vitest";
import { authAdapter, DEMO_ACCOUNTS } from "@/lib/auth/auth-adapter";

describe("Authentication Adapter (Phase 3)", () => {
  beforeEach(() => {
    authAdapter.logout();
  });

  it("authenticates valid donor demo account", async () => {
    const session = await authAdapter.login("donor@drop4life.org", "DonorPass123!");
    expect(session.user).toBeDefined();
    expect(session.user.role).toBe("donor");
    expect(session.user.email).toBe("donor@drop4life.org");
    expect(session.user.fullName).toBe("Rahul Kumar");
  });

  it("authenticates valid hospital demo account", async () => {
    const session = await authAdapter.login("hospital@drop4life.org", "HospitalPass123!");
    expect(session.user.role).toBe("hospital");
    expect(session.user.organizationName).toBe("Apollo Hospital Jubilee Hills");
  });

  it("authenticates valid ngo demo account", async () => {
    const session = await authAdapter.login("ngo@drop4life.org", "NgoPass123!");
    expect(session.user.role).toBe("ngo");
    expect(session.user.organizationName).toBe("Youth Red Cross Society & Lifeline");
  });

  it("authenticates valid recipient demo account", async () => {
    const session = await authAdapter.login("recipient@drop4life.org", "RecipientPass123!");
    expect(session.user.role).toBe("recipient");
    expect(session.user.fullName).toBe("Ananya Patel");
  });

  it("authenticates valid bloodbank demo account", async () => {
    const session = await authAdapter.login("bloodbank@drop4life.org", "BloodBankPass123!");
    expect(session.user.role).toBe("bloodbank");
    expect(session.user.fullName).toBe("Dr. Sneha Nair");
  });

  it("rejects invalid credentials with generic error message", async () => {
    await expect(
      authAdapter.login("unknown@drop4life.org", "WrongPassword123")
    ).rejects.toThrow(/invalid email address or password/i);
  });

  it("registers a new donor with initial active availability", async () => {
    const session = await authAdapter.registerDonor({
      fullName: "Test Donor",
      email: "test.donor@example.com",
      password: "TestPass123!",
      bloodGroup: "A+",
      city: "Bengaluru",
      isAvailable: true,
    });

    expect(session.user.role).toBe("donor");
    expect(session.user.email).toBe("test.donor@example.com");
    expect(session.user.bloodGroup).toBe("A+");
    expect(session.user.verificationStatus).toBe("active");
  });

  it("registers a new hospital with pending verification status", async () => {
    const session = await authAdapter.registerHospital({
      hospitalName: "Apollo Hospital Jubilee Hills",
      licenseNumber: "TS-MED-1029",
      department: "Emergency Trauma",
      contactPerson: "Dr. Rajesh Verma",
      workEmail: "trauma@apollo-hyd.org",
      password: "HospPass123!",
      phone: "+91 98765 00002",
      city: "Hyderabad",
      address: "Road No. 72, Jubilee Hills",
    });

    expect(session.user.role).toBe("hospital");
    expect(session.user.organizationName).toBe("Apollo Hospital Jubilee Hills");
    expect(session.user.verificationStatus).toBe("pending");
  });

  it("clears session on logout", async () => {
    await authAdapter.login("donor@drop4life.org", "DonorPass123!");
    expect(authAdapter.getSession()).not.toBeNull();

    authAdapter.logout();
    expect(authAdapter.getSession()).toBeNull();
  });
});
