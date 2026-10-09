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
    expect(session.user.fullName).toBe("Alex Morgan");
  });

  it("authenticates valid hospital demo account", async () => {
    const session = await authAdapter.login("hospital@drop4life.org", "HospitalPass123!");
    expect(session.user.role).toBe("hospital");
    expect(session.user.organizationName).toBe("St. Jude Medical Center");
  });

  it("authenticates valid ngo demo account", async () => {
    const session = await authAdapter.login("ngo@drop4life.org", "NgoPass123!");
    expect(session.user.role).toBe("ngo");
    expect(session.user.organizationName).toBe("Red Cross LifeCare Auxiliary");
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
      city: "Boston",
      isAvailable: true,
    });

    expect(session.user.role).toBe("donor");
    expect(session.user.email).toBe("test.donor@example.com");
    expect(session.user.bloodGroup).toBe("A+");
    expect(session.user.verificationStatus).toBe("active");
  });

  it("registers a new hospital with pending verification status", async () => {
    const session = await authAdapter.registerHospital({
      hospitalName: "Boston General Hospital",
      licenseNumber: "LIC-BOS-1029",
      department: "Emergency Trauma",
      contactPerson: "Dr. Elizabeth Stone",
      workEmail: "trauma@bostongeneral.org",
      password: "HospPass123!",
      phone: "+1 555-0192",
      city: "Boston",
      address: "100 Health Way",
    });

    expect(session.user.role).toBe("hospital");
    expect(session.user.organizationName).toBe("Boston General Hospital");
    expect(session.user.verificationStatus).toBe("pending");
  });

  it("clears session on logout", async () => {
    await authAdapter.login("donor@drop4life.org", "DonorPass123!");
    expect(authAdapter.getSession()).not.toBeNull();

    authAdapter.logout();
    expect(authAdapter.getSession()).toBeNull();
  });
});
