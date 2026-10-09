import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "@/components/ui/badge";

describe("Badge Component", () => {
  it("renders badge text correctly", () => {
    render(<Badge>Emergency</Badge>);
    expect(screen.getByText("Emergency")).toBeInTheDocument();
  });

  it("renders status dot when dot prop is true", () => {
    const { container } = render(<Badge variant="destructive" dot>Critical</Badge>);
    const dot = container.querySelector(".rounded-full");
    expect(dot).toBeInTheDocument();
  });
});
