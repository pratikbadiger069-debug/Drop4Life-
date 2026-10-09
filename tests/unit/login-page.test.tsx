import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginPage from "@/app/login/page";
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
  usePathname: () => "/login",
}));

describe("Login Page Interactions", () => {
  it("renders login form and quick demo buttons", () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    expect(screen.getByRole("heading", { name: /sign in to drop4life/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^donor$/i })).toBeInTheDocument();
  });

  it("autofills demo donor credentials when demo button is clicked", () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const donorDemoBtn = screen.getByRole("button", { name: /^donor$/i });
    fireEvent.click(donorDemoBtn);

    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    expect(emailInput.value).toBe("donor@drop4life.org");
    const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;
    expect(passwordInput.value).toBe("DonorPass123!");
  });

  it("shows error when submitting empty credentials", async () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const submitBtn = screen.getByRole("button", { name: /sign in to dashboard/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/please enter your email address/i)).toBeInTheDocument();
    });
  });
});
