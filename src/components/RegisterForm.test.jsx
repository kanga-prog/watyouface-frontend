import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterForm from "./RegisterForm";
import Contract from "../pages/Contract";
import { api } from "../utils/api";

vi.mock("../utils/api", () => ({
  api: {
    getActiveContract: vi.fn(),
    register: vi.fn(),
    errorMessage: vi.fn(),
  },
}));

function renderRegistrationFlow() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/contract" element={<Contract />} />
        <Route path="/login" element={<p>Login destination</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("registration flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getActiveContract.mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Contrat de démonstration", version: "v1", content: "Conditions" }),
    });
  });

  it("aligns browser field constraints with the RegisterRequest DTO", () => {
    renderRegistrationFlow();
    expect(screen.getByLabelText("Nom d'utilisateur")).toHaveAttribute("minLength", "3");
    expect(screen.getByLabelText("Nom d'utilisateur")).toHaveAttribute("maxLength", "50");
    expect(screen.getByLabelText("Adresse e-mail")).toHaveAttribute("maxLength", "255");
    expect(screen.getByPlaceholderText("Mot de passe")).toHaveAttribute("minLength", "12");
    expect(screen.getByPlaceholderText("Mot de passe")).toHaveAttribute("maxLength", "128");
  });

  it("sends the DTO-compatible payload after the user accepts the contract", async () => {
    api.register.mockResolvedValue({ ok: true });
    renderRegistrationFlow();
    fireEvent.change(screen.getByLabelText("Nom d'utilisateur"), { target: { value: "alice-demo" } });
    fireEvent.change(screen.getByLabelText("Adresse e-mail"), { target: { value: "alice@example.test" } });
    fireEvent.change(screen.getByPlaceholderText("Mot de passe"), { target: { value: "SecurePassword123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));

    await screen.findByText(/Contrat de démonstration/);
    fireEvent.click(screen.getByRole("button", { name: /Accepter/ }));

    await waitFor(() => expect(api.register).toHaveBeenCalledWith({
      username: "alice-demo",
      email: "alice@example.test",
      password: "SecurePassword123!",
      acceptTerms: true,
    }));
    expect(await screen.findByText("Login destination")).toBeInTheDocument();
  });

  it("shows the backend validation message for a rejected registration", async () => {
    api.register.mockResolvedValue({ ok: false });
    api.errorMessage.mockResolvedValue("password: Le mot de passe doit contenir entre 12 et 128 caractères");
    renderRegistrationFlow();
    fireEvent.change(screen.getByLabelText("Nom d'utilisateur"), { target: { value: "alice-demo" } });
    fireEvent.change(screen.getByLabelText("Adresse e-mail"), { target: { value: "alice@example.test" } });
    fireEvent.change(screen.getByPlaceholderText("Mot de passe"), { target: { value: "SecurePassword123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));
    await screen.findByText(/Contrat de démonstration/);
    fireEvent.click(screen.getByRole("button", { name: /Accepter/ }));

    expect(await screen.findByText(/password: Le mot de passe doit contenir entre 12 et 128 caractères/)).toBeInTheDocument();
  });
});
