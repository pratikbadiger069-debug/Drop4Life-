import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FindBloodPage from "@/app/find-blood/page";

describe("Find Blood Page Interactions", () => {
  it("renders search bar and filters", () => {
    render(<FindBloodPage />);
    expect(screen.getByLabelText(/blood group/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. new york/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/urgency priority/i)).toBeInTheDocument();
  });

  it("filters requests when blood group is changed", () => {
    render(<FindBloodPage />);
    const groupSelect = screen.getByLabelText(/blood group/i);
    fireEvent.change(groupSelect, { target: { value: "O-" } });

    // Should display O- request
    expect(screen.getByText("Metro General Hospital")).toBeInTheDocument();
  });

  it("displays empty state when no matching results exist", () => {
    render(<FindBloodPage />);
    const locationInput = screen.getByPlaceholderText(/e\.g\. new york/i);
    fireEvent.change(locationInput, { target: { value: "NonExistentCityXYZ" } });

    expect(screen.getByText(/no blood requests found/i)).toBeInTheDocument();
  });
});
