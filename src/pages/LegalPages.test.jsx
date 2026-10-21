import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Privacy from "./Privacy";
import Terms from "./Terms";
import { api } from "../utils/api";

vi.mock("../utils/api", () => ({
  api: { getActiveContract: vi.fn() },
}));

describe("legal information pages", () => {
  beforeEach(() => vi.clearAllMocks());

  it("makes the privacy policy readable and exposes legal footer links", () => {
    render(<MemoryRouter><Privacy /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Politique de confidentialité" })).toBeInTheDocument();
    expect(screen.getByText(/durées détaillées par catégorie sont en cours de formalisation/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Conditions d’utilisation" })).toHaveAttribute("href", "/legal/terms");
    expect(screen.getByRole("link", { name: "Politique de confidentialité" })).toHaveAttribute("href", "/legal/privacy");
  });

  it("makes the active terms page accessible", async () => {
    api.getActiveContract.mockResolvedValue({
      ok: true,
      json: async () => ({ title: "CGU WatYouFace", version: "v1", content: "Contenu des CGU" }),
    });
    render(<MemoryRouter><Terms /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Conditions d’utilisation" })).toBeInTheDocument();
    expect(await screen.findByText(/CGU WatYouFace — version v1/)).toBeInTheDocument();
    expect(screen.getByText("Contenu des CGU")).toBeInTheDocument();
  });
});
