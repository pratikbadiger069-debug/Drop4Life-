import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AdminStatsOverview } from "@/components/admin/admin-stats-overview";
import { VerificationTable } from "@/components/admin/verification-table";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { AuditLogViewer } from "@/components/admin/audit-log-viewer";
import { ReportsGenerator } from "@/components/admin/reports-generator";
import {
  AdminDashboardMetrics,
  OrganizationVerificationItem,
  ManagedUserRecord,
  AuditLogEntry,
  AdminAnalyticsReport,
} from "@/lib/types";

describe("Admin Components Testing", () => {
  const mockMetrics: AdminDashboardMetrics = {
    totalDonors: 142,
    totalHospitals: 18,
    totalNgos: 9,
    totalUsers: 169,
    openRequests: 12,
    fulfilledRequests: 84,
    activeCampaigns: 5,
    totalCampaigns: 22,
    totalAvailableUnits: 320,
    criticalStockGroups: 2,
    pendingVerifications: 3,
    lastCalculatedAt: "2026-10-09T10:00:00Z",
  };

  const mockVerifications: OrganizationVerificationItem[] = [
    {
      id: "ver-1",
      userId: "usr-hosp-002",
      name: "Apollo Hospital Jubilee Hills",
      type: "hospital",
      contactPerson: "Dr. Rajesh Verma",
      email: "hospital@drop4life.org",
      phone: "+91 98765 00002",
      city: "Hyderabad",
      licenseOrRegId: "TS-MED-884210-A",
      verificationStatus: "pending",
      submittedAt: "2026-10-01T00:00:00Z",
    },
    {
      id: "ver-2",
      userId: "usr-ngo-003",
      name: "Youth Red Cross Society & Lifeline",
      type: "ngo",
      contactPerson: "Priya Reddy",
      email: "ngo@drop4life.org",
      phone: "+91 98765 00003",
      city: "Bengaluru",
      licenseOrRegId: "KA-NGO-2024-8841",
      verificationStatus: "verified",
      submittedAt: "2026-09-15T00:00:00Z",
    },
  ];

  const mockUsers: ManagedUserRecord[] = [
    {
      id: "usr-1",
      email: "donor@drop4life.org",
      fullName: "Rahul Kumar",
      role: "donor",
      status: "active",
      verificationStatus: "active",
      bloodGroup: "O+",
      city: "Hyderabad",
      createdAt: "2026-09-01T00:00:00Z",
    },
    {
      id: "usr-2",
      email: "hospital@drop4life.org",
      fullName: "Dr. Rajesh Verma",
      organizationName: "Apollo Hospital Jubilee Hills",
      role: "hospital",
      status: "active",
      verificationStatus: "verified",
      city: "Hyderabad",
      createdAt: "2026-09-05T00:00:00Z",
    },
  ];

  const mockLogs: AuditLogEntry[] = [
    {
      id: "log-1",
      timestamp: "2026-10-09T09:30:00Z",
      actorId: "usr-admin-001",
      actorRole: "admin",
      actorName: "System Administrator",
      action: "INVENTORY_CHANGE",
      targetType: "INVENTORY",
      targetId: "inv-O-neg",
      details: "Adjusted blood units for O- negative reserve.",
    },
    {
      id: "log-2",
      timestamp: "2026-10-09T08:15:00Z",
      actorId: "usr-admin-001",
      actorRole: "admin",
      actorName: "System Administrator",
      action: "VERIFICATION_DECISION",
      targetType: "ORGANIZATION",
      targetId: "usr-hosp-002",
      details: "Approved license TS-MED-884210-A.",
    },
  ];

  const mockReport: AdminAnalyticsReport = {
    generatedAt: "2026-10-09T12:00:00Z",
    dateRange: { startDate: "2026-10-01", endDate: "2026-10-31" },
    reportType: "OVERVIEW",
    summary: {
      totalRequests: 96,
      fulfilledCount: 84,
      fulfillmentRate: 88,
      totalUnitsRequested: 240,
      totalUnitsFulfilled: 210,
      totalCampaigns: 22,
      totalVolunteersPledged: 450,
      totalVerifiedOrgs: 27,
      pendingVerifications: 3,
      currentAvailableBloodUnits: 320,
    },
  };

  it("renders AdminStatsOverview with all metric cards", () => {
    render(<AdminStatsOverview metrics={mockMetrics} />);

    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText(/84\s+Fulfilled/i)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("320")).toBeInTheDocument();
  });

  it("renders VerificationTable and displays applications", () => {
    const handleDecision = vi.fn().mockResolvedValue(undefined);
    render(
      <VerificationTable
        items={mockVerifications}
        onDecision={handleDecision}
      />
    );

    expect(screen.getByText("Apollo Hospital Jubilee Hills")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Approve/i })).toBeInTheDocument();
  });

  it("renders UserManagementTable and filters search query", () => {
    const handleToggle = vi.fn().mockResolvedValue(undefined);
    render(
      <UserManagementTable
        users={mockUsers}
        onToggleStatus={handleToggle}
      />
    );

    expect(screen.getByText("Rahul Kumar")).toBeInTheDocument();
    expect(screen.getByText("Dr. Rajesh Verma")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(searchInput, { target: { value: "Rahul" } });

    expect(screen.getByText("Rahul Kumar")).toBeInTheDocument();
    expect(screen.queryByText("Dr. Rajesh Verma")).not.toBeInTheDocument();
  });

  it("renders AuditLogViewer and displays log entries", () => {
    render(<AuditLogViewer logs={mockLogs} />);

    expect(screen.getByText(/Adjusted blood units for O- negative reserve/i)).toBeInTheDocument();
    expect(screen.getByText(/Approved license TS-MED-884210-A/i)).toBeInTheDocument();
  });

  it("renders ReportsGenerator with summary data", () => {
    const handleRefresh = vi.fn().mockResolvedValue(undefined);
    render(
      <ReportsGenerator
        initialReport={mockReport}
        onRefreshReport={handleRefresh}
      />
    );

    expect(screen.getByText(/88% fulfillment rate/i)).toBeInTheDocument();
    expect(screen.getByText(/240 Units/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export CSV/i })).toBeInTheDocument();
  });
});
