import { UserRole, BloodGroup } from "@/lib/types";

/**
 * Drop4Life Authentication & Session Interfaces
 */

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  organizationName?: string;
  verificationStatus?: "active" | "pending" | "verified" | "rejected";
  bloodGroup?: BloodGroup;
  city?: string;
  status?: "active" | "suspended";
  createdAt?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: string;
}

export interface RegisterDonorPayload {
  fullName: string;
  email: string;
  password: string;
  bloodGroup: BloodGroup;
  city: string;
  phone?: string;
  isAvailable?: boolean;
}

export interface RegisterHospitalPayload {
  hospitalName: string;
  licenseNumber: string;
  department: string;
  contactPerson: string;
  workEmail: string;
  password: string;
  phone: string;
  city: string;
  address: string;
}

export interface RegisterNgoPayload {
  organizationName: string;
  registrationId: string;
  contactPerson: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  coverageArea: string;
  description?: string;
}

/**
 * Pre-configured Demo Accounts for Testing & Administration
 */
export const DEMO_ACCOUNTS: Array<{
  email: string;
  password: string;
  user: AuthUser;
}> = [
  {
    email: "donor@drop4life.org",
    password: "DonorPass123!",
    user: {
      id: "usr-donor-001",
      email: "donor@drop4life.org",
      role: "donor",
      fullName: "Alex Morgan",
      bloodGroup: "O-",
      city: "New York",
      verificationStatus: "active",
      status: "active",
      createdAt: "2026-09-01T00:00:00Z",
    },
  },
  {
    email: "hospital@drop4life.org",
    password: "HospitalPass123!",
    user: {
      id: "usr-hosp-002",
      email: "hospital@drop4life.org",
      role: "hospital",
      fullName: "Dr. David Brooks",
      organizationName: "St. Jude Medical Center",
      city: "New York",
      verificationStatus: "verified",
      status: "active",
      createdAt: "2026-09-05T00:00:00Z",
    },
  },
  {
    email: "ngo@drop4life.org",
    password: "NgoPass123!",
    user: {
      id: "usr-ngo-003",
      email: "ngo@drop4life.org",
      role: "ngo",
      fullName: "Elena Vance",
      organizationName: "Red Cross LifeCare Auxiliary",
      city: "Brooklyn",
      verificationStatus: "verified",
      status: "active",
      createdAt: "2026-09-10T00:00:00Z",
    },
  },
  {
    email: "admin@drop4life.org",
    password: "AdminPass123!",
    user: {
      id: "usr-admin-001",
      email: "admin@drop4life.org",
      role: "admin",
      fullName: "Platform System Administrator",
      organizationName: "Drop4Life Governance & Oversight",
      city: "New York",
      verificationStatus: "verified",
      status: "active",
      createdAt: "2026-08-15T00:00:00Z",
    },
  },
];

const SESSION_STORAGE_KEY = "drop4life_auth_session";
const STATUS_OVERRIDES_KEY = "drop4life_user_status_overrides";
const VERIFICATION_OVERRIDES_KEY = "drop4life_user_verification_overrides";

/**
 * Drop4Life Authentication Development Adapter
 * NOTE: For Phase 3, this adapter safely manages in-memory/localStorage session state with strict validation.
 * In Phase 14, this will seamlessly switch to Supabase Auth backend.
 */
