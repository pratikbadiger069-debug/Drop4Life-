import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InventorySummaryCards } from "@/components/hospital/inventory-summary-cards";
import { InventoryTable } from "@/components/hospital/inventory-table";
import { InventoryAdjustmentDialog } from "@/components/hospital/inventory-adjustment-dialog";
import { InventoryAuditLogView } from "@/components/hospital/inventory-audit-log-view";
import { BloodInventoryItem, InventoryAuditLog } from "@/lib/types";
import { authAdapter } from "@/lib/auth/auth-adapter";

describe("Hospital Inventory UI Components", () => {
  const hospitalUserId = "usr-hosp-002";

  const mockInventory: BloodInventoryItem[] = [
    {
      hospitalId: hospitalUserId,
      bloodGroup: "O-",
      availableUnits: 2,
      reservedUnits: 2,
      quarantinedUnits: 1,
      expiredUnits: 0,
      lowStockThreshold: 8,
      stockStatus: "CRITICAL_LOW",
      lastUpdatedAt: "2026-10-01T00:00:00Z",
      lastUpdatedByStaffName: "Dr. Rajesh Verma",
    },
    {
      hospitalId: hospitalUserId,
      bloodGroup: "A+",
      availableUnits: 18,
      reservedUnits: 5,
      quarantinedUnits: 3,
      expiredUnits: 0,
      lowStockThreshold: 10,
      stockStatus: "ADEQUATE",
      lastUpdatedAt: "2026-10-01T00:00:00Z",
      lastUpdatedByStaffName: "Dr. Rajesh Verma",
    },
  ];

  const mockLogs: InventoryAuditLog[] = [
    {
      id: "log-1",
      hospitalId: hospitalUserId,
      bloodGroup: "O-",
      reason: "TRANSFUSION_DISPATCH",
      previousAvailable: 4,
      newAvailable: 2,
      previousReserved: 2,
      newReserved: 2,
      previousQuarantined: 1,
      newQuarantined: 1,
      previousExpired: 0,
      newExpired: 0,
      staffId: hospitalUserId,
      staffName: "Dr. Rajesh Verma",
      notes: "Emergency dispatch to Trauma Bay",
      timestamp: "2026-10-08T19:40:00Z",
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(authAdapter, "getSession").mockReturnValue({
      user: {
        id: hospitalUserId,
        email: "hospital@drop4life.org",
        role: "hospital",
        fullName: "Dr. Rajesh Verma",
        organizationName: "Apollo Hospital Jubilee Hills",
        city: "Hyderabad",
        verificationStatus: "verified",
      },
      token: "tok_test_hospital",
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });
  });

  describe("InventorySummaryCards", () => {
    it("renders available, reserved, quarantined, and shortage stats accurately", () => {
      render(<InventorySummaryCards inventory={mockInventory} />);

      // Total Available: 2 + 18 = 20
      expect(screen.getByText("20 Units")).toBeInTheDocument();
      // Total Reserved: 2 + 5 = 7
      expect(screen.getByText("7 Units")).toBeInTheDocument();
      // Total Quarantined: 1 + 3 = 4
      expect(screen.getByText("4 Units")).toBeInTheDocument();
      // Shortage Alerts: 1 Critical group
      expect(screen.getByText("1 Groups")).toBeInTheDocument();
    });
  });

  describe("InventoryTable", () => {
    it("renders table rows, badges, and triggers edit selection", () => {
      const onSelectForEdit = vi.fn();
      render(<InventoryTable inventory={mockInventory} onSelectForEdit={onSelectForEdit} />);

      const table = screen.getByRole("table", { name: /Hospital Blood Bank Inventory Table/i });
      expect(table).toBeInTheDocument();

      const adjustButtons = screen.getAllByRole("button", { name: /Adjust/i });
      expect(adjustButtons.length).toBe(2);
      fireEvent.click(adjustButtons[0]);
      expect(onSelectForEdit).toHaveBeenCalledWith(mockInventory[0]);
    });

    it("filters table items by blood group", () => {
      render(<InventoryTable inventory={mockInventory} onSelectForEdit={vi.fn()} />);

      const groupSelect = screen.getByLabelText(/Filter by Blood Group/i);
      fireEvent.change(groupSelect, { target: { value: "O-" } });

      const adjustButtons = screen.getAllByRole("button", { name: /Adjust/i });
      expect(adjustButtons.length).toBe(1);
    });
  });

  describe("InventoryAdjustmentDialog", () => {
    it("renders adjustment inputs and handles submission", async () => {
      const onSuccess = vi.fn();
      const onClose = vi.fn();

      render(
        <InventoryAdjustmentDialog
          isOpen={true}
          onClose={onClose}
          hospitalId={hospitalUserId}
          item={mockInventory[0]}
          staffName="Dr. Rajesh Verma"
          onSuccess={onSuccess}
        />
      );

      expect(
        screen.getByRole("heading", { name: /Update Blood Bank Inventory — Type O-/i })
      ).toBeInTheDocument();

      // Change available units to 10
      const availInput = screen.getByLabelText(/Available \(Ready for Use\) \*/i);
      fireEvent.change(availInput, { target: { value: "10" } });

      const submitBtn = screen.getByRole("button", { name: /Save Stock Adjustment/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe("InventoryAuditLogView", () => {
    it("renders transaction audit log items with staff name and reason", () => {
      render(<InventoryAuditLogView logs={mockLogs} />);

      expect(screen.getByText(/Inventory Transaction & Audit Trail/i)).toBeInTheDocument();
      expect(screen.getByText("Transfusion Dispatch")).toBeInTheDocument();
      expect(screen.getByText("Dr. Rajesh Verma")).toBeInTheDocument();
    });
  });
});
