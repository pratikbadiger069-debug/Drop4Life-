import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrandLogo } from "@/components/branding/brand-logo";

describe("BrandLogo Component", () => {
  it("renders the official Drop4Life name", () => {
    render(<BrandLogo />);
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText(/drop/i)).toBeInTheDocument();
    expect(screen.getByText(/life/i)).toBeInTheDocument();
  });

  it("renders tagline when showTagline is enabled", () => {
    render(<BrandLogo showTagline={true} />);
    expect(screen.getByText(/every drop can save a life/i)).toBeInTheDocument();
  });
});
