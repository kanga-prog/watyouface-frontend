import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Profile from "./Profile";
import { api } from "../utils/api";

vi.mock("../utils/api", () => ({
  api: {
    getProfile: vi.fn(),
    getActiveContract: vi.fn(),
    updateUsername: vi.fn(),
    uploadAvatar: vi.fn(),
    downloadContract: vi.fn(),
    deleteOwnAccount: vi.fn(),
    exportMyData: vi.fn(),
    changeOwnEmail: vi.fn(),
    changeOwnPassword: vi.fn(),
    requestStepUp: vi.fn(),
    verifyStepUp: vi.fn(),
    errorMessage: vi.fn(),
  },
}));

describe("account erasure UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getProfile.mockResolvedValue({ id: 42, username: "privacy-user", email: "privacy@example.test", walletBalance: 0 });
    api.getActiveContract.mockResolvedValue({ ok: false });
  });

  it("requires a strong confirmation and calls the authenticated deletion API only after it", async () => {
    api.deleteOwnAccount.mockResolvedValue({ ok: true });
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<p>Login destination</p>} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText("privacy-user");
    fireEvent.click(screen.getByRole("button", { name: "Supprimer mon compte" }));
    const confirm = screen.getByLabelText("Saisissez SUPPRIMER pour confirmer");
    expect(screen.getByRole("button", { name: "Confirmer la suppression" })).toBeDisabled();
    fireEvent.change(confirm, { target: { value: "SUPPRIMER" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmer la suppression" }));

    await waitFor(() => expect(api.deleteOwnAccount).toHaveBeenCalledWith(42));
    expect(await screen.findByText("Login destination")).toBeInTheDocument();
  });

  it("downloads the authenticated JSON export and exposes failures accessibly", async () => {
    api.exportMyData.mockResolvedValue({ ok: true, blob: async () => new Blob(["{}"], { type: "application/json" }) });
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:export") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes><Route path="/profile" element={<Profile />} /></Routes>
      </MemoryRouter>,
    );

    await screen.findByText("privacy-user");
    fireEvent.click(screen.getByRole("button", { name: "Télécharger mes données" }));
    await waitFor(() => expect(api.exportMyData).toHaveBeenCalledOnce());
    await waitFor(() => expect(click).toHaveBeenCalledOnce());
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    click.mockRestore();

    api.exportMyData.mockResolvedValue({ ok: false, status: 503 });
    api.errorMessage.mockResolvedValue("Service indisponible");
    fireEvent.click(screen.getByRole("button", { name: "Télécharger mes données" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Service indisponible");
  });

  it("changes the email using the current password and announces success", async () => {
    api.requestStepUp.mockResolvedValue({ ok: true, status: 202, json: async () => ({ expiresAt: "2030-01-01T12:05:00Z" }) });
    api.verifyStepUp.mockResolvedValue({ ok: true, json: async () => ({ stepUpToken: "proof-token" }) });
    api.changeOwnEmail.mockResolvedValue({ ok: true, json: async () => ({ email: "new@example.test" }) });
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes><Route path="/profile" element={<Profile />} /></Routes>
      </MemoryRouter>,
    );

    await screen.findByText("privacy-user");
    fireEvent.click(screen.getByRole("button", { name: "Modifier mon e-mail" }));
    const email = screen.getByLabelText("Nouvel e-mail");
    const currentPasswordInput = screen.getByLabelText("Mot de passe actuel");
    expect(email).toHaveValue("");
    expect(currentPasswordInput).toHaveValue("");
    expect(currentPasswordInput).toHaveAttribute("autocomplete", "current-password");
    fireEvent.change(email, { target: { value: "new@example.test" } });
    fireEvent.change(currentPasswordInput, { target: { value: "CurrentPassword123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le code" }));
    await waitFor(() => expect(api.requestStepUp).toHaveBeenCalledWith("EMAIL_CHANGE", "CurrentPassword123!"));
    fireEvent.change(await screen.findByLabelText("Code de vérification (6 chiffres)"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Vérifier le code" }));
    await waitFor(() => expect(api.verifyStepUp).toHaveBeenCalledWith("EMAIL_CHANGE", "123456"));
    fireEvent.click(screen.getByRole("button", { name: "Confirmer le changement d’e-mail" }));

    await waitFor(() => expect(api.changeOwnEmail).toHaveBeenCalledWith({
      newEmail: "new@example.test",
      currentPassword: "CurrentPassword123!",
      stepUpToken: "proof-token",
    }));
    expect(await screen.findByRole("status")).toHaveTextContent("Votre adresse e-mail a été modifiée.");
    expect(screen.getAllByText("new@example.test").length).toBeGreaterThan(0);
  });

  it("announces an email conflict accessibly", async () => {
    api.requestStepUp.mockResolvedValue({ ok: false, status: 429 });
    api.changeOwnEmail.mockResolvedValue({ ok: false, status: 409 });
    api.errorMessage.mockResolvedValue("Cette adresse e-mail est déjà utilisée.");
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes><Route path="/profile" element={<Profile />} /></Routes>
      </MemoryRouter>,
    );

    await screen.findByText("privacy-user");
    fireEvent.click(screen.getByRole("button", { name: "Modifier mon e-mail" }));
    fireEvent.change(screen.getByLabelText("Nouvel e-mail"), { target: { value: "taken@example.test" } });
    fireEvent.change(screen.getByLabelText("Mot de passe actuel"), { target: { value: "CurrentPassword123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le code" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Cette adresse e-mail est déjà utilisée.");
  });

  it("shows OTP verification errors accessibly without exposing a proof", async () => {
    api.requestStepUp.mockResolvedValue({ ok: true, status: 202, json: async () => ({ expiresAt: "2030-01-01T12:05:00Z" }) });
    api.verifyStepUp.mockResolvedValue({ ok: false, status: 400 });
    api.errorMessage.mockResolvedValue("Code invalide ou expiré.");
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes><Route path="/profile" element={<Profile />} /></Routes>
      </MemoryRouter>,
    );

    await screen.findByText("privacy-user");
    fireEvent.click(screen.getByRole("button", { name: "Modifier mon e-mail" }));
    fireEvent.change(screen.getByLabelText("Nouvel e-mail"), { target: { value: "new@example.test" } });
    fireEvent.change(screen.getByLabelText("Mot de passe actuel"), { target: { value: "CurrentPassword123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le code" }));
    fireEvent.change(await screen.findByLabelText("Code de vérification (6 chiffres)"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Vérifier le code" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Code invalide ou expiré.");
    expect(api.changeOwnEmail).not.toHaveBeenCalled();
    expect(screen.queryByText("proof-token")).not.toBeInTheDocument();
  });

  it("keeps password inputs empty and uses password autocomplete semantics", async () => {
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes><Route path="/profile" element={<Profile />} /></Routes>
      </MemoryRouter>,
    );
    await screen.findByText("privacy-user");
    fireEvent.click(screen.getByRole("button", { name: "Modifier mon mot de passe" }));

    const current = screen.getByLabelText("Mot de passe actuel");
    const next = screen.getByLabelText("Nouveau mot de passe (12 à 128 caractères)");
    const confirmation = screen.getByLabelText("Confirmer le nouveau mot de passe");
    expect(current).toHaveValue("");
    expect(next).toHaveValue("");
    expect(confirmation).toHaveValue("");
    expect(current).toHaveAttribute("autocomplete", "current-password");
    expect(next).toHaveAttribute("autocomplete", "new-password");
    expect(confirmation).toHaveAttribute("autocomplete", "new-password");
  });

  it("changes the password and closes the current session", async () => {
    api.requestStepUp.mockResolvedValue({ ok: true, status: 202, json: async () => ({ expiresAt: "2030-01-01T12:05:00Z" }) });
    api.verifyStepUp.mockResolvedValue({ ok: true, json: async () => ({ stepUpToken: "proof-token" }) });
    api.changeOwnPassword.mockResolvedValue({ ok: true });
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<p>Login destination</p>} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByText("privacy-user");
    fireEvent.click(screen.getByRole("button", { name: "Modifier mon mot de passe" }));
    fireEvent.change(screen.getByLabelText("Mot de passe actuel"), { target: { value: "CurrentPassword123!" } });
    fireEvent.change(screen.getByLabelText("Nouveau mot de passe (12 à 128 caractères)"), { target: { value: "ReplacementPassword456!" } });
    fireEvent.change(screen.getByLabelText("Confirmer le nouveau mot de passe"), { target: { value: "ReplacementPassword456!" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le code" }));
    await waitFor(() => expect(api.requestStepUp).toHaveBeenCalledWith("PASSWORD_CHANGE", "CurrentPassword123!"));
    fireEvent.change(await screen.findByLabelText("Code de vérification (6 chiffres)"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Vérifier le code" }));
    await waitFor(() => expect(api.verifyStepUp).toHaveBeenCalledWith("PASSWORD_CHANGE", "123456"));
    fireEvent.click(screen.getByRole("button", { name: "Confirmer le changement de mot de passe" }));

    await waitFor(() => expect(api.changeOwnPassword).toHaveBeenCalledWith({
      currentPassword: "CurrentPassword123!",
      newPassword: "ReplacementPassword456!",
      confirmPassword: "ReplacementPassword456!",
      stepUpToken: "proof-token",
    }));
    expect(await screen.findByText("Login destination")).toBeInTheDocument();
  });

  it("announces a password change failure accessibly", async () => {
    api.requestStepUp.mockResolvedValue({ ok: false, status: 403 });
    api.errorMessage.mockResolvedValue("Le mot de passe actuel est incorrect.");
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes><Route path="/profile" element={<Profile />} /></Routes>
      </MemoryRouter>,
    );
    await screen.findByText("privacy-user");
    fireEvent.click(screen.getByRole("button", { name: "Modifier mon mot de passe" }));
    fireEvent.change(screen.getByLabelText("Mot de passe actuel"), { target: { value: "bad" } });
    fireEvent.change(screen.getByLabelText("Nouveau mot de passe (12 à 128 caractères)"), { target: { value: "ReplacementPassword456!" } });
    fireEvent.change(screen.getByLabelText("Confirmer le nouveau mot de passe"), { target: { value: "ReplacementPassword456!" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le code" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Le mot de passe actuel est incorrect.");
  });
});
