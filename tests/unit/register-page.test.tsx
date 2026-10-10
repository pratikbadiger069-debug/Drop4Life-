import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RegisterPage from "@/app/register/page";
import { AuthProvider } from "@/lib/auth/auth-context";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
  usePathname: () => "/register",
}));

describe("Register Page Role Switcher & Forms", () => {
  it("renders 3 role cards for Donor, Hospital, and NGO", () => {
    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );

    expect(screen.getByRole("heading", { name: /create your drop4life account/i })).toBeInTheDocument();
    expect(screen.getByText("Voluntary Donor")).toBeInTheDocument();
    expect(screen.getByText("Hospital Facility")).toBeInTheDocument();
    expect(screen.getByText("NGO Coordinator")).toBeInTheDocument();
  });

  it("switches to Hospital registration form when Hospital role is selected", () => {
    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );

    const hospitalRoleBtn = screen.getByRole("radio", { name: /hospital facility/i });
    fireEvent.click(hospitalRoleBtn);

    expect(screen.getByLabelText(/hospital \/ medical center name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/medical facility license id/i)).toBeInTheDocument();
  });

  it("validates password mismatch on registration submit", async () => {
    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/full legal name/i), { target: { value: "Priya Reddy" } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "priya.reddy@example.com" } });
    fireEvent.change(screen.getByLabelText(/city \/ general region/i), { target: { value: "Hyderabad" } });
    fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "DifferentPassword456!" } });

    const submitBtn = screen.getByRole("button", { name: /complete registration/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
});
