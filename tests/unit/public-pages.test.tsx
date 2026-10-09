import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HomePage from "@/app/page";
import HowItWorksPage from "@/app/how-it-works/page";
import AboutPage from "@/app/about/page";

import BloodCompatibilityPage from "@/app/blood-compatibility/page";

describe("Public Pages Rendering", () => {
  it("renders Landing Page with Drop4Life headline and tagline", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1, name: /every drop can save a life/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /donate blood/i })).toBeInTheDocument();
    const findBloodButtons = screen.getAllByRole("button", { name: /find blood/i });
    expect(findBloodButtons.length).toBeGreaterThan(0);
  });

  it("renders How It Works page with 3 role journeys", () => {
    render(<HowItWorksPage />);
    expect(screen.getByRole("heading", { level: 1, name: /how drop4life operates/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /the donor journey/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /the hospital & blood bank workflow/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /the ngo campaign coordination/i })).toBeInTheDocument();
  });

  it("renders About page with mission and core values", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { level: 1, name: /about drop4life/i })).toBeInTheDocument();
    expect(screen.getByText(/1\. trust & integrity/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. strict privacy/i)).toBeInTheDocument();
  });

  it("renders Blood Compatibility page with checker and educational guides", () => {
    render(<BloodCompatibilityPage />);
    expect(screen.getByRole("heading", { level: 1, name: /Blood Group Compatibility Checker/i })).toBeInTheDocument();
    expect(screen.getByText(/Mandatory Clinical Safety Notice/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Understanding Red Blood Cell Compatibility/i })).toBeInTheDocument();
  });
});