class Drop4LifeAuthAdapter {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  public getSession(): AuthSession | null {
    if (!this.isClient()) return null;
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;
      const session: AuthSession = JSON.parse(stored);
      // Check expiry (e.g. 7 days)
      if (new Date(session.expiresAt).getTime() < Date.now()) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  public async login(email: string, password: string): Promise<AuthSession> {
    // Artificial latency for UX realism
    await new Promise((resolve) => setTimeout(resolve, 350));

    let authenticatedUser: AuthUser | null = null;
    const normalizedEmail = email.toLowerCase().trim();
    const demo = DEMO_ACCOUNTS.find((d) => d.email.toLowerCase() === normalizedEmail);

    if (demo && demo.password === password) {
      authenticatedUser = { ...demo.user };
    } else {
      // Check registered users in storage
      const registeredUsersJson = this.isClient()
        ? localStorage.getItem("drop4life_registered_users")
        : null;
      if (registeredUsersJson) {
        try {
          const registeredUsers: Array<{
            email: string;
            passwordHash: string;
            user: AuthUser;
          }> = JSON.parse(registeredUsersJson);
          const found = registeredUsers.find(
            (u) => u.email.toLowerCase() === normalizedEmail
          );
          if (found && found.passwordHash === password) {
            authenticatedUser = { ...found.user };
          }
        } catch {
          // fallback
        }
      }
    }

    if (!authenticatedUser) {
      throw new Error("Invalid email address or password. Please check your credentials.");
    }

    // Apply any runtime status or verification overrides
    if (this.isClient()) {
      try {
        const statusOverrides = JSON.parse(localStorage.getItem(STATUS_OVERRIDES_KEY) || "{}");
        if (statusOverrides[authenticatedUser.id]) {
          authenticatedUser.status = statusOverrides[authenticatedUser.id];
        }
        const verificationOverrides = JSON.parse(localStorage.getItem(VERIFICATION_OVERRIDES_KEY) || "{}");
        if (verificationOverrides[authenticatedUser.id]) {
          authenticatedUser.verificationStatus = verificationOverrides[authenticatedUser.id];
        }
      } catch {
        // ignore
      }
    }

    if (authenticatedUser.status === "suspended") {
      throw new Error("Access Denied: Your account has been suspended by system administration.");
    }

    const session: AuthSession = {
      user: authenticatedUser,
      token: `tok_${authenticatedUser.role}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (this.isClient()) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    return session;
  }

  /**
   * Retrieves all users (demo and registered) with runtime overrides applied (Admin access)
   */
  public async getAllUsers(): Promise<AuthUser[]> {
    let usersList: AuthUser[] = DEMO_ACCOUNTS.map((d) => ({ ...d.user }));

    if (this.isClient()) {
      try {
        const stored = localStorage.getItem("drop4life_registered_users");
        if (stored) {
          const registered: Array<{ user: AuthUser }> = JSON.parse(stored);
          for (const item of registered) {
            if (!usersList.some((u) => u.id === item.user.id || u.email.toLowerCase() === item.user.email.toLowerCase())) {
              usersList.push({ ...item.user });
            }
          }
        }

        const statusOverrides = JSON.parse(localStorage.getItem(STATUS_OVERRIDES_KEY) || "{}");
        const verificationOverrides = JSON.parse(localStorage.getItem(VERIFICATION_OVERRIDES_KEY) || "{}");

        usersList = usersList.map((u) => ({
          ...u,
          status: statusOverrides[u.id] || u.status || "active",
          verificationStatus: verificationOverrides[u.id] || u.verificationStatus || (u.role === "donor" ? "active" : "pending"),
        }));
      } catch {
        // fallback
      }
    }

    return usersList;
  }

  /**
   * Updates user status (active vs suspended)
   */
  public async updateUserStatus(userId: string, status: "active" | "suspended"): Promise<void> {
    if (this.isClient()) {
      try {
        const current = JSON.parse(localStorage.getItem(STATUS_OVERRIDES_KEY) || "{}");
        current[userId] = status;
        localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(current));
      } catch {
        // ignore
      }
    }
  }

  /**
   * Updates organization/user verification status
   */
  public async updateUserVerification(
    userId: string,
    verificationStatus: "verified" | "pending" | "rejected"
  ): Promise<void> {
    if (this.isClient()) {
      try {
        const current = JSON.parse(localStorage.getItem(VERIFICATION_OVERRIDES_KEY) || "{}");
        current[userId] = verificationStatus;
        localStorage.setItem(VERIFICATION_OVERRIDES_KEY, JSON.stringify(current));
      } catch {
        // ignore
      }
    }
  }

  public async registerDonor(payload: RegisterDonorPayload): Promise<AuthSession> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newUser: AuthUser = {
      id: `usr-donor-${Date.now()}`,
      email: payload.email.trim().toLowerCase(),
      role: "donor",
      fullName: payload.fullName.trim(),
      bloodGroup: payload.bloodGroup,
      city: payload.city.trim(),
      verificationStatus: "active",
    };

    this.persistRegisteredUser(newUser, payload.password);

    const session: AuthSession = {
      user: newUser,
      token: `tok_reg_donor_${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (this.isClient()) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    return session;
  }

  public async registerHospital(payload: RegisterHospitalPayload): Promise<AuthSession> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newUser: AuthUser = {
      id: `usr-hosp-${Date.now()}`,
      email: payload.workEmail.trim().toLowerCase(),
      role: "hospital",
      fullName: payload.contactPerson.trim(),
      organizationName: payload.hospitalName.trim(),
      city: payload.city.trim(),
      verificationStatus: "pending",
    };

    this.persistRegisteredUser(newUser, payload.password);

    const session: AuthSession = {
      user: newUser,
      token: `tok_reg_hosp_${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (this.isClient()) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    return session;
  }

  public async registerNgo(payload: RegisterNgoPayload): Promise<AuthSession> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newUser: AuthUser = {
      id: `usr-ngo-${Date.now()}`,
      email: payload.email.trim().toLowerCase(),
      role: "ngo",
      fullName: payload.contactPerson.trim(),
      organizationName: payload.organizationName.trim(),
      city: payload.city.trim(),
      verificationStatus: "pending",
    };

    this.persistRegisteredUser(newUser, payload.password);

    const session: AuthSession = {
      user: newUser,
      token: `tok_reg_ngo_${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (this.isClient()) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    return session;
  }

  public logout(): void {
    if (this.isClient()) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  private persistRegisteredUser(user: AuthUser, passwordHash: string) {
    if (!this.isClient()) return;
    try {
      const existing = localStorage.getItem("drop4life_registered_users");
      const usersList = existing ? JSON.parse(existing) : [];
      usersList.push({ email: user.email, passwordHash, user });
      localStorage.setItem("drop4life_registered_users", JSON.stringify(usersList));
    } catch {
      // ignore
    }
  }
}

export const authAdapter = new Drop4LifeAuthAdapter();
