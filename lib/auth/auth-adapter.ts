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
 * Pre-configured Demo Accounts for Phase 3 Review & QA
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
    },
  },
];

const SESSION_STORAGE_KEY = "drop4life_auth_session";

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

    const normalizedEmail = email.trim().toLowerCase();
    const demo = DEMO_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === normalizedEmail
    );

    if (!demo || demo.password !== password) {
      // Also check if user was newly registered in localStorage
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
            const session: AuthSession = {
              user: found.user,
              token: `tok_${Math.random().toString(36).substring(2)}_${Date.now()}`,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            };
            if (this.isClient()) {
              localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
            }
            return session;
          }
        } catch {
          // fallback to invalid
        }
      }

      throw new Error("Invalid email address or password. Please check your credentials.");
    }

    const session: AuthSession = {
      user: demo.user,
      token: `tok_demo_${demo.user.role}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (this.isClient()) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    return session;
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
