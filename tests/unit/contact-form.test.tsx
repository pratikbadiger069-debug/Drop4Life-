import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ContactPage from "@/app/contact/page";

describe("Contact Form Interaction", () => {
  it("renders all required input fields", () => {
    render(<ContactPage />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your message/i)).toBeInTheDocument();
  });

  it("shows validation error on empty submit", () => {
    render(<ContactPage />);
    const submitBtn = screen.getByRole("button", { name: /submit inquiry/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/please enter your full name/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter your email address/i)).toBeInTheDocument();
  });

  it("successfully submits with valid fields", async () => {
    render(<ContactPage />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Aarav Sharma" } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "aarav.sharma@example.com" } });
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: "Blood donation query" } });
    fireEvent.change(screen.getByLabelText(/your message/i), { target: { value: "I would like to inquire about hosting a blood drive." } });

    const submitBtn = screen.getByRole("button", { name: /submit inquiry/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
    });
  });
});
