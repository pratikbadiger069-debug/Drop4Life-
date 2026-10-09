import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CompatibilityChecker } from "@/components/compatibility/compatibility-checker";
import { CompatibilityReferenceTable } from "@/components/compatibility/compatibility-reference-table";
import { RED_CELL_COMPATIBILITY_DISCLAIMER } from "@/lib/blood-compatibility";

describe("CompatibilityChecker Component", () => {
  it("renders header, instructions, and both donor/recipient selector steps", () => {
    render(<CompatibilityChecker />);

    expect(
      screen.getByRole("heading", { name: /Blood Group Compatibility Checker/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/Select Donor Blood Group/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Recipient Blood Group/i)).toBeInTheDocument();
    expect(screen.getByText(/Awaiting Complete Selection/i)).toBeInTheDocument();
  });

  it("calculates compatible pair correctly (O- donor to AB+ recipient)", () => {
    render(<CompatibilityChecker />);

    const donorGroup = screen.getByRole("radiogroup", { name: /Donor blood group selection/i });
    const donorO = donorGroup.querySelector('button'); // First button in donor group is O-
    expect(donorO).not.toBeNull();
    if (donorO) fireEvent.click(donorO);

    const recipientGroup = screen.getByRole("radiogroup", { name: /Recipient blood group selection/i });
    const recipientButtons = recipientGroup.querySelectorAll('button');
    const recipientABplus = recipientButtons[recipientButtons.length - 1]; // Last button is AB+
    expect(recipientABplus).not.toBeNull();
    if (recipientABplus) fireEvent.click(recipientABplus);

    // Result should be visible and indicate compatible
    expect(
      screen.getByText("Generally compatible for red blood cell transfusion.")
    ).toBeInTheDocument();
  });

  it("calculates incompatible pair correctly (AB+ donor to O- recipient)", () => {
    render(<CompatibilityChecker />);

    const donorGroup = screen.getByRole("radiogroup", { name: /Donor blood group selection/i });
    const donorButtons = donorGroup.querySelectorAll('button');
    const donorABplus = donorButtons[donorButtons.length - 1]; // AB+
    if (donorABplus) fireEvent.click(donorABplus);

    const recipientGroup = screen.getByRole("radiogroup", { name: /Recipient blood group selection/i });
    const recipientOminus = recipientGroup.querySelector('button'); // O-
    if (recipientOminus) fireEvent.click(recipientOminus);

    expect(
      screen.getByText("Not generally compatible for red blood cell transfusion.")
    ).toBeInTheDocument();
  });

  it("resets selections when Reset button is clicked", () => {
    render(<CompatibilityChecker />);

    const donorGroup = screen.getByRole("radiogroup", { name: /Donor blood group selection/i });
    const donorO = donorGroup.querySelector('button');
    if (donorO) fireEvent.click(donorO);

    const recipientGroup = screen.getByRole("radiogroup", { name: /Recipient blood group selection/i });
    const recipientO = recipientGroup.querySelector('button');
    if (recipientO) fireEvent.click(recipientO);

    expect(screen.getByText("Generally compatible for red blood cell transfusion.")).toBeInTheDocument();

    const resetButton = screen.getByRole("button", { name: /Reset blood group selections/i });
    expect(resetButton).toBeInTheDocument();
    fireEvent.click(resetButton);

    expect(screen.getByText(/Awaiting Complete Selection/i)).toBeInTheDocument();
  });

  it("displays the mandatory educational and medical safety disclaimer", () => {
    render(<CompatibilityChecker />);

    expect(
      screen.getByText(RED_CELL_COMPATIBILITY_DISCLAIMER)
    ).toBeInTheDocument();
  });
});

describe("CompatibilityReferenceTable Component", () => {
  it("renders the table and allows switching tabs", () => {
    render(<CompatibilityReferenceTable />);

    expect(
      screen.getByText(/Red Blood Cell Compatibility Reference Table/i)
    ).toBeInTheDocument();

    // Default is Recipient View
    expect(screen.getByRole("table", { name: /Recipient Blood Compatibility Table/i })).toBeInTheDocument();

    // Switch to Donor View
    const donorTab = screen.getByRole("button", { name: /Donor View/i });
    fireEvent.click(donorTab);
    expect(screen.getByRole("table", { name: /Donor Blood Compatibility Table/i })).toBeInTheDocument();

    // Switch to 8x8 Matrix View
    const matrixTab = screen.getByRole("button", { name: /8×8 Matrix/i });
    fireEvent.click(matrixTab);
    expect(screen.getByRole("table", { name: /8 by 8 Red Blood Cell Compatibility Matrix/i })).toBeInTheDocument();
  });
});
