import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

describe("Alert Component", () => {
  it("renders alert with title and description", () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Critical Deficit</AlertTitle>
        <AlertDescription>O- Blood units are low.</AlertDescription>
      </Alert>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Critical Deficit")).toBeInTheDocument();
    expect(screen.getByText("O- Blood units are low.")).toBeInTheDocument();
  });
});
