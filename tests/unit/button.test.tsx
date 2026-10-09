import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("renders with default primary styles", () => {
    render(<Button>Donate Blood</Button>);
    const button = screen.getByRole("button", { name: /donate blood/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-primary");
  });

  it("renders destructive variant correctly", () => {
    render(<Button variant="destructive">Cancel Emergency</Button>);
    const button = screen.getByRole("button", { name: /cancel emergency/i });
    expect(button).toHaveClass("bg-destructive");
  });

  it("shows loading spinner when isLoading is true", () => {
    render(<Button isLoading>Submit Request</Button>);
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});
